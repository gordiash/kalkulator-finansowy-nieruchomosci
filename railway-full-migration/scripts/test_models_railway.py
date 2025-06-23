#!/usr/bin/env python3
"""
Test script to verify ML models work on Railway
"""

import os
import sys
import pickle
import json
import traceback
from pathlib import Path

def test_model_loading():
    """Test ładowania modeli"""
    print("🔬 Testing model loading...")
    
    models_dir = Path(__file__).parent.parent / 'models'
    print(f"📁 Models directory: {models_dir}")
    print(f"📁 Models directory exists: {models_dir.exists()}")
    
    if models_dir.exists():
        print("📁 Contents of models directory:")
        for file in models_dir.iterdir():
            print(f"  - {file.name} ({file.stat().st_size / 1024 / 1024:.1f}MB)")
    
    # Test ensemble model
    ensemble_path = models_dir / 'ensemble_optimized_0.78pct.pkl'
    print(f"\n🤖 Testing ensemble model: {ensemble_path}")
    print(f"🤖 Ensemble model exists: {ensemble_path.exists()}")
    
    if ensemble_path.exists():
        try:
            with open(ensemble_path, 'rb') as f:
                ensemble_model = pickle.load(f)
            print("✅ Ensemble model loaded successfully")
            print(f"✅ Model type: {type(ensemble_model)}")
            
            # Test prediction
            test_data = [
                [50, 2, 1, 2010, 3, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0]
            ]
            
            prediction = ensemble_model.predict(test_data)
            print(f"✅ Test prediction: {prediction[0]:,.0f} PLN")
            
        except Exception as e:
            print(f"❌ Failed to load ensemble model: {e}")
            traceback.print_exc()
    
    # Test RF model
    rf_path = models_dir / 'valuation_rf.pkl'
    print(f"\n🌲 Testing RF model: {rf_path}")
    print(f"🌲 RF model exists: {rf_path.exists()}")
    
    if rf_path.exists():
        try:
            with open(rf_path, 'rb') as f:
                rf_model = pickle.load(f)
            print("✅ RF model loaded successfully")
            print(f"✅ Model type: {type(rf_model)}")
            
        except Exception as e:
            print(f"❌ Failed to load RF model: {e}")
            traceback.print_exc()

def test_python_environment():
    """Test środowiska Python"""
    print("🐍 Testing Python environment...")
    print(f"🐍 Python version: {sys.version}")
    print(f"🐍 Python executable: {sys.executable}")
    print(f"🐍 Current working directory: {os.getcwd()}")
    
    try:
        import numpy as np
        print(f"✅ NumPy {np.__version__} imported")
    except ImportError as e:
        print(f"❌ NumPy import failed: {e}")
    
    try:
        import pandas as pd
        print(f"✅ Pandas {pd.__version__} imported")
    except ImportError as e:
        print(f"❌ Pandas import failed: {e}")
    
    try:
        import sklearn
        print(f"✅ Scikit-learn {sklearn.__version__} imported")
    except ImportError as e:
        print(f"❌ Scikit-learn import failed: {e}")
    
    try:
        import joblib
        print(f"✅ Joblib {joblib.__version__} imported")
    except ImportError as e:
        print(f"❌ Joblib import failed: {e}")

def test_ensemble_script():
    """Test ensemble script"""
    print("\n🎯 Testing ensemble script...")
    
    script_path = Path(__file__).parent / 'predict_ensemble_compatible.py'
    print(f"📝 Script path: {script_path}")
    print(f"📝 Script exists: {script_path.exists()}")
    
    if script_path.exists():
        print("✅ Ensemble script found")
    else:
        print("❌ Ensemble script not found")

def main():
    print("=" * 60)
    print("🚂 RAILWAY ML MODELS TEST")
    print("=" * 60)
    
    test_python_environment()
    print("\n" + "=" * 60)
    
    test_model_loading()
    print("\n" + "=" * 60)
    
    test_ensemble_script()
    print("\n" + "=" * 60)
    
    print("🏁 Test completed!")

if __name__ == '__main__':
    main() 