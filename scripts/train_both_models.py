"""Train both Random Forest and XGBoost models with identical preprocessing.

Usage:
    python scripts/train_both_models.py

This ensures both models are trained on exactly the same data and features.
"""
import os
import pickle
import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, RandomizedSearchCV, KFold
from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error, r2_score
from xgboost import XGBRegressor
from dotenv import load_dotenv
load_dotenv()


def get_connection_string():
    user = os.environ.get("MYSQL_USER")
    password = os.environ.get("MYSQL_PASSWORD")
    host = os.environ.get("MYSQL_HOST")
    port = os.environ.get("MYSQL_PORT", "3306")
    database = os.environ.get("MYSQL_DATABASE")
    return f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"


def load_data():
    """Load data from MySQL database"""
    engine = create_engine(get_connection_string())
    query = """
    SELECT 
        city, 
        district, 
        area, 
        rooms, 
        floor,
        year_of_construction AS year, 
        price 
    FROM nieruchomosci 
    WHERE price IS NOT NULL 
        AND area > 0 
        AND rooms > 0
        AND price > 50000
        AND price < 5000000
    """
    df = pd.read_sql(query, engine)
    
    # Basic cleanup
    df = df.dropna(subset=["city", "area", "rooms", "price"])
    df["area"] = df["area"].astype(float)
    df["rooms"] = df["rooms"].astype(int)
    df["year"] = df["year"].fillna(1990).astype(int)
    df["floor"] = df["floor"].fillna(0).astype(int)
    
    # Feature engineering
    df["building_age"] = 2024 - df["year"]
    df["rooms_per_area"] = df["rooms"] / df["area"]
    
    return df


def unified_preprocess(df: pd.DataFrame):
    """Unified preprocessing for both models"""
    
    print(f"Original data shape: {df.shape}")
    print(f"Cities: {df['city'].unique()}")
    print(f"Districts count: {df['district'].nunique()}")
    
    # One-hot encode categorical features with consistent handling
    cat_cols = ["city", "district"]
    df_encoded = pd.get_dummies(df, columns=cat_cols, drop_first=True, dummy_na=False)
    
    # Remove target and helper columns
    feature_cols = [col for col in df_encoded.columns 
                   if col not in ["price"]]
    
    X = df_encoded[feature_cols]
    y = df_encoded["price"]
    
    print(f"Final feature set ({X.shape[1]} features):")
    for i, col in enumerate(X.columns):
        print(f"  {i+1:2d}. {col}")
    
    return X, y


def train_random_forest(X_train, y_train, X_test, y_test):
    """Train Random Forest model"""
    print("\n🌲 Training Random Forest...")
    
    # Basic model
    rf = RandomForestRegressor(
        n_estimators=100,
        random_state=42,
        n_jobs=-1
    )
    
    # Hyperparameter tuning
    param_dist = {
        'n_estimators': [100, 200, 300],
        'max_depth': [10, 20, None],
        'min_samples_split': [2, 5],
        'min_samples_leaf': [1, 2],
        'max_features': ['sqrt', 0.8],
        'bootstrap': [True]
    }
    
    cv = KFold(n_splits=3, shuffle=True, random_state=42)  # Reduced for speed
    search = RandomizedSearchCV(
        rf, param_dist, n_iter=10, cv=cv,
        scoring='neg_mean_absolute_percentage_error',
        n_jobs=-1, random_state=42
    )
    
    search.fit(X_train, y_train)
    best_rf = search.best_estimator_
    
    # Evaluate
    y_pred = best_rf.predict(X_test)
    mape = mean_absolute_percentage_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    print(f"Random Forest - MAPE: {mape:.2%}, RMSE: {rmse:,.0f}, R²: {r2:.3f}")
    
    return best_rf, {
        'mape': mape,
        'rmse': rmse,
        'r2': r2,
        'best_params': search.best_params_
    }


def train_xgboost(X_train, y_train, X_test, y_test):
    """Train XGBoost model"""
    print("\n🚀 Training XGBoost...")
    
    # Basic model
    xgb = XGBRegressor(
        objective="reg:squarederror",
        n_estimators=100,
        random_state=42,
        n_jobs=-1
    )
    
    # Hyperparameter tuning
    param_dist = {
        "n_estimators": [100, 200, 300],
        "max_depth": [4, 6, 8],
        "learning_rate": [0.05, 0.1, 0.15],
        "subsample": [0.8, 1.0],
        "colsample_bytree": [0.8, 1.0],
    }
    
    cv = KFold(n_splits=3, shuffle=True, random_state=42)  # Reduced for speed
    search = RandomizedSearchCV(
        xgb, param_dist, n_iter=10, cv=cv,
        scoring='neg_mean_absolute_percentage_error',
        n_jobs=-1, random_state=42
    )
    
    search.fit(X_train, y_train)
    best_xgb = search.best_estimator_
    
    # Evaluate
    y_pred = best_xgb.predict(X_test)
    mape = mean_absolute_percentage_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    print(f"XGBoost - MAPE: {mape:.2%}, RMSE: {rmse:,.0f}, R²: {r2:.3f}")
    
    return best_xgb, {
        'mape': mape,
        'rmse': rmse,
        'r2': r2,
        'best_params': search.best_params_
    }


def save_model_with_metadata(model, metadata, model_path, model_name):
    """Save model and metadata"""
    
    # Create models directory
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    
    # Save model
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    print(f"✅ {model_name} saved to: {model_path}")
    
    # Save metadata
    meta_path = model_path + ".meta.txt"
    with open(meta_path, "w", encoding='utf-8') as f:
        f.write(f"Model: {model_name}\n")
        f.write(f"MAPE: {metadata['mape']:.4f}\n")
        f.write(f"RMSE: {metadata['rmse']:.0f}\n")
        f.write(f"R²: {metadata['r2']:.4f}\n")
        f.write(f"Features: {model.n_features_in_}\n")
        f.write(f"Best params: {metadata['best_params']}\n")


def compare_models(rf_metrics, xgb_metrics):
    """Compare model performance"""
    print(f"\n{'='*60}")
    print(f"🏆 MODEL COMPARISON RESULTS")
    print(f"{'='*60}")
    
    print(f"{'Model':<15} {'MAPE':<8} {'RMSE (k)':<10} {'R²':<8}")
    print(f"{'-'*50}")
    
    # Format values separately to avoid f-string issues
    rf_mape = f"{rf_metrics['mape']:.2%}"
    rf_rmse = f"{rf_metrics['rmse']/1000:.0f}"
    rf_r2 = f"{rf_metrics['r2']:.3f}"
    
    xgb_mape = f"{xgb_metrics['mape']:.2%}"
    xgb_rmse = f"{xgb_metrics['rmse']/1000:.0f}"
    xgb_r2 = f"{xgb_metrics['r2']:.3f}"
    
    print(f"{'Random Forest':<15} {rf_mape:<8} {rf_rmse:<10} {rf_r2}")
    print(f"{'XGBoost':<15} {xgb_mape:<8} {xgb_rmse:<10} {xgb_r2}")
    
    # Winner
    rf_better = rf_metrics['mape'] < xgb_metrics['mape']
    winner = "Random Forest" if rf_better else "XGBoost"
    winner_mape = rf_metrics['mape'] if rf_better else xgb_metrics['mape']
    
    print(f"\n🏆 WINNER: {winner} (MAPE: {winner_mape:.2%})")


def main():
    print("🔄 UNIFIED MODEL TRAINING")
    print("=" * 50)
    print("Training both Random Forest and XGBoost with identical preprocessing\n")
    
    # Load data
    print("📊 Loading data from MySQL...")
    df = load_data()
    print(f"Loaded {len(df):,} records")
    
    # Unified preprocessing
    print("\n🔧 Preprocessing data...")
    X, y = unified_preprocess(df)
    
    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"\nSplit: {len(X_train):,} train, {len(X_test):,} test samples")
    
    # Train both models
    rf_model, rf_metrics = train_random_forest(X_train, y_train, X_test, y_test)
    xgb_model, xgb_metrics = train_xgboost(X_train, y_train, X_test, y_test)
    
    # Save models
    print(f"\n💾 Saving models...")
    save_model_with_metadata(rf_model, rf_metrics, "models/valuation_rf.pkl", "RandomForestRegressor")
    save_model_with_metadata(xgb_model, xgb_metrics, "models/valuation_xgb.pkl", "XGBRegressor")
    
    # Compare results
    compare_models(rf_metrics, xgb_metrics)
    
    print(f"\n✅ Training completed successfully!")
    print(f"📁 Models saved in models/ directory")
    print(f"🔍 Run: python scripts/compare_models_simple.py")


if __name__ == "__main__":
    main() 