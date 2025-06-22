#!/usr/bin/env python3
"""
Skrypt do generowania raportu wydajności modelu Random Forest
Punkt 10.3 - Alerty gdy MAPE > 15%
"""

import pickle
import json
import os
import sys
from datetime import datetime
import pandas as pd
import numpy as np
from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error, r2_score

def load_model():
    """Ładuje wytrenowany model Random Forest"""
    model_path = 'models/random_forest_model.pkl'
    if not os.path.exists(model_path):
        print("❌ Model file not found!")
        return None, None, None
    
    try:
        with open(model_path, 'rb') as f:
            model_data = pickle.load(f)
        
        model = model_data['model']
        preprocessor = model_data['preprocessor']
        feature_names = model_data.get('feature_names', [])
        
        return model, preprocessor, feature_names
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return None, None, None

def load_test_data():
    """Ładuje dane testowe z ostatniego treningu"""
    test_data_path = 'models/test_data.pkl'
    if not os.path.exists(test_data_path):
        print("⚠️ Test data not found - skipping validation")
        return None, None
    
    try:
        with open(test_data_path, 'rb') as f:
            test_data = pickle.load(f)
        return test_data['X_test'], test_data['y_test']
    except Exception as e:
        print(f"❌ Error loading test data: {e}")
        return None, None

def calculate_metrics(y_true, y_pred):
    """Oblicza metryki wydajności modelu"""
    mape = mean_absolute_percentage_error(y_true, y_pred) * 100
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    
    # Średni błąd bezwzględny
    mae = np.mean(np.abs(y_true - y_pred))
    
    return {
        'mape': mape,
        'rmse': rmse,
        'r2': r2,
        'mae': mae
    }

def generate_performance_report():
    """Generuje raport wydajności modelu"""
    print("# 📊 Model Performance Report")
    print(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print("")
    
    # Ładuj model
    model, preprocessor, feature_names = load_model()
    if model is None:
        print("❌ **Status:** FAILED - Model not available")
        return False
    
    print("✅ **Model Status:** Loaded successfully")
    print(f"**Features:** {len(feature_names) if feature_names else 'Unknown'}")
    print("")
    
    # Ładuj dane testowe
    X_test, y_test = load_test_data()
    if X_test is None or y_test is None:
        print("⚠️ **Validation:** Skipped - No test data available")
        print("")
        return True
    
    try:
        # Predykcje na danych testowych
        y_pred = model.predict(X_test)
        
        # Oblicz metryki
        metrics = calculate_metrics(y_test, y_pred)
        
        print("## 📈 Performance Metrics")
        print(f"- **MAPE:** {metrics['mape']:.2f}%")
        print(f"- **RMSE:** {metrics['rmse']:,.0f} PLN")
        print(f"- **R²:** {metrics['r2']:.3f}")
        print(f"- **MAE:** {metrics['mae']:,.0f} PLN")
        print("")
        
        # Sprawdź czy MAPE przekracza próg
        mape_threshold = 15.0
        if metrics['mape'] > mape_threshold:
            print(f"🚨 **ALERT:** MAPE ({metrics['mape']:.2f}%) > {mape_threshold}%")
            print("**Action Required:** Model performance has degraded!")
            print("**Recommendations:**")
            print("- Check for data drift")
            print("- Retrain model with fresh data")
            print("- Review feature engineering")
            print("")
            return False
        else:
            print(f"✅ **Performance:** MAPE ({metrics['mape']:.2f}%) within acceptable range (<{mape_threshold}%)")
            print("")
        
        # Analiza błędów
        errors = np.abs(y_test - y_pred)
        error_percentiles = np.percentile(errors, [50, 75, 90, 95])
        
        print("## 📊 Error Distribution")
        print(f"- **Median Error:** {error_percentiles[0]:,.0f} PLN")
        print(f"- **75th Percentile:** {error_percentiles[1]:,.0f} PLN")  
        print(f"- **90th Percentile:** {error_percentiles[2]:,.0f} PLN")
        print(f"- **95th Percentile:** {error_percentiles[3]:,.0f} PLN")
        print("")
        
        # Analiza według przedziałów cenowych
        price_ranges = [
            (0, 300000, "Budget"),
            (300000, 600000, "Mid-range"), 
            (600000, 1000000, "Premium"),
            (1000000, float('inf'), "Luxury")
        ]
        
        print("## 🏠 Performance by Price Range")
        for min_price, max_price, label in price_ranges:
            mask = (y_test >= min_price) & (y_test < max_price)
            if np.sum(mask) > 0:
                range_mape = mean_absolute_percentage_error(y_test[mask], y_pred[mask]) * 100
                count = np.sum(mask)
                print(f"- **{label}** ({min_price:,}-{max_price:,} PLN): {range_mape:.1f}% MAPE ({count} samples)")
        print("")
        
        return True
        
    except Exception as e:
        print(f"❌ **Error during validation:** {e}")
        return False

def check_model_freshness():
    """Sprawdza czy model nie jest zbyt stary"""
    model_path = 'models/random_forest_model.pkl'
    if not os.path.exists(model_path):
        return False
    
    # Sprawdź datę modyfikacji pliku
    model_age_days = (datetime.now().timestamp() - os.path.getmtime(model_path)) / (24 * 3600)
    
    print("## ⏰ Model Freshness")
    print(f"- **Model Age:** {model_age_days:.1f} days")
    
    if model_age_days > 30:
        print("⚠️ **Warning:** Model is older than 30 days")
        print("**Recommendation:** Consider retraining with fresh data")
        return False
    else:
        print("✅ **Status:** Model is fresh")
        return True

def main():
    """Główna funkcja raportu"""
    try:
        # Generuj raport wydajności
        performance_ok = generate_performance_report()
        
        # Sprawdź świeżość modelu
        freshness_ok = check_model_freshness()
        
        # Podsumowanie
        print("## 🎯 Summary")
        if performance_ok and freshness_ok:
            print("✅ **Overall Status:** HEALTHY")
            print("**Next Action:** Continue monitoring")
        else:
            print("⚠️ **Overall Status:** ATTENTION REQUIRED")
            print("**Next Action:** Review and potentially retrain model")
        
        print("")
        print("---")
        print("*Report generated by automated CI/CD pipeline*")
        
        # Exit code dla CI/CD
        sys.exit(0 if performance_ok else 1)
        
    except Exception as e:
        print(f"❌ **Fatal Error:** {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 