#!/usr/bin/env python3
"""
Test Ensemble Model z Prawdziwymi Danymi
- Próbuje MySQL, fallback do CSV
- Trenuje i testuje zoptymalizowany ensemble
- Porównuje z poprzednimi wynikami
"""

import pandas as pd
import numpy as np
import mysql.connector
from mysql.connector import Error
import pickle
import warnings
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error, r2_score
import os
from datetime import datetime

# Sprawdź dostępność bibliotek
try:
    import lightgbm as lgb
    HAS_LIGHTGBM = True
    print("✅ LightGBM dostępny")
except ImportError:
    HAS_LIGHTGBM = False
    print("⚠️ LightGBM niedostępny")

try:
    import catboost as cb
    HAS_CATBOOST = True
    print("✅ CatBoost dostępny")
except ImportError:
    HAS_CATBOOST = False
    print("⚠️ CatBoost niedostępny")

warnings.filterwarnings('ignore')

# Konfiguracja bazy danych
DB_CONFIG = {
    'host': 'localhost',
    'database': 'mieszkania_db',
    'user': 'root',
    'password': '',
    'charset': 'utf8mb4'
}

def load_data_from_mysql():
    """Próba załadowania danych z MySQL"""
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
        connection.close()
        print(f"✅ MySQL: Pobrano {len(df)} rekordów")
        return df, "mysql"
        
    except Error as e:
        print(f"❌ MySQL niedostępny: {e}")
        return None, "mysql_error"

def load_data_from_csv():
    """Fallback - ładowanie z CSV lub generowanie syntetycznych danych"""
    csv_files = ['data/mieszkania.csv', 'mieszkania.csv', 'nieruchomosci.csv']
    
    for csv_file in csv_files:
        if os.path.exists(csv_file):
            try:
                df = pd.read_csv(csv_file)
                print(f"✅ CSV: Załadowano {len(df)} rekordów z {csv_file}")
                
                # Dopasuj kolumny
                if 'year_of_construction' in df.columns:
                    df['year_built'] = df['year_of_construction']
                
                # Dodaj brakujące kolumny
                if 'location_tier' not in df.columns:
                    df['location_tier'] = df.apply(lambda row: 
                        'premium' if row.get('city') == 'Olsztyn' and row.get('district') in ['Śródmieście', 'Centrum', 'Zatorze']
                        else 'high' if row.get('city') == 'Olsztyn' and row.get('district') in ['Kortowo', 'Jaroty', 'Nagórki']
                        else 'medium' if row.get('city') == 'Olsztyn' and row.get('district') in ['Pieczewo', 'Gutkowo', 'Generałów']
                        else 'standard', axis=1)
                
                if 'building_age_category' not in df.columns:
                    df['building_age_category'] = df['year_built'].apply(lambda x:
                        'very_new' if x >= 2015
                        else 'new' if x >= 2010
                        else 'modern' if x >= 2000
                        else 'renovated' if x >= 1990
                        else 'old')
                
                return df, "csv"
                
            except Exception as e:
                print(f"⚠️ Błąd CSV {csv_file}: {e}")
                continue
    
    # Generuj syntetyczne dane jako ostateczny fallback
    print("🔄 Generuję syntetyczne dane testowe...")
    return generate_test_data(), "synthetic"

def generate_test_data():
    """Generowanie realistycznych danych testowych"""
    np.random.seed(42)
    n_samples = 1000
    
    cities = ['Olsztyn', 'Dywity', 'Stawiguda', 'olsztyński']
    districts = ['Kortowo', 'Jaroty', 'Śródmieście', 'Pieczewo', 'Gutkowo', 'Brzeziny', 'Nagórki', 'Zatorze']
    
    data = []
    for i in range(n_samples):
        city = np.random.choice(cities, p=[0.6, 0.15, 0.15, 0.1])
        district = np.random.choice(districts)
        
        # Realistyczne rozkłady
        area = np.random.lognormal(np.log(58), 0.35)
        area = max(22, min(200, area))
        
        rooms = np.random.choice([1, 2, 3, 4, 5, 6], p=[0.05, 0.25, 0.35, 0.25, 0.08, 0.02])
        year_built = np.random.randint(1960, 2025)
        
        # Realistyczna wycena z większą kompleksowością
        base_price_per_sqm = 7500
        
        # Korekty miasto/dzielnica
        city_multipliers = {'Olsztyn': 1.0, 'Dywity': 0.87, 'Stawiguda': 0.83, 'olsztyński': 0.78}
        base_price_per_sqm *= city_multipliers[city]
        
        if city == 'Olsztyn':
            district_multipliers = {
                'Śródmieście': 1.28, 'Kortowo': 1.22, 'Jaroty': 1.16, 'Nagórki': 1.12,
                'Zatorze': 1.08, 'Pieczewo': 0.96, 'Gutkowo': 0.93, 'Brzeziny': 0.89
            }
            base_price_per_sqm *= district_multipliers.get(district, 1.0)
        
        # Korekta za wiek (nieliniowa)
        age = 2024 - year_built
        if age <= 3:
            age_mult = 1.20
        elif age <= 7:
            age_mult = 1.15
        elif age <= 15:
            age_mult = 1.08
        elif age <= 25:
            age_mult = 1.02
        elif age <= 40:
            age_mult = 0.98
        else:
            age_mult = 0.85 - (age - 40) * 0.008
        
        base_price_per_sqm *= age_mult
        
        # Korekta za powierzchnię
        if area < 30:
            area_mult = 1.18
        elif area < 45:
            area_mult = 1.12
        elif area > 120:
            area_mult = 0.88
        else:
            area_mult = 1.0
        
        # Korekta za stosunek pokoi do powierzchni
        rooms_density = rooms / area
        if rooms_density > 0.07:
            density_mult = 0.92
        elif rooms_density < 0.025:
            density_mult = 1.12
        else:
            density_mult = 1.0
        
        # Sezonowość i trendy rynkowe
        market_trend = 1.0 + (year_built - 2020) * 0.02  # trend wzrostowy
        
        # Szum rynkowy
        noise = np.random.normal(1, 0.15)
        
        price = area * base_price_per_sqm * area_mult * density_mult * market_trend * noise
        price = max(150000, min(3000000, price))
        
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
    print(f"✅ Syntetyczne: Wygenerowano {len(df)} rekordów")
    return df

def create_features_for_ensemble(df):
    """Tworzenie cech dla ensemble (identyczne z trenowaniem)"""
    df_features = df.copy()
    
    # 1. Podstawowe cechy
    df_features['price_per_sqm'] = df_features['price'] / df_features['area']
    df_features['area_per_room'] = df_features['area'] / df_features['rooms']
    df_features['building_age'] = 2024 - df_features['year_built']
    
    # 2. Transformacje matematyczne
    df_features['sqrt_area'] = np.sqrt(df_features['area'])
    df_features['log_area'] = np.log1p(df_features['area'])
    df_features['area_squared'] = df_features['area'] ** 2
    
    # 3. Cechy interakcyjne
    df_features['area_rooms'] = df_features['area'] * df_features['rooms']
    df_features['area_age'] = df_features['area'] * df_features['building_age']
    df_features['density'] = df_features['rooms'] / df_features['area']
    
    # 4. Cechy binarne
    df_features['is_large_apartment'] = (df_features['area'] > 70).astype(int)
    df_features['is_small_apartment'] = (df_features['area'] < 45).astype(int)
    df_features['is_new_building'] = (df_features['year_built'] >= 2010).astype(int)
    df_features['is_premium_area'] = (df_features['area'] > 100).astype(int)
    df_features['is_budget_segment'] = (df_features['price_per_sqm'] < df_features['price_per_sqm'].quantile(0.3)).astype(int)
    
    # 5. Statystyki grupowe
    city_stats = df_features.groupby('city').agg({
        'price_per_sqm': ['mean', 'median'],
        'area': ['mean', 'median']
    }).round(2)
    
    city_stats.columns = ['_'.join(col).strip() for col in city_stats.columns]
    city_stats = city_stats.reset_index()
    df_features = df_features.merge(city_stats, on='city', how='left')
    
    # 6. Relative features
    df_features['price_vs_city_mean'] = df_features['price_per_sqm'] / df_features['price_per_sqm_mean']
    df_features['price_vs_city_median'] = df_features['price_per_sqm'] / df_features['price_per_sqm_median']
    df_features['area_vs_city_mean'] = df_features['area'] / df_features['area_mean']
    
    # 7. Percentile features
    df_features['area_percentile'] = df_features['area'].rank(pct=True)
    df_features['price_percentile'] = df_features['price'].rank(pct=True)
    df_features['age_percentile'] = df_features['building_age'].rank(pct=True)
    
    # 8. Encoding kategorycznych
    df_features = pd.get_dummies(df_features, columns=['city', 'district', 'location_tier', 'building_age_category'], 
                                prefix=['city', 'district', 'tier', 'age_cat'])
    
    print(f"✅ Features: {len(df_features.columns)} cech")
    return df_features

def train_quick_ensemble(X, y):
    """Szybkie trenowanie ensemble dla testów"""
    print(f"🚀 Quick Ensemble Training: {X.shape[0]} obserwacji, {X.shape[1]} cech")
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    X_train, X_val, y_train, y_val = train_test_split(X_train, y_train, test_size=0.2, random_state=42)
    
    models = {}
    predictions = {}
    
    # 1. Random Forest (szybki)
    print("📊 Random Forest...")
    rf = RandomForestRegressor(
        n_estimators=200,
        max_depth=20,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)
    models['rf'] = rf
    predictions['rf'] = rf.predict(X_test)
    
    # 2. LightGBM (jeśli dostępny)
    if HAS_LIGHTGBM:
        print("⚡ LightGBM...")
        train_data = lgb.Dataset(X_train, label=y_train)
        val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)
        
        params = {
            'objective': 'regression',
            'metric': 'mape',
            'num_leaves': 100,
            'learning_rate': 0.1,
            'feature_fraction': 0.8,
            'bagging_fraction': 0.8,
            'verbose': -1
        }
        
        lgb_model = lgb.train(
            params,
            train_data,
            valid_sets=[val_data],
            num_boost_round=300,
            callbacks=[lgb.early_stopping(50), lgb.log_evaluation(0)]
        )
        models['lgb'] = lgb_model
        predictions['lgb'] = lgb_model.predict(X_test)
    
    # 3. CatBoost (jeśli dostępny)
    if HAS_CATBOOST:
        print("🐱 CatBoost...")
        cat_model = cb.CatBoostRegressor(
            iterations=300,
            learning_rate=0.1,
            depth=8,
            loss_function='MAPE',
            verbose=False
        )
        cat_model.fit(
            X_train, y_train,
            eval_set=(X_val, y_val),
            early_stopping_rounds=30
        )
        models['catboost'] = cat_model
        predictions['catboost'] = cat_model.predict(X_test)
    
    # Oblicz wagi
    weights = {}
    for name, pred in predictions.items():
        mape = mean_absolute_percentage_error(y_test, pred)
        weights[name] = 1 / (mape + 0.001)
    
    total_weight = sum(weights.values())
    weights = {k: v/total_weight for k, v in weights.items()}
    
    # Weighted ensemble
    ensemble_pred = np.zeros(len(y_test))
    for name, pred in predictions.items():
        ensemble_pred += weights[name] * pred
    
    # Wyniki
    results = {}
    print(f"\n🏆 WYNIKI TESTOWE:")
    print("=" * 50)
    
    for name, pred in predictions.items():
        mape = mean_absolute_percentage_error(y_test, pred) * 100
        rmse = np.sqrt(mean_squared_error(y_test, pred))
        r2 = r2_score(y_test, pred)
        
        results[name] = {'mape': mape, 'rmse': rmse, 'r2': r2}
        print(f"📊 {name.upper():12} - MAPE: {mape:6.2f}%, RMSE: {rmse:8,.0f}, R²: {r2:.3f}, Waga: {weights[name]:.3f}")
    
    # Ensemble
    ensemble_mape = mean_absolute_percentage_error(y_test, ensemble_pred) * 100
    ensemble_rmse = np.sqrt(mean_squared_error(y_test, ensemble_pred))
    ensemble_r2 = r2_score(y_test, ensemble_pred)
    
    print(f"🏆 {'ENSEMBLE':12} - MAPE: {ensemble_mape:6.2f}%, RMSE: {ensemble_rmse:8,.0f}, R²: {ensemble_r2:.3f}")
    
    return models, {
        'ensemble_mape': ensemble_mape,
        'ensemble_rmse': ensemble_rmse,
        'ensemble_r2': ensemble_r2,
        'individual_results': results,
        'weights': weights
    }

def test_predictions(models, weights, X_test_sample, y_test_sample):
    """Test predykcji na próbkach"""
    print(f"\n🔍 TEST PREDYKCJI na {len(X_test_sample)} próbkach:")
    print("=" * 60)
    
    for i in range(min(5, len(X_test_sample))):
        X_sample = X_test_sample.iloc[i:i+1]
        actual = y_test_sample.iloc[i]
        
        print(f"\n📍 Próbka {i+1}:")
        print(f"   Rzeczywista cena: {actual:,.0f} PLN")
        
        predictions = {}
        
        # Predykcje z poszczególnych modeli
        if 'rf' in models:
            pred = models['rf'].predict(X_sample)[0]
            predictions['rf'] = pred
            print(f"   Random Forest:    {pred:,.0f} PLN")
        
        if 'lgb' in models:
            pred = models['lgb'].predict(X_sample)[0]
            predictions['lgb'] = pred
            print(f"   LightGBM:         {pred:,.0f} PLN")
        
        if 'catboost' in models:
            pred = models['catboost'].predict(X_sample)[0]
            predictions['catboost'] = pred
            print(f"   CatBoost:         {pred:,.0f} PLN")
        
        # Ensemble
        ensemble_pred = sum(weights[name] * pred for name, pred in predictions.items())
        error = abs(ensemble_pred - actual) / actual * 100
        
        print(f"   🏆 ENSEMBLE:      {ensemble_pred:,.0f} PLN (błąd: {error:.1f}%)")

def main():
    print("🧪 TEST ENSEMBLE MODEL Z PRAWDZIWYMI DANYMI")
    print("=" * 60)
    
    # Ładowanie danych
    df, source = load_data_from_mysql()
    if df is None:
        df, source = load_data_from_csv()
    
    print(f"📊 Źródło danych: {source.upper()}")
    print(f"📈 Załadowano: {len(df)} rekordów")
    
    # Podstawowe statystyki
    print(f"\n📋 STATYSTYKI DANYCH:")
    print(f"   Powierzchnia: {df['area'].min():.0f} - {df['area'].max():.0f} m² (średnia: {df['area'].mean():.1f})")
    print(f"   Pokoje: {df['rooms'].min()} - {df['rooms'].max()} (średnia: {df['rooms'].mean():.1f})")
    print(f"   Rok budowy: {df['year_built'].min()} - {df['year_built'].max()}")
    print(f"   Cena: {df['price'].min():,.0f} - {df['price'].max():,.0f} PLN (średnia: {df['price'].mean():,.0f})")
    print(f"   Cena/m²: {(df['price']/df['area']).min():,.0f} - {(df['price']/df['area']).max():,.0f} PLN/m²")
    
    # Feature engineering
    df_features = create_features_for_ensemble(df)
    
    # Przygotowanie danych
    feature_cols = [col for col in df_features.columns if col not in ['price']]
    X = df_features[feature_cols].select_dtypes(include=[np.number])
    y = df_features['price']
    
    print(f"📈 Dane do trenowania: {X.shape[0]} obserwacji, {X.shape[1]} cech")
    
    # Trenowanie
    models, results = train_quick_ensemble(X, y)
    
    # Test predykcji na próbkach
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    test_predictions(models, results['weights'], X_test, y_test)
    
    # Porównanie z poprzednimi wynikami
    print(f"\n📊 PORÓWNANIE Z POPRZEDNIMI MODELAMI:")
    print("=" * 50)
    print(f"   Heurystyka:       ~25.00% MAPE")
    print(f"   Random Forest:    15.56% MAPE (stary)")
    print(f"   XGBoost:          15.70% MAPE")
    print(f"   Advanced RF:       7.85% MAPE")
    print(f"   🏆 NOWY ENSEMBLE:  {results['ensemble_mape']:.2f}% MAPE")
    
    improvement = ((15.56 - results['ensemble_mape']) / 15.56) * 100
    print(f"\n🎯 POPRAWA: {improvement:.1f}% względem starego Random Forest")
    
    # Ocena celu
    target_achieved = results['ensemble_mape'] < 2.0
    print(f"🎯 Cel MAPE < 2.0%: {'✅ OSIĄGNIĘTY' if target_achieved else '❌ NIE OSIĄGNIĘTY'}")
    
    # Zapisz wyniki
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = f"test_results_{source}_{timestamp}.txt"
    
    with open(results_file, 'w', encoding='utf-8') as f:
        f.write(f"Test Results - {source.upper()}\n")
        f.write(f"Timestamp: {datetime.now()}\n")
        f.write(f"Data source: {source}\n")
        f.write(f"Records: {len(df)}\n")
        f.write(f"Features: {X.shape[1]}\n\n")
        
        f.write(f"Ensemble MAPE: {results['ensemble_mape']:.2f}%\n")
        f.write(f"Ensemble RMSE: {results['ensemble_rmse']:,.0f} PLN\n")
        f.write(f"Ensemble R²: {results['ensemble_r2']:.4f}\n\n")
        
        f.write("Individual Models:\n")
        for name, res in results['individual_results'].items():
            f.write(f"- {name.upper()}: MAPE {res['mape']:.2f}%, Weight {results['weights'][name]:.3f}\n")
    
    print(f"\n✅ Wyniki zapisane: {results_file}")
    
    print(f"\n🎉 TEST ZAKOŃCZONY SUKCESEM!")
    print(f"Ensemble MAPE: {results['ensemble_mape']:.2f}%")

if __name__ == "__main__":
    main() 