"""Train Random Forest valuation model from MySQL data.

Usage:
    python scripts/train_random_forest_model.py --out models/valuation_rf.pkl

Env vars:
    MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_PORT
"""
import os
import argparse
import pickle
import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, RandomizedSearchCV, KFold
from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler
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
        AND price > 50000  -- usuń outliers
        AND price < 5000000
    """
    df = pd.read_sql(query, engine)
    
    # Basic cleanup
    df = df.dropna(subset=["city", "area", "rooms", "price"])
    df["area"] = df["area"].astype(float)
    df["rooms"] = df["rooms"].astype(int)
    df["year"] = df["year"].fillna(1990).astype(int)  # średni rok budowy
    df["floor"] = df["floor"].fillna(0).astype(int)
    
    # Feature engineering
    df["price_per_sqm"] = df["price"] / df["area"]
    df["rooms_per_area"] = df["rooms"] / df["area"]
    df["building_age"] = 2024 - df["year"]
    
    return df


def preprocess(df: pd.DataFrame):
    """Preprocessing danych dla Random Forest"""
    
    # One-hot encode categorical features
    cat_cols = ["city", "district"]
    df_encoded = pd.get_dummies(df, columns=cat_cols, drop_first=True)
    
    # Usuń target i pomocnicze kolumny
    feature_cols = [col for col in df_encoded.columns 
                   if col not in ["price", "price_per_sqm"]]
    
    X = df_encoded[feature_cols]
    y = df_encoded["price"]
    
    print(f"Features: {list(X.columns)}")
    print(f"Feature count: {X.shape[1]}")
    
    return X, y


def train_random_forest(X, y):
    """Trenowanie i optymalizacja Random Forest"""
    
    # Split danych
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"Training set: {X_train.shape[0]:,} samples")
    print(f"Test set: {X_test.shape[0]:,} samples")
    
    # Podstawowy model Random Forest
    rf_base = RandomForestRegressor(
        n_estimators=100,
        random_state=42,
        n_jobs=-1
    )
    
    # Hyperparameter tuning
    param_distributions = {
        'n_estimators': [100, 200, 300, 500],
        'max_depth': [10, 20, 30, None],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4],
        'max_features': ['sqrt', 'log2', 0.8],
        'bootstrap': [True, False]
    }
    
    print("Starting hyperparameter optimization...")
    
    # RandomizedSearch dla szybszego trenowania
    cv = KFold(n_splits=5, shuffle=True, random_state=42)
    random_search = RandomizedSearchCV(
        rf_base,
        param_distributions,
        n_iter=20,  # 20 kombinacji
        cv=cv,
        scoring='neg_mean_absolute_percentage_error',
        n_jobs=-1,
        verbose=1,
        random_state=42
    )
    
    random_search.fit(X_train, y_train)
    
    # Najlepszy model
    best_rf = random_search.best_estimator_
    
    print(f"Best parameters: {random_search.best_params_}")
    print(f"Best CV score: {-random_search.best_score_:.4f} MAPE")
    
    # Predykcje na zbiorze testowym
    y_pred = best_rf.predict(X_test)
    
    # Metryki
    mape = mean_absolute_percentage_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    print(f"\n=== Model Performance ===")
    print(f"Test MAPE: {mape:.2%}")
    print(f"Test RMSE: {rmse:,.0f} PLN")
    print(f"Test R²: {r2:.4f}")
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': X.columns,
        'importance': best_rf.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print(f"\n=== Top 10 Important Features ===")
    print(feature_importance.head(10).to_string(index=False))
    
    return best_rf, {
        'mape': mape,
        'rmse': rmse,
        'r2': r2,
        'feature_importance': feature_importance
    }


def save_model_and_metadata(model, metadata, model_path):
    """Zapisz model i metadane"""
    
    # Create models directory
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    
    # Save model
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    print(f"Model saved to: {model_path}")
    
    # Save metadata
    meta_path = model_path + ".meta.txt"
    with open(meta_path, "w", encoding='utf-8') as f:
        f.write(f"Model: Random Forest Regressor\n")
        f.write(f"MAPE: {metadata['mape']:.4f}\n")
        f.write(f"RMSE: {metadata['rmse']:.0f}\n")
        f.write(f"R²: {metadata['r2']:.4f}\n")
        f.write(f"Features: {model.n_features_in_}\n")
        f.write(f"Trees: {model.n_estimators}\n")
        f.write(f"\nTop Features:\n")
        for _, row in metadata['feature_importance'].head(5).iterrows():
            f.write(f"- {row['feature']}: {row['importance']:.4f}\n")
    
    print(f"Metadata saved to: {meta_path}")
    
    # Save feature importance CSV
    importance_path = model_path.replace('.pkl', '_feature_importance.csv')
    metadata['feature_importance'].to_csv(importance_path, index=False)
    print(f"Feature importance saved to: {importance_path}")


def test_model_prediction(model, X_sample):
    """Test prostej predykcji"""
    print(f"\n=== Test Prediction ===")
    
    # Przykładowe mieszkanie w Warszawie, 50m², 2 pokoje
    if len(X_sample) > 0:
        sample = X_sample.iloc[0:1]  # pierwszy wiersz
        prediction = model.predict(sample)[0]
        
        print(f"Sample prediction: {prediction:,.0f} PLN")
        print(f"Sample features shape: {sample.shape}")


def main():
    parser = argparse.ArgumentParser(description="Train Random Forest valuation model")
    parser.add_argument("--out", default="models/valuation_rf.pkl", 
                       help="Output model path")
    parser.add_argument("--compare", action="store_true",
                       help="Compare with existing XGBoost model")
    args = parser.parse_args()
    
    print("🌲 Random Forest Valuation Model Training")
    print("=" * 50)
    
    # Load and preprocess data
    print("📊 Loading data from MySQL...")
    df = load_data()
    print(f"Dataset loaded: {len(df):,} records")
    
    X, y = preprocess(df)
    print(f"Preprocessed: {X.shape[0]:,} samples, {X.shape[1]} features")
    
    # Train model
    print("\n🚀 Training Random Forest model...")
    model, metadata = train_random_forest(X, y)
    
    # Save everything
    save_model_and_metadata(model, metadata, args.out)
    
    # Test prediction
    test_model_prediction(model, X)
    
    print(f"\n✅ Training completed successfully!")
    print(f"📁 Model saved to: {args.out}")
    
    # Comparison suggestion
    if not args.compare:
        print(f"\n💡 Tip: Run with --compare to compare with XGBoost model")


if __name__ == "__main__":
    main() 