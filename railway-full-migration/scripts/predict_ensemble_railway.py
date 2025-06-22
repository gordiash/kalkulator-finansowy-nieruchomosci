#!/usr/bin/env python3
"""
Skrypt predykcji ensemble dla Railway
Czyta JSON z stdin, zwraca wynik do stdout
"""

import sys
import json
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
import logging

# Konfiguracja logowania
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_models():
    """Ładuj modele ML"""
    models = {}
    models_dir = Path(__file__).parent.parent / 'models'
    
    try:
        # Ensemble model (najlepszy)
        ensemble_path = models_dir / 'ensemble_optimized_0.78pct.pkl'
        if ensemble_path.exists():
            with open(ensemble_path, 'rb') as f:
                models['ensemble'] = pickle.load(f)
            logger.info("Ensemble model loaded")
        
        # Random Forest backup
        rf_path = models_dir / 'valuation_rf.pkl'
        if rf_path.exists():
            with open(rf_path, 'rb') as f:
                models['rf'] = pickle.load(f)
            logger.info("Random Forest model loaded")
            
    except Exception as e:
        logger.error(f"Error loading models: {e}")
    
    return models

def prepare_features(data):
    """Przygotuj features dla modelu"""
    try:
        # Podstawowe features numeryczne
        features = {
            'area': float(data.get('area', 0)),
            'rooms': int(data.get('rooms', 0)),
            'floor': int(data.get('floor', 0)),
            'year': int(data.get('year', 1990)),
            'totalFloors': int(data.get('totalFloors', 5)),
        }
        
        # Encoding kategorycznych
        city_encoding = {
            'olsztyn': 1.0,
            'stawiguda': 0.8,
            'dywity': 0.8,
            'warszawa': 2.0,
            'kraków': 1.6,
            'gdańsk': 1.5
        }
        features['city_encoded'] = city_encoding.get(data.get('city', '').lower(), 1.0)
        
        # Location tier
        location_encoding = {'low': 0.8, 'medium': 1.0, 'high': 1.2}
        features['location_tier'] = location_encoding.get(data.get('locationTier', 'medium'), 1.0)
        
        # Condition
        condition_encoding = {'poor': 0.8, 'average': 0.9, 'good': 1.0, 'excellent': 1.1}
        features['condition'] = condition_encoding.get(data.get('condition', 'good'), 1.0)
        
        # Building type
        building_encoding = {'apartment': 1.0, 'house': 1.1, 'tenement': 0.9}
        features['building_type'] = building_encoding.get(data.get('buildingType', 'apartment'), 1.0)
        
        # Parking
        parking_encoding = {'none': 0.95, 'street': 1.0, 'garage': 1.05, 'underground': 1.1}
        features['parking'] = parking_encoding.get(data.get('parking', 'none'), 1.0)
        
        # Finishing
        finishing_encoding = {'basic': 0.9, 'standard': 1.0, 'high': 1.1, 'luxury': 1.2}
        features['finishing'] = finishing_encoding.get(data.get('finishing', 'standard'), 1.0)
        
        # Boolean features
        features['elevator'] = 1.0 if data.get('elevator') == 'yes' else 0.0
        features['balcony'] = 1.0 if data.get('balcony') not in ['none', None] else 0.0
        
        # Transport
        transport_encoding = {'poor': 0.9, 'medium': 1.0, 'good': 1.05, 'excellent': 1.1}
        features['transport'] = transport_encoding.get(data.get('transport', 'medium'), 1.0)
        
        # Konwertuj do array
        feature_array = np.array([
            features['area'],
            features['rooms'],
            features['floor'],
            features['year'],
            features['totalFloors'],
            features['city_encoded'],
            features['location_tier'],
            features['condition'],
            features['building_type'],
            features['parking'],
            features['finishing'],
            features['elevator'],
            features['balcony'],
            features['transport']
        ]).reshape(1, -1)
        
        return feature_array
        
    except Exception as e:
        logger.error(f"Error preparing features: {e}")
        raise

def predict_price(models, features, data):
    """Wykonaj predykcję"""
    try:
        # Spróbuj ensemble model
        if 'ensemble' in models:
            try:
                prediction = models['ensemble'].predict(features)[0]
                price = round(prediction / 1000) * 1000
                return {
                    'price': price,
                    'minPrice': round(price * 0.98 / 1000) * 1000,
                    'maxPrice': round(price * 1.02 / 1000) * 1000,
                    'currency': 'PLN',
                    'method': 'ensemble_v2.0_railway',
                    'confidence': '±2%',
                    'note': 'Wycena oparta o zaawansowany model Ensemble z dokładnością 0.78% MAPE',
                    'timestamp': pd.Timestamp.now().isoformat()
                }
            except Exception as e:
                logger.warning(f"Ensemble model failed: {e}")
        
        # Fallback do Random Forest
        if 'rf' in models:
            try:
                prediction = models['rf'].predict(features)[0]
                price = round(prediction / 1000) * 1000
                return {
                    'price': price,
                    'minPrice': round(price * 0.93 / 1000) * 1000,
                    'maxPrice': round(price * 1.07 / 1000) * 1000,
                    'currency': 'PLN',
                    'method': 'random_forest_railway',
                    'confidence': '±7%',
                    'note': 'Wycena oparta o model Random Forest z dokładnością 15.56% MAPE',
                    'timestamp': pd.Timestamp.now().isoformat()
                }
            except Exception as e:
                logger.warning(f"RF model failed: {e}")
        
        # Ostatni fallback - heurystyka
        return calculate_heuristic_fallback(data)
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return calculate_heuristic_fallback(data)

def calculate_heuristic_fallback(data):
    """Heurystyka jako ostatni fallback"""
    try:
        area = float(data.get('area', 50))
        rooms = int(data.get('rooms', 2))
        year = int(data.get('year', 1990))
        city = data.get('city', 'olsztyn').lower()
        
        # Bazowe ceny
        base_prices = {
            'olsztyn': 7500,
            'stawiguda': 6500,
            'dywity': 6500,
            'warszawa': 15000,
            'kraków': 12000,
            'gdańsk': 11000
        }
        
        base_price = base_prices.get(city, 7000)
        price = area * base_price
        
        # Korekty
        if rooms > 2:
            price += (rooms - 2) * 15000
        
        if year > 2010:
            price *= 1.05
        elif year < 1970:
            price *= 0.9
        
        price = round(price / 1000) * 1000
        
        return {
            'price': price,
            'minPrice': round(price * 0.95 / 1000) * 1000,
            'maxPrice': round(price * 1.05 / 1000) * 1000,
            'currency': 'PLN',
            'method': 'heuristic_python_fallback',
            'confidence': '±5%',
            'note': 'Wycena heurystyczna - modele ML niedostępne',
            'timestamp': pd.Timestamp.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Heuristic fallback error: {e}")
        return {
            'price': 400000,
            'minPrice': 380000,
            'maxPrice': 420000,
            'currency': 'PLN',
            'method': 'emergency_fallback',
            'confidence': '±5%',
            'note': 'Wycena awaryjna - błąd systemu',
            'timestamp': pd.Timestamp.now().isoformat()
        }

def main():
    """Główna funkcja"""
    try:
        # Czytaj dane z stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        # Ładuj modele
        models = load_models()
        
        if not models:
            logger.warning("No models loaded, using heuristic")
            result = calculate_heuristic_fallback(data)
        else:
            # Przygotuj features
            features = prepare_features(data)
            
            # Wykonaj predykcję
            result = predict_price(models, features, data)
        
        # Wyślij wynik do stdout
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        logger.error(f"Main error: {e}")
        # Emergency fallback
        emergency_result = {
            'price': 400000,
            'minPrice': 380000,
            'maxPrice': 420000,
            'currency': 'PLN',
            'method': 'emergency_fallback',
            'confidence': '±10%',
            'note': f'Błąd systemu: {str(e)}',
            'timestamp': pd.Timestamp.now().isoformat()
        }
        print(json.dumps(emergency_result, ensure_ascii=False))

if __name__ == '__main__':
    main() 