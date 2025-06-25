#!/usr/bin/env python3
"""
Zoptymalizowany Model Ensemble dla Wyceny Nieruchomości
- LightGBM (najlepszy) + Random Forest + CatBoost
- Weighted averaging bazowany na wydajności
- Cel: MAPE < 2.0%
"""

import pandas as pd
import numpy as np
import mysql.connector
from mysql.connector import Error
import pickle
import warnings
from sklearn.model_selection import train_test_split, KFold
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error, r2_score
import optuna
from datetime import datetime
import os

# Sprawdź dostępność bibliotek
try:
    import lightgbm as lgb
    HAS_LIGHTGBM = True
except ImportError:
    print("⚠️ LightGBM nie jest zainstalowany")
    HAS_LIGHTGBM = False

try:
    import catboost as cb
    HAS_CATBOOST = True
except ImportError:
    print("⚠️ CatBoost nie jest zainstalowany")
    HAS_CATBOOST = False

warnings.filterwarnings('ignore')

# Konfiguracja bazy danych
DB_CONFIG = {
    'host': 'localhost',
    'database': 'mieszkania_db',
    'user': 'root',
    'password': '',
    'charset': 'utf8mb4'
}

def load_data_from_db():
    """Pobieranie danych z bazy MySQL z rozszerzonymi cechami"""
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        
        query = """
        SELECT 
            city, district, area, rooms, year_of_construction as year_built, price,
            CASE 
                WHEN city = 'Olsztyn' AND district IN ('Śródmieście', 'Centrum', 'Zatorze') THEN 'premium'
                WHEN city = 'Olsztyn' AND district IN ('Kortowo', 'Jaroty', 'Nagórki') THEN 'high'
                WHEN city = 'Olsztyn' AND district IN ('Pieczewo', 'Gutkowo', 'Generałów') THEN 'medium'
                ELSE 'standard'
            END as location_tier,
            CASE 
                WHEN year_of_construction >= 2015 THEN 'very_new'
                WHEN year_of_construction >= 2010 THEN 'new'
                WHEN year_of_construction >= 2000 THEN 'modern'
                WHEN year_of_construction >= 1990 THEN 'renovated'
                ELSE 'old'
            END as building_age_category
        FROM nieruchomosci 
        WHERE price IS NOT NULL 
        AND area > 0 
        AND rooms > 0 
        AND year_of_construction > 1950
        AND price BETWEEN 100000 AND 3000000
        """
        
        df = pd.read_sql(query, connection)
        print(f"✅ Pobrano {len(df)} rekordów z bazy danych")
        return df
        
    except Error as e:
        print(f"❌ Błąd połączenia z bazą: {e}")
        print("🔄 Próbuję załadować dane syntetyczne...")
        return load_synthetic_data()
    finally:
        if connection and connection.is_connected():
            connection.close()

def load_synthetic_data():
    """Generowanie syntetycznych danych do testowania modelu"""
    np.random.seed(42)
    n_samples = 800  # więcej danych dla lepszego trenowania
    
    cities = ['Olsztyn', 'Dywity', 'Stawiguda', 'olsztyński']
    districts = ['Kortowo', 'Jaroty', 'Śródmieście', 'Pieczewo', 'Gutkowo', 'Brzeziny', 'Nagórki', 'Zatorze']
    
    data = []
    for i in range(n_samples):
        city = np.random.choice(cities, p=[0.65, 0.15, 0.12, 0.08])
        district = np.random.choice(districts)
        
        # Realistyczne rozkłady z większą różnorodnością
        area = np.random.lognormal(np.log(55), 0.3)
        area = max(20, min(180, area))
        
        rooms = np.random.choice([1, 2, 3, 4, 5, 6], p=[0.08, 0.25, 0.35, 0.20, 0.10, 0.02])
        year_built = np.random.randint(1955, 2025)
        
        # Bardziej realistyczna wycena
        base_price_per_sqm = 7800
        
        # Korekty miasto/dzielnica
        city_multiplier = {'Olsztyn': 1.0, 'Dywity': 0.88, 'Stawiguda': 0.82, 'olsztyński': 0.75}
        base_price_per_sqm *= city_multiplier[city]
        
        if city == 'Olsztyn':
            district_multiplier = {
                'Śródmieście': 1.25, 'Kortowo': 1.20, 'Jaroty': 1.15, 'Nagórki': 1.10,
                'Zatorze': 1.05, 'Pieczewo': 0.98, 'Gutkowo': 0.95, 'Brzeziny': 0.92
            }
            base_price_per_sqm *= district_multiplier.get(district, 1.0)
        
        # Korekta za rok budowy (nieliniowa)
        age = 2024 - year_built
        if age <= 5:
            age_multiplier = 1.18
        elif age <= 10:
            age_multiplier = 1.12
        elif age <= 20:
            age_multiplier = 1.05
        elif age <= 35:
            age_multiplier = 1.0
        else:
            age_multiplier = 0.85 - (age - 35) * 0.005  # degradacja za starość
        
        base_price_per_sqm *= age_multiplier
        
        # Korekta za powierzchnię (ekonomia skali)
        if area < 35:
            area_multiplier = 1.15  # małe mieszkania droższe per m²
        elif area > 100:
            area_multiplier = 0.92  # duże mieszkania tańsze per m²
        else:
            area_multiplier = 1.0
        
        # Korekta za pokoje vs powierzchnia
        rooms_per_sqm = rooms / area
        if rooms_per_sqm > 0.06:  # za dużo pokoi na powierzchnię
            base_price_per_sqm *= 0.95
        elif rooms_per_sqm < 0.025:  # za mało pokoi (przestronne)
            base_price_per_sqm *= 1.08
        
        # Dodaj realistyczny szum
        noise = np.random.normal(1, 0.12)
        price = area * base_price_per_sqm * area_multiplier * noise
        price = max(180000, min(2500000, price))
        
        # Kategorie
        if city == 'Olsztyn' and district in ['Śródmieście', 'Centrum', 'Zatorze']:
            location_tier = 'premium'
        elif city == 'Olsztyn' and district in ['Kortowo', 'Jaroty', 'Nagórki']:
            location_tier = 'high'
        elif city == 'Olsztyn' and district in ['Pieczewo', 'Gutkowo', 'Generałów']:
            location_tier = 'medium'
        else:
            location_tier = 'standard'
            
        if year_built >= 2015:
            building_age_category = 'very_new'
        elif year_built >= 2010:
            building_age_category = 'new'
        elif year_built >= 2000:
            building_age_category = 'modern'
        elif year_built >= 1990:
            building_age_category = 'renovated'
        else:
            building_age_category = 'old'
        
        data.append({
            'city': city,
            'district': district,
            'area': round(area, 2),
            'rooms': rooms,
            'year_built': year_built,
            'price': round(price),
            'location_tier': location_tier,
            'building_age_category': building_age_category
        })
    
    df = pd.DataFrame(data)
    print(f"✅ Wygenerowano {len(df)} syntetycznych rekordów")
    return df

def create_optimized_features(df):
    """Tworzenie zoptymalizowanych cech (najważniejsze z poprzedniej analizy)"""
    df_features = df.copy()
    
    # 1. Podstawowe cechy
    df_features['price_per_sqm'] = df_features['price'] / df_features['area']
    df_features['area_per_room'] = df_features['area'] / df_features['rooms']
    df_features['building_age'] = 2024 - df_features['year_built']
    
    # 2. Top transformacje (z poprzedniej analizy)
    df_features['sqrt_area'] = np.sqrt(df_features['area'])
    df_features['log_area'] = np.log1p(df_features['area'])
    df_features['area_squared'] = df_features['area'] ** 2
    
    # 3. Top cechy interakcyjne
    df_features['area_rooms'] = df_features['area'] * df_features['rooms']
    df_features['area_age'] = df_features['area'] * df_features['building_age']
    df_features['density'] = df_features['rooms'] / df_features['area']
    
    # 4. Top cechy binarne
    df_features['is_large_apartment'] = (df_features['area'] > 70).astype(int)
    df_features['is_small_apartment'] = (df_features['area'] < 45).astype(int)
    df_features['is_new_building'] = (df_features['year_built'] >= 2010).astype(int)
    df_features['is_premium_area'] = (df_features['area'] > 100).astype(int)
    df_features['is_budget_segment'] = (df_features['price_per_sqm'] < df_features['price_per_sqm'].quantile(0.3)).astype(int)
    
    # 5. Statystyki grupowe (uproszczone)
    city_stats = df_features.groupby('city').agg({
        'price_per_sqm': ['mean', 'median'],
        'area': ['mean', 'median']
    }).round(2)
    
    city_stats.columns = ['_'.join(col).strip() for col in city_stats.columns]
    city_stats = city_stats.reset_index()
    df_features = df_features.merge(city_stats, on='city', how='left')
    
    # 6. Top relative features
    df_features['price_vs_city_mean'] = df_features['price_per_sqm'] / df_features['price_per_sqm_mean']
    df_features['price_vs_city_median'] = df_features['price_per_sqm'] / df_features['price_per_sqm_median']
    df_features['area_vs_city_mean'] = df_features['area'] / df_features['area_mean']
    
    # 7. Top percentile features
    df_features['area_percentile'] = df_features['area'].rank(pct=True)
    df_features['price_percentile'] = df_features['price'].rank(pct=True)
    df_features['age_percentile'] = df_features['building_age'].rank(pct=True)
    
    # 8. Encoding kategorycznych
    df_features = pd.get_dummies(df_features, columns=['city', 'district', 'location_tier', 'building_age_category'], 
                                prefix=['city', 'district', 'tier', 'age_cat'])
    
    print(f"✅ Optimized features: {len(df_features.columns)} cech")
    return df_features

def optimize_lightgbm_advanced(X_train, y_train, X_val, y_val):
    """Zaawansowana optymalizacja LightGBM"""
    def objective(trial):
        params = {
            'objective': 'regression',
            'metric': 'mape',
            'boosting_type': 'gbdt',
            'num_leaves': trial.suggest_int('num_leaves', 50, 300),
            'learning_rate': trial.suggest_float('learning_rate', 0.02, 0.2),
            'feature_fraction': trial.suggest_float('feature_fraction', 0.7, 1.0),
            'bagging_fraction': trial.suggest_float('bagging_fraction', 0.7, 1.0),
            'bagging_freq': trial.suggest_int('bagging_freq', 1, 7),
            'min_child_samples': trial.suggest_int('min_child_samples', 5, 50),
            'reg_alpha': trial.suggest_float('reg_alpha', 0, 5),
            'reg_lambda': trial.suggest_float('reg_lambda', 0, 5),
            'max_depth': trial.suggest_int('max_depth', 6, 20),
            'verbose': -1
        }
        
        train_data = lgb.Dataset(X_train, label=y_train)
        val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)
        
        model = lgb.train(
            params,
            train_data,
            valid_sets=[val_data],
            num_boost_round=2000,
            callbacks=[lgb.early_stopping(100), lgb.log_evaluation(0)]
        )
        
        y_pred = model.predict(X_val)
        mape = mean_absolute_percentage_error(y_val, y_pred)
        return mape
    
    study = optuna.create_study(direction='minimize')
    study.optimize(objective, n_trials=100)  # więcej prób
    
    return study.best_params

def train_optimized_ensemble(X, y):
    """Trenowanie zoptymalizowanego ensemble"""
    print(f"🚀 Trenowanie Optimized Ensemble z {X.shape[1]} cechami")
    
    # Podział danych
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    X_train, X_val, y_train, y_val = train_test_split(X_train, y_train, test_size=0.2, random_state=42)
    
    print(f"Train: {X_train.shape[0]}, Val: {X_val.shape[0]}, Test: {X_test.shape[0]}")
    
    models = {}
    predictions = {}
    
    # 1. Random Forest (zoptymalizowany)
    print("📊 Trenowanie Random Forest...")
    rf = RandomForestRegressor(
        n_estimators=500,  # więcej drzew
        max_depth=25,
        min_samples_split=3,
        min_samples_leaf=1,
        max_features='sqrt',
        bootstrap=True,
        oob_score=True,
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)
    models['rf'] = rf
    predictions['rf'] = rf.predict(X_test)
    
    # 2. LightGBM (najlepszy - więcej optymalizacji)
    if HAS_LIGHTGBM:
        print("⚡ Trenowanie LightGBM z zaawansowaną optymalizacją...")
        best_params = optimize_lightgbm_advanced(X_train, y_train, X_val, y_val)
        
        train_data = lgb.Dataset(X_train, label=y_train)
        val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)
        
        lgb_model = lgb.train(
            best_params,
            train_data,
            valid_sets=[val_data],
            num_boost_round=2000,
            callbacks=[lgb.early_stopping(100), lgb.log_evaluation(0)]
        )
        models['lgb'] = lgb_model
        predictions['lgb'] = lgb_model.predict(X_test)
    
    # 3. CatBoost (zoptymalizowany)
    if HAS_CATBOOST:
        print("🐱 Trenowanie CatBoost...")
        cat_model = cb.CatBoostRegressor(
            iterations=2000,
            learning_rate=0.05,
            depth=10,
            loss_function='MAPE',
            eval_metric='MAPE',
            l2_leaf_reg=3,
            random_seed=42,
            verbose=False
        )
        cat_model.fit(
            X_train, y_train,
            eval_set=(X_val, y_val),
            early_stopping_rounds=100
        )
        models['catboost'] = cat_model
        predictions['catboost'] = cat_model.predict(X_test)
    
    # Oblicz wagi na podstawie wydajności na zbiorze walidacyjnym
    print("🔗 Obliczanie optymalnych wag...")
    weights = {}
    val_predictions = {}
    
    for name, model in models.items():
        if name == 'rf':
            val_pred = model.predict(X_val)
        elif name == 'lgb':
            val_pred = model.predict(X_val)
        elif name == 'catboost':
            val_pred = model.predict(X_val)
        
        val_predictions[name] = val_pred
        mape = mean_absolute_percentage_error(y_val, val_pred)
        # Waga odwrotnie proporcjonalna do błędu
        weights[name] = 1 / (mape + 0.001)  # +0.001 żeby uniknąć dzielenia przez 0
    
    # Normalizuj wagi
    total_weight = sum(weights.values())
    weights = {k: v/total_weight for k, v in weights.items()}
    
    print("📊 Wagi modeli:")
    for name, weight in weights.items():
        print(f"   {name.upper()}: {weight:.3f}")
    
    # Weighted ensemble
    ensemble_pred = np.zeros(len(y_test))
    for name, pred in predictions.items():
        ensemble_pred += weights[name] * pred
    
    # Metryki dla każdego modelu
    results = {}
    for name, pred in predictions.items():
        mape = mean_absolute_percentage_error(y_test, pred) * 100
        rmse = np.sqrt(mean_squared_error(y_test, pred))
        r2 = r2_score(y_test, pred)
        
        results[name] = {'mape': mape, 'rmse': rmse, 'r2': r2}
        print(f"📊 {name.upper():12} - MAPE: {mape:6.2f}%, RMSE: {rmse:8,.0f}, R²: {r2:.3f}")
    
    # Metryki ensemble
    ensemble_mape = mean_absolute_percentage_error(y_test, ensemble_pred) * 100
    ensemble_rmse = np.sqrt(mean_squared_error(y_test, ensemble_pred))
    ensemble_r2 = r2_score(y_test, ensemble_pred)
    
    print(f"🏆 {'ENSEMBLE':12} - MAPE: {ensemble_mape:6.2f}%, RMSE: {ensemble_rmse:8,.0f}, R²: {ensemble_r2:.3f}")
    
    return models, {
        'individual_results': results,
        'ensemble_mape': ensemble_mape,
        'ensemble_rmse': ensemble_rmse,
        'ensemble_r2': ensemble_r2,
        'weights': weights,
        'test_predictions': predictions,
        'ensemble_predictions': ensemble_pred,
        'y_test': y_test
    }

def save_optimized_model(models, metadata, model_path):
    """Zapisz zoptymalizowany model"""
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    
    # Dodaj wagi do modeli
    models['weights'] = metadata['weights']
    
    with open(model_path, 'wb') as f:
        pickle.dump(models, f)
    
    print(f"✅ Optimized ensemble zapisany: {model_path}")
    
    # Metadane
    meta_path = model_path.replace('.pkl', '_meta.txt')
    with open(meta_path, 'w', encoding='utf-8') as f:
        f.write(f"Optimized EstymatorAI\n")
        f.write(f"========================\n")
        f.write(f"Ensemble MAPE: {metadata['ensemble_mape']:.2f}%\n")
        f.write(f"Ensemble RMSE: {metadata['ensemble_rmse']:,.0f} PLN\n")
        f.write(f"Ensemble R²: {metadata['ensemble_r2']:.4f}\n")
        f.write(f"Timestamp: {datetime.now()}\n\n")
        
        f.write("Model Weights:\n")
        for name, weight in metadata['weights'].items():
            f.write(f"- {name.upper()}: {weight:.3f}\n")
        
        f.write(f"\nIndividual Models:\n")
        for name, results in metadata['individual_results'].items():
            f.write(f"- {name.upper()}: MAPE {results['mape']:.2f}%, R² {results['r2']:.3f}\n")
    
    print(f"✅ Metadane zapisane: {meta_path}")

def main():
    print("🚀 ZOPTYMALIZOWANY ESTYMATORAI")
    print("=" * 60)
    print("Modele: LightGBM (główny) + Random Forest + CatBoost")
    print("Weighted averaging bazowany na wydajności")
    print("Cel: MAPE < 2.0%")
    print("=" * 60)
    
    # Ładowanie danych z bazy
    df = load_data_from_db()
    print(f"📊 Załadowano {len(df)} rekordów")
    
    # Feature engineering
    df_features = create_optimized_features(df)
    
    # Przygotowanie danych
    feature_cols = [col for col in df_features.columns if col not in ['price']]
    X = df_features[feature_cols].select_dtypes(include=[np.number])
    y = df_features['price']
    
    print(f"📈 Finalne dane: {X.shape[0]} obserwacji, {X.shape[1]} cech")
    
    # Trenowanie
    models, metadata = train_optimized_ensemble(X, y)
    
    # Zapisywanie
    model_path = f"models/ensemble_optimized_{metadata['ensemble_mape']:.2f}pct.pkl"
    save_optimized_model(models, metadata, model_path)
    
    print(f"\n🎉 SUKCES!")
    print(f"Optimized Ensemble MAPE: {metadata['ensemble_mape']:.2f}%")
    print(f"Cel < 2.0%: {'✅ OSIĄGNIĘTY' if metadata['ensemble_mape'] < 2.0 else '❌ NIE OSIĄGNIĘTY'}")
    
    if metadata['ensemble_mape'] < 2.0:
        print(f"🎯 NOWY REKORD! Poprzedni najlepszy: 3.03%")

if __name__ == "__main__":
    main() 