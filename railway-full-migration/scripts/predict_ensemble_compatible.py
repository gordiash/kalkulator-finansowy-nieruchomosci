#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Ensemble Model Compatible - dokładnie 27 cech jak w treningu
"""

import pandas as pd
import numpy as np
import pickle
import json
import sys
from pathlib import Path

# Fix dla Windows Unicode
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Sprawdź dostępność bibliotek
try:
    import lightgbm as lgb
    HAS_LIGHTGBM = True
except ImportError:
    HAS_LIGHTGBM = False

try:
    import catboost as cb
    HAS_CATBOOST = True
except ImportError:
    HAS_CATBOOST = False

def create_features_for_prediction(data):
    """Tworzenie dokładnie tych cech które oczekuje model (27)"""
    df = pd.DataFrame([data])
    
    # 1. Podstawowe cechy numeryczne
    df['area'] = df['area']
    df['rooms'] = df['rooms']
    df['year_built'] = df.get('year_built', 1990)
    
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
    
    # 7. POPRAWNE CECHY CENOWE - estymacja na podstawie lokalizacji
    estimated_price_per_sqm = stats['price_per_sqm_mean']
    
    # Korekty cenowe na podstawie charakterystyk
    if df['year_built'].iloc[0] >= 2015:
        estimated_price_per_sqm *= 1.15  # Nowe budynki +15%
    elif df['year_built'].iloc[0] >= 2010:
        estimated_price_per_sqm *= 1.10  # Nowsze +10%
    elif df['year_built'].iloc[0] >= 2000:
        estimated_price_per_sqm *= 1.05  # Nowoczesne +5%
    elif df['year_built'].iloc[0] < 1990:
        estimated_price_per_sqm *= 0.90  # Stare -10%
    
    # Korekty za wielkość
    if df['area'].iloc[0] > 80:
        estimated_price_per_sqm *= 1.05  # Duże mieszkania +5%
    elif df['area'].iloc[0] < 40:
        estimated_price_per_sqm *= 0.95  # Małe mieszkania -5%
    
    df['price_per_sqm'] = estimated_price_per_sqm
    
    # 8. Relative features
    df['area_vs_city_mean'] = df['area'] / df['area_mean']
    df['price_vs_city_mean'] = df['price_per_sqm'] / df['price_per_sqm_mean']
    df['price_vs_city_median'] = df['price_per_sqm'] / df['price_per_sqm_median']
    
    # 9. Percentile features (estymacja)
    df['area_percentile'] = np.clip((df['area'] - 30) / 70, 0, 1)  # 30-100m2 -> 0-1
    df['price_percentile'] = np.clip((df['price_per_sqm'] - 8000) / 8000, 0, 1)  # 8k-16k -> 0-1
    df['age_percentile'] = np.clip((2024 - df['year_built']) / 50, 0, 1)  # 0-50 lat -> 0-1
    
    # 10. Budget segment
    df['is_budget_segment'] = (df['price_per_sqm'] < 10000).astype(int)
    
    # 11. Tylko najważniejsze miasta (one-hot)
    df['city_Olsztyn'] = (df['city'] == 'Olsztyn').astype(int)
    df['city_Dywity'] = (df['city'] == 'Dywity').astype(int)
    df['city_Stawiguda'] = (df['city'] == 'Stawiguda').astype(int)
    df['city_olsztyński'] = (df['city'] == 'olsztyński').astype(int)
    
    # Usuń oryginalne kategoryczne
    df = df.drop(['city'], axis=1, errors='ignore')
    
    print(f"DEBUG: Utworzono {len(df.columns)} cech")
    print(f"DEBUG: Estimated price_per_sqm: {estimated_price_per_sqm:,.0f} PLN/m2")
    
    return df

def load_ensemble_model(model_path):
    """Ładowanie ensemble model"""
    try:
        with open(model_path, 'rb') as f:
            models = pickle.load(f)
        return models
    except Exception as e:
        print(f"BLAD ladowania modelu: {e}")
        return None

def predict_with_ensemble(models, features_df):
    """Predykcja z ensemble model - z feature matching"""
    predictions = {}
    
    print(f"DEBUG: Input features ({len(features_df.columns)}): {list(features_df.columns)}")
    
    # Random Forest
    if 'rf' in models:
        try:
            rf_model = models['rf']
            if hasattr(rf_model, 'feature_names_in_'):
                expected_features = rf_model.feature_names_in_
                print(f"DEBUG: RF expects ({len(expected_features)}): {list(expected_features)}")
                
                # Dopasuj kolumny
                missing_features = set(expected_features) - set(features_df.columns)
                extra_features = set(features_df.columns) - set(expected_features)
                
                if missing_features:
                    print(f"DEBUG: Dodaje brakujace cechy: {missing_features}")
                    for feature in missing_features:
                        features_df[feature] = 0
                
                if extra_features:
                    print(f"DEBUG: Usuwam nadmiarowe cechy: {extra_features}")
                    features_df = features_df.drop(columns=list(extra_features))
                
                # Sortuj kolumny jak oczekuje model
                features_df = features_df.reindex(columns=expected_features, fill_value=0)
                print(f"DEBUG: Final features ({len(features_df.columns)}): {list(features_df.columns)}")
            
            pred = rf_model.predict(features_df)[0]
            predictions['rf'] = pred
            print(f"OK Random Forest: {pred:,.0f} PLN")
        except Exception as e:
            print(f"UWAGA Blad Random Forest: {e}")
    
    # LightGBM - jeśli dostępny
    if 'lgb' in models and HAS_LIGHTGBM:
        try:
            pred = models['lgb'].predict(features_df)[0]
            predictions['lgb'] = pred
            print(f"OK LightGBM: {pred:,.0f} PLN")
        except Exception as e:
            print(f"UWAGA Blad LightGBM: {e}")
    elif 'lgb' in models:
        print("INFO: LightGBM pomijany - biblioteka niedostepna")
    
    # CatBoost - jeśli dostępny  
    if 'catboost' in models and HAS_CATBOOST:
        try:
            pred = models['catboost'].predict(features_df)[0]
            predictions['catboost'] = pred
            print(f"OK CatBoost: {pred:,.0f} PLN")
        except Exception as e:
            print(f"UWAGA Blad CatBoost: {e}")
    elif 'catboost' in models:
        print("INFO: CatBoost pomijany - biblioteka niedostepna")
    
    # Weighted ensemble
    if 'weights' in models and predictions:
        weights = models['weights']
        ensemble_pred = 0
        total_weight = 0
        
        print(f"DEBUG: Dostepne wagi: {weights}")
        print(f"DEBUG: Dostepne predykcje: {list(predictions.keys())}")
        
        for model_name, pred in predictions.items():
            if model_name in weights:
                weight = weights[model_name]
                ensemble_pred += weight * pred
                total_weight += weight
                print(f"   {model_name}: {pred:,.0f} PLN × {weight:.3f}")
        
        if total_weight > 0:
            ensemble_pred = ensemble_pred / total_weight
            print(f"OK Ensemble: {ensemble_pred:,.0f} PLN")
            return ensemble_pred, predictions
    
    # Fallback - average
    if predictions:
        avg_pred = np.mean(list(predictions.values()))
        print(f"OK Ensemble (average): {avg_pred:,.0f} PLN")
        return avg_pred, predictions
    
    return None, {}

def main():
    if len(sys.argv) < 2:
        print("Uzycie: python predict_ensemble_compatible.py <model_path> [json_input]")
        sys.exit(1)
    
    model_path = sys.argv[1]
    
    if not Path(model_path).exists():
        print(f"BLAD Model nie istnieje: {model_path}")
        sys.exit(1)
    
    # Ładuj model
    models = load_ensemble_model(model_path)
    if models is None:
        sys.exit(1)
    
    # Input danych
    if len(sys.argv) >= 3:
        try:
            input_data = json.loads(sys.argv[2])
        except json.JSONDecodeError as e:
            print(f"BLAD JSON: {e}")
            sys.exit(1)
    else:
        # Przykładowe dane
        input_data = {
            "city": "Olsztyn",
            "district": "Kortowo",
            "area": 60,
            "rooms": 3,
            "year_built": 2015
        }
        print("DEBUG: Uzywam przykladowych danych")
    
    print(f"DEBUG: Input data: {input_data}")
    
    # Tworzenie cech
    try:
        features_df = create_features_for_prediction(input_data)
        print(f"OK Utworzono {len(features_df.columns)} cech")
    except Exception as e:
        print(f"BLAD tworzenia cech: {e}")
        return None
    
    # Predykcja
    try:
        ensemble_pred, individual_preds = predict_with_ensemble(models, features_df)
        
        if ensemble_pred is None:
            print("BLAD Nie udalo sie wykonac predykcji")
            sys.exit(1)
        
        # Wyniki
        result = {
            "ensemble_prediction": round(ensemble_pred),
            "individual_predictions": {k: round(v) for k, v in individual_preds.items()},
            "input_data": input_data,
            "price_per_sqm": round(ensemble_pred / input_data['area']),
            "model_path": model_path,
            "feature_count": len(features_df.columns)
        }
        
        print("\nWYNIKI PREDYKCJI:")
        print("=" * 50)
        print(f"Ensemble: {result['ensemble_prediction']:,} PLN")
        print(f"Cena za m2: {result['price_per_sqm']:,} PLN/m2")
        print(f"Liczba cech: {result['feature_count']}")
        
        if individual_preds:
            print(f"\nPoszczegolne modele:")
            for model, pred in individual_preds.items():
                print(f"   {model.upper()}: {pred:,.0f} PLN")
        
        # JSON output
        print(f"\nJSON:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
    except Exception as e:
        print(f"BLAD predykcji: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main() 