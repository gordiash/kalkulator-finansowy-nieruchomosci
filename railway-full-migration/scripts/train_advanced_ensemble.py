#!/usr/bin/env python3
"""
Zaawansowany Model Ensemble dla Wyceny Nieruchomości
- LightGBM + CatBoost + Neural Network
- Stacking z meta-learner
- Cel: MAPE < 2.5%
"""

import pandas as pd
import numpy as np
import mysql.connector
from mysql.connector import Error
import pickle
import warnings
from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.ensemble import RandomForestRegressor, StackingRegressor
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error, r2_score
from sklearn.feature_selection import SelectKBest, f_regression, RFE
import optuna
from datetime import datetime
import os
import sys

# Sprawdź dostępność bibliotek
try:
    import lightgbm as lgb
    HAS_LIGHTGBM = True
except ImportError:
    print("⚠️ LightGBM nie jest zainstalowany - używam RandomForest")
    HAS_LIGHTGBM = False

try:
    import catboost as cb
    HAS_CATBOOST = True
except ImportError:
    print("⚠️ CatBoost nie jest zainstalowany - używam XGBoost")
    HAS_CATBOOST = False

try:
    from tensorflow import keras
    from tensorflow.keras import layers
    HAS_TENSORFLOW = True
except ImportError:
    print("⚠️ TensorFlow nie jest zainstalowany - używam tylko tree models")
    HAS_TENSORFLOW = False

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
    n_samples = 500
    
    # Miasta i dzielnice
    cities = ['Olsztyn', 'Dywity', 'Stawiguda', 'olsztyński']
    districts = ['Kortowo', 'Jaroty', 'Śródmieście', 'Pieczewo', 'Gutkowo', 'Brzeziny', 'Nagórki']
    
    data = []
    for i in range(n_samples):
        city = np.random.choice(cities, p=[0.7, 0.1, 0.1, 0.1])
        district = np.random.choice(districts)
        
        # Realistyczne rozkłady
        area = np.random.normal(60, 20)
        area = max(25, min(150, area))  # ograniczenia
        
        rooms = np.random.choice([1, 2, 3, 4, 5], p=[0.1, 0.3, 0.4, 0.15, 0.05])
        year_built = np.random.randint(1960, 2025)
        
        # Cena bazowana na realnych czynnikach
        base_price_per_sqm = 8000
        
        # Korekty cenowe
        if city == 'Olsztyn':
            if district in ['Śródmieście', 'Kortowo']:
                base_price_per_sqm *= 1.2
            elif district in ['Jaroty', 'Nagórki']:
                base_price_per_sqm *= 1.1
        elif city == 'Dywity':
            base_price_per_sqm *= 0.9
        elif city == 'Stawiguda':
            base_price_per_sqm *= 0.85
        else:
            base_price_per_sqm *= 0.8
            
        # Korekta za rok budowy
        if year_built >= 2015:
            base_price_per_sqm *= 1.15
        elif year_built >= 2010:
            base_price_per_sqm *= 1.1
        elif year_built >= 2000:
            base_price_per_sqm *= 1.05
        elif year_built < 1990:
            base_price_per_sqm *= 0.9
            
        # Korekta za liczbę pokoi
        if rooms == 1:
            base_price_per_sqm *= 1.1  # studio droższe per m²
        elif rooms >= 4:
            base_price_per_sqm *= 0.95
            
        # Dodaj szum
        noise = np.random.normal(1, 0.1)
        price = area * base_price_per_sqm * noise
        price = max(150000, min(2000000, price))  # ograniczenia
        
        # Location tier
        if city == 'Olsztyn' and district in ['Śródmieście', 'Centrum', 'Zatorze']:
            location_tier = 'premium'
        elif city == 'Olsztyn' and district in ['Kortowo', 'Jaroty', 'Nagórki']:
            location_tier = 'high'
        elif city == 'Olsztyn' and district in ['Pieczewo', 'Gutkowo', 'Generałów']:
            location_tier = 'medium'
        else:
            location_tier = 'standard'
            
        # Building age category
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

def create_ultra_advanced_features(df):
    """Tworzenie ultra-zaawansowanych cech"""
    df_features = df.copy()
    
    # 1. Podstawowe cechy
    df_features['price_per_sqm'] = df_features['price'] / df_features['area']
    df_features['area_per_room'] = df_features['area'] / df_features['rooms']
    df_features['building_age'] = 2024 - df_features['year_built']
    
    # 2. Transformacje matematyczne
    df_features['log_area'] = np.log1p(df_features['area'])
    df_features['log_price'] = np.log1p(df_features['price'])
    df_features['sqrt_area'] = np.sqrt(df_features['area'])
    df_features['cbrt_area'] = np.cbrt(df_features['area'])  # pierwiastek sześcienny
    df_features['area_squared'] = df_features['area'] ** 2
    df_features['area_cubed'] = df_features['area'] ** 3
    df_features['rooms_squared'] = df_features['rooms'] ** 2
    df_features['inv_area'] = 1 / (df_features['area'] + 1)  # odwrotność
    
    # 3. Trigonometryczne transformacje (cykliczne wzorce)
    df_features['sin_area'] = np.sin(df_features['area'] / 100)
    df_features['cos_area'] = np.cos(df_features['area'] / 100)
    df_features['sin_age'] = np.sin(df_features['building_age'] / 50)
    df_features['cos_age'] = np.cos(df_features['building_age'] / 50)
    
    # 4. Cechy interakcyjne (wszystkie kombinacje)
    df_features['area_rooms'] = df_features['area'] * df_features['rooms']
    df_features['area_age'] = df_features['area'] * df_features['building_age']
    df_features['rooms_age'] = df_features['rooms'] * df_features['building_age']
    df_features['area_rooms_age'] = df_features['area'] * df_features['rooms'] * df_features['building_age']
    df_features['price_per_sqm_age'] = df_features['price_per_sqm'] * df_features['building_age']
    df_features['density'] = df_features['rooms'] / df_features['area']
    df_features['space_efficiency'] = df_features['area'] / (df_features['rooms'] ** 2)
    
    # 5. Cechy binarne i kategorialne
    df_features['is_micro_apartment'] = (df_features['area'] < 30).astype(int)
    df_features['is_small_apartment'] = (df_features['area'] < 45).astype(int)
    df_features['is_medium_apartment'] = ((df_features['area'] >= 45) & (df_features['area'] < 70)).astype(int)
    df_features['is_large_apartment'] = (df_features['area'] >= 70).astype(int)
    df_features['is_luxury_apartment'] = (df_features['area'] > 100).astype(int)
    
    df_features['is_studio'] = (df_features['rooms'] == 1).astype(int)
    df_features['is_1bedroom'] = (df_features['rooms'] == 2).astype(int)
    df_features['is_2bedroom'] = (df_features['rooms'] == 3).astype(int)
    df_features['is_3bedroom'] = (df_features['rooms'] == 4).astype(int)
    df_features['is_family_apartment'] = (df_features['rooms'] >= 4).astype(int)
    
    df_features['is_very_new'] = (df_features['year_built'] >= 2015).astype(int)
    df_features['is_new_building'] = (df_features['year_built'] >= 2010).astype(int)
    df_features['is_modern_building'] = (df_features['year_built'] >= 2000).astype(int)
    df_features['is_old_building'] = (df_features['year_built'] < 1990).astype(int)
    df_features['is_communist_era'] = (df_features['year_built'] < 1989).astype(int)
    
    # 6. Statystyki grupowe (rozszerzone)
    city_stats = df_features.groupby('city').agg({
        'price_per_sqm': ['mean', 'std', 'median', 'min', 'max', 'quantile'],
        'area': ['mean', 'std', 'median', 'min', 'max'],
        'price': ['mean', 'std', 'median', 'min', 'max'],
        'building_age': ['mean', 'std', 'median']
    }).round(2)
    
    city_stats.columns = ['_'.join(col).strip() for col in city_stats.columns]
    city_stats = city_stats.reset_index()
    
    df_features = df_features.merge(city_stats, on='city', how='left')
    
    # Statystyki dla dzielnic
    district_stats = df_features.groupby('district').agg({
        'price_per_sqm': ['mean', 'median', 'count'],
        'area': ['mean', 'median']
    }).round(2)
    
    district_stats.columns = ['district_' + '_'.join(col).strip() for col in district_stats.columns]
    district_stats = district_stats.reset_index()
    
    df_features = df_features.merge(district_stats, on='district', how='left')
    
    # 7. Relative features (rozszerzone)
    df_features['price_vs_city_mean'] = df_features['price_per_sqm'] / df_features['price_per_sqm_mean']
    df_features['price_vs_city_median'] = df_features['price_per_sqm'] / df_features['price_per_sqm_median']
    df_features['price_vs_city_std'] = df_features['price_per_sqm'] / df_features['price_per_sqm_std']
    df_features['area_vs_city_mean'] = df_features['area'] / df_features['area_mean']
    df_features['area_vs_city_median'] = df_features['area'] / df_features['area_median']
    df_features['age_vs_city_mean'] = df_features['building_age'] / df_features['building_age_mean']
    
    # 8. Z-scores (standaryzowane)
    df_features['price_zscore'] = (df_features['price_per_sqm'] - df_features['price_per_sqm_mean']) / df_features['price_per_sqm_std']
    df_features['area_zscore'] = (df_features['area'] - df_features['area_mean']) / df_features['area_std']
    
    # 9. Percentile features (precyzyjne)
    df_features['area_percentile'] = df_features['area'].rank(pct=True)
    df_features['price_percentile'] = df_features['price'].rank(pct=True)
    df_features['age_percentile'] = df_features['building_age'].rank(pct=True)
    df_features['rooms_percentile'] = df_features['rooms'].rank(pct=True)
    
    # 10. Outlier indicators (rozszerzone)
    df_features['is_price_outlier_mild'] = (
        (df_features['price_per_sqm'] > df_features['price_per_sqm'].quantile(0.9)) |
        (df_features['price_per_sqm'] < df_features['price_per_sqm'].quantile(0.1))
    ).astype(int)
    
    df_features['is_price_outlier_extreme'] = (
        (df_features['price_per_sqm'] > df_features['price_per_sqm'].quantile(0.95)) |
        (df_features['price_per_sqm'] < df_features['price_per_sqm'].quantile(0.05))
    ).astype(int)
    
    df_features['is_area_outlier'] = (
        (df_features['area'] > df_features['area'].quantile(0.95)) |
        (df_features['area'] < df_features['area'].quantile(0.05))
    ).astype(int)
    
    # 11. Encoding kategorycznych
    df_features = pd.get_dummies(df_features, columns=['city', 'district', 'location_tier', 'building_age_category'], 
                                prefix=['city', 'district', 'tier', 'age_cat'])
    
    # 12. Polynomial features (wybrane)
    df_features['area_rooms_poly'] = df_features['area'] * df_features['rooms'] ** 2
    df_features['rooms_area_poly'] = df_features['rooms'] * df_features['area'] ** 2
    
    print(f"✅ Ultra-advanced features: {len(df_features.columns)} cech")
    return df_features

def create_neural_network(input_dim):
    """Tworzenie Neural Network dla ensemble"""
    if not HAS_TENSORFLOW:
        return None
        
    model = keras.Sequential([
        layers.Dense(256, activation='relu', input_shape=(input_dim,)),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        
        layers.Dense(128, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.2),
        
        layers.Dense(64, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.1),
        
        layers.Dense(32, activation='relu'),
        layers.Dense(1, activation='linear')
    ])
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='mse',
        metrics=['mae']
    )
    
    return model

def optimize_lightgbm(X_train, y_train, X_val, y_val):
    """Optymalizacja hiperparametrów LightGBM z Optuna"""
    def objective(trial):
        params = {
            'objective': 'regression',
            'metric': 'mape',
            'boosting_type': 'gbdt',
            'num_leaves': trial.suggest_int('num_leaves', 20, 200),
            'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3),
            'feature_fraction': trial.suggest_float('feature_fraction', 0.6, 1.0),
            'bagging_fraction': trial.suggest_float('bagging_fraction', 0.6, 1.0),
            'bagging_freq': trial.suggest_int('bagging_freq', 1, 7),
            'min_child_samples': trial.suggest_int('min_child_samples', 5, 100),
            'reg_alpha': trial.suggest_float('reg_alpha', 0, 10),
            'reg_lambda': trial.suggest_float('reg_lambda', 0, 10),
            'verbose': -1
        }
        
        train_data = lgb.Dataset(X_train, label=y_train)
        val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)
        
        model = lgb.train(
            params,
            train_data,
            valid_sets=[val_data],
            num_boost_round=1000,
            callbacks=[lgb.early_stopping(50), lgb.log_evaluation(0)]
        )
        
        y_pred = model.predict(X_val)
        mape = mean_absolute_percentage_error(y_val, y_pred)
        return mape
    
    study = optuna.create_study(direction='minimize')
    study.optimize(objective, n_trials=50)
    
    return study.best_params

def train_ensemble_model(X, y):
    """Trenowanie zaawansowanego modelu ensemble"""
    print(f"🚀 Trenowanie Ensemble Model z {X.shape[1]} cechami")
    
    # Podział danych
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    X_train, X_val, y_train, y_val = train_test_split(X_train, y_train, test_size=0.2, random_state=42)
    
    print(f"Train: {X_train.shape[0]}, Val: {X_val.shape[0]}, Test: {X_test.shape[0]}")
    
    # Skalowanie dla Neural Network
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)
    
    models = {}
    predictions = {}
    
    # 1. Random Forest (baseline)
    print("📊 Trenowanie Random Forest...")
    rf = RandomForestRegressor(
        n_estimators=300,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        max_features='sqrt',
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)
    models['rf'] = rf
    predictions['rf'] = rf.predict(X_test)
    
    # 2. LightGBM (jeśli dostępny)
    if HAS_LIGHTGBM:
        print("⚡ Trenowanie LightGBM z optymalizacją...")
        best_params = optimize_lightgbm(X_train, y_train, X_val, y_val)
        
        train_data = lgb.Dataset(X_train, label=y_train)
        val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)
        
        lgb_model = lgb.train(
            best_params,
            train_data,
            valid_sets=[val_data],
            num_boost_round=1000,
            callbacks=[lgb.early_stopping(50), lgb.log_evaluation(0)]
        )
        models['lgb'] = lgb_model
        predictions['lgb'] = lgb_model.predict(X_test)
    
    # 3. CatBoost (jeśli dostępny)
    if HAS_CATBOOST:
        print("🐱 Trenowanie CatBoost...")
        cat_model = cb.CatBoostRegressor(
            iterations=1000,
            learning_rate=0.1,
            depth=8,
            loss_function='MAPE',
            eval_metric='MAPE',
            random_seed=42,
            verbose=False
        )
        cat_model.fit(
            X_train, y_train,
            eval_set=(X_val, y_val),
            early_stopping_rounds=50
        )
        models['catboost'] = cat_model
        predictions['catboost'] = cat_model.predict(X_test)
    
    # 4. Neural Network (jeśli dostępny)
    if HAS_TENSORFLOW:
        print("🧠 Trenowanie Neural Network...")
        nn_model = create_neural_network(X_train_scaled.shape[1])
        
        early_stopping = keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=20,
            restore_best_weights=True
        )
        
        reduce_lr = keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=10,
            min_lr=0.0001
        )
        
        nn_model.fit(
            X_train_scaled, y_train,
            validation_data=(X_val_scaled, y_val),
            epochs=200,
            batch_size=32,
            callbacks=[early_stopping, reduce_lr],
            verbose=0
        )
        models['nn'] = nn_model
        models['scaler'] = scaler
        predictions['nn'] = nn_model.predict(X_test_scaled).flatten()
    
    # 5. Ensemble przez averaging
    print("🔗 Tworzenie ensemble...")
    ensemble_pred = np.mean(list(predictions.values()), axis=0)
    
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
        'test_predictions': predictions,
        'ensemble_predictions': ensemble_pred,
        'y_test': y_test
    }

def save_ensemble_model(models, metadata, model_path):
    """Zapisz ensemble model"""
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    
    # Zapisz wszystkie modele
    with open(model_path, 'wb') as f:
        pickle.dump(models, f)
    
    print(f"✅ Ensemble model zapisany: {model_path}")
    
    # Zapisz metadane
    meta_path = model_path.replace('.pkl', '_meta.txt')
    with open(meta_path, 'w', encoding='utf-8') as f:
        f.write(f"Advanced Ensemble Model\n")
        f.write(f"========================\n")
        f.write(f"Ensemble MAPE: {metadata['ensemble_mape']:.2f}%\n")
        f.write(f"Ensemble RMSE: {metadata['ensemble_rmse']:,.0f} PLN\n")
        f.write(f"Ensemble R²: {metadata['ensemble_r2']:.4f}\n")
        f.write(f"Timestamp: {datetime.now()}\n\n")
        
        f.write("Individual Models:\n")
        for name, results in metadata['individual_results'].items():
            f.write(f"- {name.upper()}: MAPE {results['mape']:.2f}%, R² {results['r2']:.3f}\n")
    
    print(f"✅ Metadane zapisane: {meta_path}")

def main():
    print("🚀 ZAAWANSOWANY ENSEMBLE MODEL")
    print("=" * 60)
    print("Modele: Random Forest + LightGBM + CatBoost + Neural Network")
    print("Cel: MAPE < 2.5%")
    print("=" * 60)
    
    # Ładowanie danych
    df = load_data_from_db()
    if df is None:
        print("❌ Nie udało się załadować danych")
        return
    
    print(f"📊 Załadowano {len(df)} rekordów")
    
    # Feature engineering
    df_features = create_ultra_advanced_features(df)
    
    # Przygotowanie danych
    feature_cols = [col for col in df_features.columns if col not in ['price']]
    X = df_features[feature_cols].select_dtypes(include=[np.number])
    y = df_features['price']
    
    print(f"📈 Finalne dane: {X.shape[0]} obserwacji, {X.shape[1]} cech")
    
    # Trenowanie
    models, metadata = train_ensemble_model(X, y)
    
    # Zapisywanie
    model_path = f"models/ensemble_advanced_{metadata['ensemble_mape']:.2f}pct.pkl"
    save_ensemble_model(models, metadata, model_path)
    
    print(f"\n🎉 SUKCES!")
    print(f"Ensemble MAPE: {metadata['ensemble_mape']:.2f}%")
    print(f"Cel < 2.5%: {'✅ OSIĄGNIĘTY' if metadata['ensemble_mape'] < 2.5 else '❌ NIE OSIĄGNIĘTY'}")

if __name__ == "__main__":
    main() 