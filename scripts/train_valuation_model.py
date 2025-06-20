"""Train advanced valuation model (Gradient Boosting / XGBoost) from MySQL data.

Usage:
    python scripts/train_valuation_model.py --out models/valuation_xgb.pkl

Env vars:
    MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_PORT
"""
import os
import argparse
import pickle
import pandas as pd
from sqlalchemy import create_engine
from sklearn.model_selection import train_test_split, RandomizedSearchCV, KFold
from sklearn.metrics import mean_absolute_percentage_error
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
    engine = create_engine(get_connection_string())
    query = "SELECT city, district, area, rooms, year_of_construction AS year, price FROM nieruchomosci WHERE price IS NOT NULL"
    df = pd.read_sql(query, engine)
    # Basic cleanup
    df = df.dropna(subset=["city", "area", "rooms", "price"])
    df["area"] = df["area"].astype(float)
    df["rooms"] = df["rooms"].astype(int)
    df["year"] = df["year"].fillna(0).astype(int)
    return df


def preprocess(df: pd.DataFrame):
    # One-hot encode categorical features
    cat_cols = ["city", "district"]
    df_encoded = pd.get_dummies(df, columns=cat_cols, drop_first=True)
    X = df_encoded.drop("price", axis=1)
    y = df_encoded["price"]
    return X, y


def train_model(X, y):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = XGBRegressor(objective="reg:squarederror", n_estimators=300, learning_rate=0.05, max_depth=6)

    # Hyper-parameter tuning
    param_dist = {
        "n_estimators": [200, 300, 400, 500],
        "max_depth": [4, 6, 8, 10],
        "learning_rate": [0.01, 0.05, 0.1],
        "subsample": [0.6, 0.8, 1.0],
        "colsample_bytree": [0.6, 0.8, 1.0],
    }
    cv = KFold(n_splits=5, shuffle=True, random_state=42)
    search = RandomizedSearchCV(model, param_dist, n_iter=20, cv=cv, scoring="neg_mean_absolute_percentage_error", n_jobs=-1, verbose=1)
    search.fit(X_train, y_train)

    best_model = search.best_estimator_
    preds = best_model.predict(X_test)
    mape = mean_absolute_percentage_error(y_test, preds)
    print(f"Validation MAPE: {mape:.2%}")

    return best_model, mape


def save_model(model, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        pickle.dump(model, f)
    print(f"Model saved to {path}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="models/valuation_xgb.pkl", help="Output model path")
    args = parser.parse_args()

    print("Loading data from MySQL…")
    df = load_data()
    X, y = preprocess(df)
    print(f"Dataset size: {len(df):,} rows, {X.shape[1]} features")

    print("Training model… (this may take a while)")
    model, mape = train_model(X, y)

    save_model(model, args.out)

    # Save simple metadata
    meta_path = args.out + ".meta.txt"
    with open(meta_path, "w") as f:
        f.write(f"MAPE={mape}\nrows={len(df)}")


if __name__ == "__main__":
    main() 