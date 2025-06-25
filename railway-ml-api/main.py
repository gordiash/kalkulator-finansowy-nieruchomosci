from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np
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
    allow_origins=["https://your-vercel-app.vercel.app", "http://localhost:3000"],
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
        input_features = prepare_features(data)
        price, method, confidence = get_prediction(input_features, data)
        
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

def prepare_features(data: ValuationRequest) -> np.ndarray:
    """Przygotuj features dla modelu ML"""
    # Tu będzie logika przygotowania features
    # Na razie uproszczona wersja
    features = [
        data.area,
        data.rooms,
        data.floor or 0,
        data.year or 1990,
        # Dodaj encoding dla kategorycznych
    ]
    return np.array(features).reshape(1, -1)

def get_prediction(features: np.ndarray, data: ValuationRequest):
    """Uzyskaj predykcję z najlepszego dostępnego modelu"""
    
    if ensemble_model is not None:
        try:
            prediction = ensemble_model.predict(features)[0]
            return round(prediction / 1000) * 1000, "ensemble_EstymatorAI_railway", 0.02
        except Exception as e:
            logger.warning(f"Ensemble model failed: {e}")
    
    if rf_model is not None:
        try:
            prediction = rf_model.predict(features)[0]
            return round(prediction / 1000) * 1000, "random_forest_railway", 0.07
        except Exception as e:
            logger.warning(f"RF model failed: {e}")
    
    if xgb_model is not None:
        try:
            prediction = xgb_model.predict(features)[0]
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