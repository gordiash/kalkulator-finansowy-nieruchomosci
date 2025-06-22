#!/usr/bin/env python3
"""
Prediction script for Random Forest valuation model.
Called from Next.js API to get property price predictions.

Usage:
    python scripts/predict_rf.py '{"city": "warszawa", "area": 50, "rooms": 2, "year": 2020}'
"""

import sys
import json
import pickle
import os
import pandas as pd
import numpy as np
from pathlib import Path

# Model path
MODEL_PATH = "models/valuation_rf.pkl"

def load_model():
    """Load the trained Random Forest model"""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
    
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    
    return model

def prepare_features(input_data):
    """
    Prepare features for Random Forest model prediction.
    Must match the preprocessing used during training with Olsztyn data.
    """
    
    # Base features - identyczne jak w trenowaniu
    features = {
        'area': float(input_data.get('area', 50)),
        'rooms': int(input_data.get('rooms', 2)),
        'floor': int(input_data.get('floor', 0)),
        'year': int(input_data.get('year', 1990)),
        'rooms_per_area': int(input_data.get('rooms', 2)) / float(input_data.get('area', 50)),
        'building_age': 2024 - int(input_data.get('year', 1990))
    }
    
    # City encoding - dokładnie jak w get_dummies z drop_first=True
    city = input_data.get('city', '').strip()
    features['city_Olsztyn'] = 1 if city == 'Olsztyn' else 0
    features['city_Stawiguda'] = 1 if city == 'Stawiguda' else 0
    features['city_olsztyński'] = 1 if city == 'olsztyński' else 0
    
    # District encoding - dokładnie jak w get_dummies z drop_first=True
    district = input_data.get('district', '').strip()
    
    # Wszystkie kolumny district z trenowania (alfabetycznie, bez pierwszej)
    features['district_Brzeziny'] = 1 if district == 'Brzeziny' else 0
    features['district_Dajtki'] = 1 if district == 'Dajtki' else 0
    features['district_Dywity'] = 1 if district == 'Dywity' else 0
    features['district_Gutkowo'] = 1 if district == 'Gutkowo' else 0
    features['district_Jaroty'] = 1 if district == 'Jaroty' else 0
    features['district_Kieźliny'] = 1 if district == 'Kieźliny' else 0
    features['district_Kormoran'] = 1 if district == 'Kormoran' else 0
    features['district_Kortowo'] = 1 if district == 'Kortowo' else 0
    features['district_Likusy'] = 1 if district == 'Likusy' else 0
    features['district_Nagórki'] = 1 if district == 'Nagórki' else 0
    features['district_Osiedle Generałów'] = 1 if district == 'Osiedle Generałów' else 0
    features['district_Osiedle Grunwaldzkie'] = 1 if district == 'Osiedle Grunwaldzkie' else 0
    features['district_Osiedle Kościuszki'] = 1 if district == 'Osiedle Kościuszki' else 0
    features['district_Osiedle Kętrzyńskiego'] = 1 if district == 'Osiedle Kętrzyńskiego' else 0
    features['district_Osiedle Mazurskie'] = 1 if district == 'Osiedle Mazurskie' else 0
    features['district_Osiedle Nad Jeziorem Długim'] = 1 if district == 'Osiedle Nad Jeziorem Długim' else 0
    features['district_Osiedle Wojska Polskiego'] = 1 if district == 'Osiedle Wojska Polskiego' else 0
    features['district_Pieczewo'] = 1 if district == 'Pieczewo' else 0
    features['district_Podgrodzie'] = 1 if district == 'Podgrodzie' else 0
    features['district_Podleśna'] = 1 if district == 'Podleśna' else 0
    features['district_Pojezierze'] = 1 if district == 'Pojezierze' else 0
    features['district_Redykajny'] = 1 if district == 'Redykajny' else 0
    features['district_Stawiguda'] = 1 if district == 'Stawiguda' else 0
    features['district_Zatorze'] = 1 if district == 'Zatorze' else 0
    features['district_Zielona Górka'] = 1 if district == 'Zielona Górka' else 0
    features['district_Śródmieście'] = 1 if district == 'Śródmieście' else 0
    
    return features

def predict_price(model, features):
    """Make prediction using the loaded model"""
    
    # Convert to DataFrame with correct column order
    # This should match the feature order used during training
    feature_df = pd.DataFrame([features])
    
    try:
        # Make prediction
        prediction = model.predict(feature_df)[0]
        
        # Ensure positive price
        prediction = max(prediction, 50000)  # Minimum 50k PLN
        
        return float(prediction)
        
    except Exception as e:
        raise Exception(f"Prediction failed: {str(e)}")

def main():
    try:
        # Get input from command line argument
        if len(sys.argv) != 2:
            raise ValueError("Usage: python predict_rf.py '<json_input>'")
        
        input_json = sys.argv[1]
        input_data = json.loads(input_json)
        
        # Load model
        model = load_model()
        
        # Prepare features
        features = prepare_features(input_data)
        
        # Make prediction
        predicted_price = predict_price(model, features)
        
        # Return result as JSON
        result = {
            'predicted_price': predicted_price,
            'features_used': list(features.keys()),
            'model_info': {
                'type': 'RandomForestRegressor',
                'n_estimators': getattr(model, 'n_estimators', 'unknown'),
                'n_features': getattr(model, 'n_features_in_', 'unknown')
            }
        }
        
        print(json.dumps(result))
        
    except FileNotFoundError as e:
        error_result = {
            'error': 'Model not found',
            'message': str(e),
            'suggestion': 'Train model first: python scripts/train_random_forest_model.py'
        }
        print(json.dumps(error_result))
        sys.exit(1)
        
    except json.JSONDecodeError as e:
        error_result = {
            'error': 'Invalid JSON input',
            'message': str(e)
        }
        print(json.dumps(error_result))
        sys.exit(1)
        
    except Exception as e:
        error_result = {
            'error': 'Prediction failed',
            'message': str(e)
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main() 