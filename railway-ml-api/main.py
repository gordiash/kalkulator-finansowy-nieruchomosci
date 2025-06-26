from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np
import pandas as pd
import os
from typing import Optional
import logging
from datetime import datetime
from contextlib import asynccontextmanager

# Import cache managera
from cache import cache_manager

# Konfiguracja logowania
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Globalne zmienne dla modeli
ensemble_model = None
rf_model = None
xgb_model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager dla aplikacji"""
    # Startup
    logger.info("🚀 Uruchamianie ML API...")
    
    # Inicjalizacja Redis cache
    await cache_manager.initialize()
    
    # Ładowanie modeli ML
    await load_models()
    
    yield
    
    # Shutdown
    logger.info("🛑 Zamykanie ML API...")
    await cache_manager.close()

app = FastAPI(
    title="Wycena Nieruchomości ML API",
    description="API do wyceny nieruchomości używając modeli ML z Redis Cache",
    version="2.0.0",
    lifespan=lifespan
)

# CORS dla Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://kalkulatorynieruchomosci.pl",      # Produkcja
        "https://*.vercel.app",                     # Wszystkie Vercel domeny
        "https://your-vercel-app.vercel.app",       # Template URL
        "http://localhost:3000",                    # Development
        "http://localhost:3001",                    # Alternative dev port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def load_models():
    """Ładuj modele przy starcie aplikacji"""
    global ensemble_model, rf_model, xgb_model
    
    try:
        # Ładuj modele z katalogu models/
        models_dir = "models"
        
        if os.path.exists(f"{models_dir}/ensemble_optimized_0.79pct.pkl"):
            with open(f"{models_dir}/ensemble_optimized_0.79pct.pkl", "rb") as f:
                ensemble_model = pickle.load(f)
            logger.info("✅ EstymatorAI model załadowany")
        
        if os.path.exists(f"{models_dir}/valuation_rf.pkl"):
            with open(f"{models_dir}/valuation_rf.pkl", "rb") as f:
                rf_model = pickle.load(f)
            logger.info("✅ Random Forest model załadowany")
            
        if os.path.exists(f"{models_dir}/valuation_xgb.pkl"):
            with open(f"{models_dir}/valuation_xgb.pkl", "rb") as f:
                xgb_model = pickle.load(f)
            logger.info("✅ XGBoost model załadowany")
            
    except Exception as e:
        logger.error(f"❌ Błąd ładowania modeli: {e}")

class ValuationRequest(BaseModel):
    city: str
    district: Optional[str] = ""
    area: float
    rooms: int
    floor: Optional[int] = 0
    year: Optional[int] = 1990
    locationTier: Optional[str] = "medium"
    condition: Optional[str] = "good"
    buildingType: Optional[str] = "apartment"
    parking: Optional[str] = "none"
    finishing: Optional[str] = "standard"
    elevator: Optional[str] = "no"
    balcony: Optional[str] = "none"
    orientation: Optional[str] = "unknown"
    transport: Optional[str] = "medium"
    totalFloors: Optional[int] = None

class ValuationResponse(BaseModel):
    price: float
    minPrice: float
    maxPrice: float
    currency: str
    method: str
    confidence: str
    note: str
    timestamp: str
    cached: Optional[bool] = False
    cache_timestamp: Optional[str] = None

@app.get("/")
async def read_root():
    """Root endpoint z informacjami o API i cache"""
    cache_stats = await cache_manager.get_cache_stats()
    
    return {
        "message": "Wycena Nieruchomości ML API v2.0",
        "status": "active",
        "models_loaded": {
            "ensemble": ensemble_model is not None,
            "random_forest": rf_model is not None,
            "xgboost": xgb_model is not None
        },
        "cache": {
            "enabled": cache_stats["cache_enabled"],
            "hit_rate": f"{cache_stats['hit_rate']}%",
            "total_requests": cache_stats["total_requests"]
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint dla Railway"""
    cache_health = await cache_manager.health_check()
    
    return {
        "status": "healthy", 
        "service": "ml-api",
        "cache": cache_health,
        "models": {
            "ensemble": ensemble_model is not None,
            "rf": rf_model is not None,
            "xgb": xgb_model is not None
        }
    }

@app.get("/cache/stats")
async def get_cache_stats():
    """Endpoint zwracający szczegółowe statystyki cache"""
    return await cache_manager.get_cache_stats()

@app.post("/cache/invalidate")
async def invalidate_cache(model_version: Optional[str] = None):
    """Endpoint do czyszczenia cache"""
    deleted_count = await cache_manager.invalidate_model_cache(model_version)
    return {
        "message": f"Usunięto {deleted_count} wpisów cache",
        "model_version": model_version or cache_manager.model_version
    }

@app.post("/predict", response_model=ValuationResponse)
async def predict_valuation(data: ValuationRequest):
    """Główny endpoint do wyceny nieruchomości z cache"""
    try:
        # Przygotuj dane do cache
        request_dict = data.dict()
        
        # 1. Sprawdź cache
        cached_result = await cache_manager.get_cached_prediction(request_dict)
        if cached_result:
            return ValuationResponse(**cached_result)
        
        # 2. Cache MISS - oblicz predykcję
        features_df = prepare_features(data)
        price, method, confidence = get_prediction(features_df, data)
        
        # 3. Przygotuj wynik
        min_price = round(price * (1 - confidence) / 1000) * 1000
        max_price = round(price * (1 + confidence) / 1000) * 1000
        
        result = {
            "price": price,
            "minPrice": min_price,
            "maxPrice": max_price,
            "currency": "PLN",
            "method": method,
            "confidence": f"±{round(confidence * 100)}%",
            "note": get_method_note(method),
            "timestamp": datetime.now().isoformat(),
            "cached": False
        }
        
        # 4. Zapisz do cache (asynchronicznie, nie blokuj odpowiedzi)
        await cache_manager.set_cached_prediction(request_dict, result)
        
        return ValuationResponse(**result)
        
    except Exception as e:
        logger.error(f"❌ Błąd predykcji: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/valuation-railway", response_model=ValuationResponse)
async def predict_valuation_railway(data: ValuationRequest):
    """Endpoint kompatybilny z Next.js - przekierowanie do predict"""
    logger.info("🚂 [Railway Compatibility] Wywołano endpoint /api/valuation-railway")
    return await predict_valuation(data)

def prepare_features(data: ValuationRequest) -> pd.DataFrame:
    """Przygotuj features dla modelu EstymatorAI (27 cech)"""
    
    # Konwersja na dict dla kompatybilności
    data_dict = {
        'city': data.city,
        'area': data.area,
        'rooms': data.rooms,
        'year_built': data.year or 1990
    }
    
    df = pd.DataFrame([data_dict])
    
    # 1. Podstawowe cechy numeryczne
    df['area'] = df['area']
    df['rooms'] = df['rooms']
    df['year_built'] = df['year_built']
    
    # 2. Wyprowadzone cechy
    df['area_per_room'] = df['area'] / df['rooms']
    df['building_age'] = 2024 - df['year_built']
    
    # 3. Podstawowe transformacje
    df['sqrt_area'] = np.sqrt(df['area'])
    df['log_area'] = np.log1p(df['area'])
    df['area_squared'] = df['area'] ** 2
    
    # 4. Cechy interakcyjne
    df['area_rooms'] = df['area'] * df['rooms']
    df['area_age'] = df['area'] * df['building_age']
    df['density'] = df['rooms'] / df['area']
    
    # 5. Cechy binarne
    df['is_large_apartment'] = (df['area'] > 70).astype(int)
    df['is_small_apartment'] = (df['area'] < 45).astype(int)
    df['is_new_building'] = (df['year_built'] >= 2010).astype(int)
    df['is_premium_area'] = (df['area'] > 100).astype(int)
    
    # 6. Statystyki grupowe - AKTUALNE CENY 2024
    city_stats = {
        'Olsztyn': {'price_per_sqm_mean': 12500, 'price_per_sqm_median': 12000, 'area_mean': 58, 'area_median': 55},
        'Dywity': {'price_per_sqm_mean': 10800, 'price_per_sqm_median': 10500, 'area_mean': 62, 'area_median': 60},
        'Stawiguda': {'price_per_sqm_mean': 10200, 'price_per_sqm_median': 9900, 'area_mean': 65, 'area_median': 62},
        'olsztyński': {'price_per_sqm_mean': 9500, 'price_per_sqm_median': 9200, 'area_mean': 68, 'area_median': 65}
    }
    
    city = df['city'].iloc[0]
    stats = city_stats.get(city, city_stats['Olsztyn'])
    
    for key, value in stats.items():
        df[key] = value
    
    # 7. Estymacja price_per_sqm
    estimated_price_per_sqm = stats['price_per_sqm_mean']
    
    # Korekty cenowe
    if df['year_built'].iloc[0] >= 2015:
        estimated_price_per_sqm *= 1.15
    elif df['year_built'].iloc[0] >= 2010:
        estimated_price_per_sqm *= 1.10
    elif df['year_built'].iloc[0] >= 2000:
        estimated_price_per_sqm *= 1.05
    elif df['year_built'].iloc[0] < 1990:
        estimated_price_per_sqm *= 0.90
    
    if df['area'].iloc[0] > 80:
        estimated_price_per_sqm *= 1.05
    elif df['area'].iloc[0] < 40:
        estimated_price_per_sqm *= 0.95
    
    df['price_per_sqm'] = estimated_price_per_sqm
    
    # 8. Relative features
    df['area_vs_city_mean'] = df['area'] / df['area_mean']
    df['price_vs_city_mean'] = df['price_per_sqm'] / df['price_per_sqm_mean']
    df['price_vs_city_median'] = df['price_per_sqm'] / df['price_per_sqm_median']
    
    # 9. Percentile features
    df['area_percentile'] = np.clip((df['area'] - 30) / 70, 0, 1)
    df['price_percentile'] = np.clip((df['price_per_sqm'] - 8000) / 8000, 0, 1)
    df['age_percentile'] = np.clip((2024 - df['year_built']) / 50, 0, 1)
    
    # 10. Budget segment
    df['is_budget_segment'] = (df['price_per_sqm'] < 10000).astype(int)
    
    # 11. City encoding (one-hot)
    df['city_Olsztyn'] = (df['city'] == 'Olsztyn').astype(int)
    df['city_Dywity'] = (df['city'] == 'Dywity').astype(int)
    df['city_Stawiguda'] = (df['city'] == 'Stawiguda').astype(int)
    df['city_olsztyński'] = (df['city'] == 'olsztyński').astype(int)
    
    # Usuń oryginalne kategoryczne
    df = df.drop(['city'], axis=1, errors='ignore')
    
    logger.info(f"✅ Przygotowano {len(df.columns)} cech dla EstymatorAI")
    
    return df

def get_prediction(features_df: pd.DataFrame, data: ValuationRequest):
    """Uzyskaj predykcję z najlepszego dostępnego modelu"""
    
    if ensemble_model is not None:
        try:
            # EstymatorAI ensemble - używa DataFrame
            if isinstance(ensemble_model, dict):
                # To jest ensemble model ze słownikiem modeli
                predictions = {}
                
                # Random Forest
                if 'rf' in ensemble_model:
                    try:
                        rf_pred = ensemble_model['rf'].predict(features_df)[0]
                        predictions['rf'] = rf_pred
                        logger.info(f"✅ RF prediction: {rf_pred:,.0f} PLN")
                    except Exception as e:
                        logger.warning(f"RF prediction failed: {e}")
                
                # LightGBM
                if 'lgb' in ensemble_model:
                    try:
                        lgb_pred = ensemble_model['lgb'].predict(features_df)[0]
                        predictions['lgb'] = lgb_pred
                        logger.info(f"✅ LGB prediction: {lgb_pred:,.0f} PLN")
                    except Exception as e:
                        logger.warning(f"LGB prediction failed: {e}")
                
                # CatBoost
                if 'catboost' in ensemble_model:
                    try:
                        cb_pred = ensemble_model['catboost'].predict(features_df)[0]
                        predictions['catboost'] = cb_pred
                        logger.info(f"✅ CatBoost prediction: {cb_pred:,.0f} PLN")
                    except Exception as e:
                        logger.warning(f"CatBoost prediction failed: {e}")
                
                # Weighted ensemble
                if 'weights' in ensemble_model and predictions:
                    weights = ensemble_model['weights']
                    ensemble_pred = 0
                    total_weight = 0
                    
                    for model_name, pred in predictions.items():
                        if model_name in weights:
                            weight = weights[model_name]
                            ensemble_pred += pred * weight
                            total_weight += weight
                    
                    if total_weight > 0:
                        final_pred = ensemble_pred / total_weight
                        logger.info(f"🎯 EstymatorAI Ensemble: {final_pred:,.0f} PLN")
                        return round(final_pred / 1000) * 1000, "ensemble_EstymatorAI_railway", 0.008
                
                # Jeśli mamy pojedyncze predykcje, użyj najlepszej
                if predictions:
                    best_pred = list(predictions.values())[0]
                    logger.info(f"🔄 Single model fallback: {best_pred:,.0f} PLN")
                    return round(best_pred / 1000) * 1000, "single_model_railway", 0.03
            
            # Próba bezpośredniej predykcji
            prediction = ensemble_model.predict(features_df)[0]
            return round(prediction / 1000) * 1000, "ensemble_EstymatorAI_railway", 0.008
            
        except Exception as e:
            logger.error(f"❌ Ensemble model failed: {e}")
    
    if rf_model is not None:
        try:
            prediction = rf_model.predict(features_df)[0]
            return round(prediction / 1000) * 1000, "random_forest_railway", 0.07
        except Exception as e:
            logger.warning(f"RF model failed: {e}")
    
    if xgb_model is not None:
        try:
            prediction = xgb_model.predict(features_df)[0]
            return round(prediction / 1000) * 1000, "xgboost_railway", 0.05
        except Exception as e:
            logger.warning(f"XGB model failed: {e}")
    
    # Fallback do heurystyki
    price = calculate_heuristic_price(data.city, data.area, data.rooms, data.year)
    return price, "heuristic_fallback", 0.05

def calculate_heuristic_price(city: str, area: float, rooms: int, year: Optional[int]) -> float:
    """Heurystyka jako fallback"""
    base_price_per_sqm = 7500  # Olsztyn
    
    if city.lower() == "olsztyn":
        base_price_per_sqm = 7500
    elif city.lower() in ["stawiguda", "dywity"]:
        base_price_per_sqm = 6500
    else:
        base_price_per_sqm = 7000
    
    price = area * base_price_per_sqm
    
    # Korekty
    if rooms > 2:
        price += (rooms - 2) * 15000
    
    if year and year > 2010:
        price *= 1.05
    elif year and year < 1970:
        price *= 0.9
    
    return round(price / 1000) * 1000

def get_method_note(method: str) -> str:
    """Zwróć opis metody"""
    notes = {
        "ensemble_EstymatorAI_railway": "Wycena oparta o zaawansowany EstymatorAI z dokładnością 0.79% MAPE",
        "random_forest_railway": "Wycena oparta o model Random Forest z dokładnością 15.56% MAPE", 
        "xgboost_railway": "Wycena oparta o model XGBoost",
        "heuristic_fallback": "Wycena heurystyczna - modele ML niedostępne"
    }
    return notes.get(method, "Nieznana metoda wyceny")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 