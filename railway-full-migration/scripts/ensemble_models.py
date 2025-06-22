#!/usr/bin/env python3
"""
Ensemble Methods dla wyceny mieszkań
Kombinacja: Random Forest + XGBoost + LightGBM + Stacking
Cel: MAPE < 12%
Autor: System AI
Data: 2024
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.ensemble import RandomForestRegressor, VotingRegressor, StackingRegressor
from sklearn.linear_model import LinearRegression, Ridge, ElasticNet
from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error, r2_score
import mysql.connector
from mysql.connector import Error
import pickle
import warnings
warnings.filterwarnings('ignore')

# Próba importu XGBoost i LightGBM
try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    print("⚠️ XGBoost nie jest zainstalowany")
    XGBOOST_AVAILABLE = False

try:
    import lightgbm as lgb
    LIGHTGBM_AVAILABLE = True
except ImportError:
    print("⚠️ LightGBM nie jest zainstalowany")
    LIGHTGBM_AVAILABLE = False

# Konfiguracja bazy danych
DB_CONFIG = {
    'host': 'localhost',
    'database': 'mieszkania_db',
    'user': 'root',
    'password': ''
}

def load_and_prepare_data():
    """Załadowanie i przygotowanie danych"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        
        query = """
        SELECT 
            city, district, area, rooms, year_built, price,
            CASE 
                WHEN city = 'Olsztyn' AND district IN ('Śródmieście', 'Centrum', 'Zatorze') THEN 'premium'
                WHEN city = 'Olsztyn' AND district IN ('Kortowo', 'Jaroty', 'Nagórki') THEN 'high'
                WHEN city = 'Olsztyn' AND district IN ('Pieczewo', 'Gutkowo', 'Generałów') THEN 'medium'
                ELSE 'standard'
            END as location_tier
        FROM mieszkania 
        WHERE price IS NOT NULL 
        AND area > 0 
        AND rooms > 0 
        AND year_built > 1950
        AND price BETWEEN 100000 AND 2000000
        ORDER BY id
        """
        
        df = pd.read_sql(query, connection)
        print(f"✅ Pobrano {len(df)} rekordów z bazy danych")
        
        # Feature engineering
        df_features = create_advanced_features(df)
        
        return df_features
        
    except Error as e:
        print(f"❌ Błąd połączenia z bazą: {e}")
        return None
    finally:
        if connection and connection.is_connected():
            connection.close()

def create_advanced_features(df):
    """Zaawansowane feature engineering dla ensemble"""
    df_features = df.copy()
    
    # Podstawowe cechy
    df_features['price_per_sqm'] = df_features['price'] / df_features['area']
    df_features['area_per_room'] = df_features['area'] / df_features['rooms']
    df_features['building_age'] = 2024 - df_features['year_built']
    
    # Transformacje
    df_features['log_area'] = np.log1p(df_features['area'])
    df_features['log_price_per_sqm'] = np.log1p(df_features['price_per_sqm'])
    df_features['sqrt_area'] = np.sqrt(df_features['area'])
    df_features['area_squared'] = df_features['area'] ** 2
    
    # Interakcje
    df_features['area_rooms_interaction'] = df_features['area'] * df_features['rooms']
    df_features['age_area_interaction'] = df_features['building_age'] * df_features['area']
    df_features['rooms_age_interaction'] = df_features['rooms'] * df_features['building_age']
    df_features['price_per_sqm_rooms'] = df_features['price_per_sqm'] * df_features['rooms']
    
    # Cechy binarne
    df_features['is_large_apartment'] = (df_features['area'] > df_features['area'].quantile(0.8)).astype(int)
    df_features['is_small_apartment'] = (df_features['area'] < df_features['area'].quantile(0.2)).astype(int)
    df_features['is_new_building'] = (df_features['year_built'] >= 2010).astype(int)
    df_features['is_old_building'] = (df_features['year_built'] < 1990).astype(int)
    df_features['is_studio'] = (df_features['rooms'] == 1).astype(int)
    df_features['is_family_apartment'] = (df_features['rooms'] >= 4).astype(int)
    
    # Encoding kategorycznych
    df_features = pd.get_dummies(df_features, columns=['city', 'district', 'location_tier'], 
                                prefix=['city', 'district', 'tier'])
    
    # Statystyki grupowe
    city_stats = df.groupby('city').agg({
        'price_per_sqm': ['mean', 'std', 'median'],
        'area': ['mean', 'median'],
        'price': ['mean', 'median']
    }).round(2)
    
    city_stats.columns = ['_'.join(col).strip() for col in city_stats.columns]
    city_stats = city_stats.reset_index()
    
    df_features = df_features.merge(city_stats, on='city', how='left')
    
    # Relative features
    df_features['price_vs_city_avg'] = df_features['price_per_sqm'] / df_features['price_per_sqm_mean']
    df_features['area_vs_city_avg'] = df_features['area'] / df_features['area_mean']
    
    # Usunięcie target i pomocniczych
    cols_to_drop = ['price', 'city', 'district']
    df_features = df_features.drop(columns=[col for col in cols_to_drop if col in df_features.columns])
    
    print(f"✅ Utworzono {len(df_features.columns)} cech")
    return df_features

def create_base_models():
    """Tworzenie modeli bazowych"""
    models = {}
    
    # 1. Random Forest (zoptymalizowany)
    models['rf'] = RandomForestRegressor(
        n_estimators=300,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        max_features='sqrt',
        bootstrap=True,
        oob_score=True,
        random_state=42,
        n_jobs=-1
    )
    
    # 2. XGBoost (jeśli dostępny)
    if XGBOOST_AVAILABLE:
        models['xgb'] = xgb.XGBRegressor(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            reg_alpha=0.1,
            reg_lambda=0.1,
            random_state=42,
            n_jobs=-1
        )
    
    # 3. LightGBM (jeśli dostępny)
    if LIGHTGBM_AVAILABLE:
        models['lgb'] = lgb.LGBMRegressor(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            reg_alpha=0.1,
            reg_lambda=0.1,
            random_state=42,
            n_jobs=-1,
            verbose=-1
        )
    
    # 4. Linear models
    models['ridge'] = Ridge(alpha=1.0, random_state=42)
    models['elastic'] = ElasticNet(alpha=0.1, l1_ratio=0.5, random_state=42)
    
    print(f"✅ Utworzono {len(models)} modeli bazowych")
    return models

def evaluate_single_models(models, X_train, X_test, y_train, y_test):
    """Ewaluacja pojedynczych modeli"""
    print("\n📊 EWALUACJA POJEDYNCZYCH MODELI")
    print("=" * 50)
    
    results = {}
    
    for name, model in models.items():
        try:
            print(f"\n🔍 Trenowanie {name.upper()}...")
            
            # Trenowanie
            model.fit(X_train, y_train)
            
            # Predykcje
            y_pred_train = model.predict(X_train)
            y_pred_test = model.predict(X_test)
            
            # Metryki
            train_mape = mean_absolute_percentage_error(y_train, y_pred_train) * 100
            test_mape = mean_absolute_percentage_error(y_test, y_pred_test) * 100
            test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
            test_r2 = r2_score(y_test, y_pred_test)
            
            # Cross-validation MAPE
            cv_scores = cross_val_score(model, X_train, y_train, 
                                      cv=5, scoring='neg_mean_absolute_percentage_error')
            cv_mape = -cv_scores.mean() * 100
            cv_std = cv_scores.std() * 100
            
            results[name] = {
                'model': model,
                'train_mape': train_mape,
                'test_mape': test_mape,
                'cv_mape': cv_mape,
                'cv_std': cv_std,
                'test_rmse': test_rmse,
                'test_r2': test_r2
            }
            
            status = "✅ CEL!" if test_mape < 12 else "❌"
            print(f"   Train MAPE: {train_mape:6.2f}%")
            print(f"   Test MAPE:  {test_mape:6.2f}% {status}")
            print(f"   CV MAPE:    {cv_mape:6.2f}% ± {cv_std:.2f}%")
            print(f"   Test RMSE:  {test_rmse:8,.0f} PLN")
            print(f"   Test R²:    {test_r2:8.3f}")
            
        except Exception as e:
            print(f"❌ Błąd dla {name}: {e}")
            continue
    
    return results

def create_voting_ensemble(models):
    """Voting Regressor - średnia ważona"""
    print("\n🗳️ VOTING ENSEMBLE")
    print("-" * 30)
    
    # Wybierz najlepsze modele (bez linear models dla voting)
    voting_models = []
    for name, model in models.items():
        if name in ['rf', 'xgb', 'lgb']:  # Tree-based models
            voting_models.append((name, model))
    
    if len(voting_models) < 2:
        print("⚠️ Zbyt mało modeli dla Voting Ensemble")
        return None
    
    voting_regressor = VotingRegressor(
        estimators=voting_models,
        n_jobs=-1
    )
    
    print(f"✅ Utworzono Voting Ensemble z {len(voting_models)} modeli")
    return voting_regressor

def create_stacking_ensemble(models):
    """Stacking Regressor - meta-learner"""
    print("\n🏗️ STACKING ENSEMBLE")
    print("-" * 30)
    
    # Base estimators (wszystkie modele)
    base_models = [(name, model) for name, model in models.items()]
    
    if len(base_models) < 2:
        print("⚠️ Zbyt mało modeli dla Stacking")
        return None
    
    # Meta-learner (prosty linear model)
    meta_learner = Ridge(alpha=1.0)
    
    stacking_regressor = StackingRegressor(
        estimators=base_models,
        final_estimator=meta_learner,
        cv=5,
        n_jobs=-1
    )
    
    print(f"✅ Utworzono Stacking Ensemble z {len(base_models)} modeli bazowych")
    return stacking_regressor

def create_weighted_ensemble(models, results, X_test, y_test):
    """Custom weighted ensemble na podstawie wydajności"""
    print("\n⚖️ WEIGHTED ENSEMBLE")
    print("-" * 30)
    
    # Wagi odwrotnie proporcjonalne do MAPE
    weights = {}
    total_inv_mape = 0
    
    for name, result in results.items():
        if result['test_mape'] > 0:
            inv_mape = 1.0 / result['test_mape']
            weights[name] = inv_mape
            total_inv_mape += inv_mape
    
    # Normalizacja wag
    for name in weights:
        weights[name] /= total_inv_mape
    
    print("Wagi modeli:")
    for name, weight in weights.items():
        print(f"   {name}: {weight:.3f}")
    
    # Predykcje ważone
    weighted_predictions = np.zeros(len(X_test))
    
    for name, result in results.items():
        if name in weights:
            model_pred = result['model'].predict(X_test)
            weighted_predictions += weights[name] * model_pred
    
    # Ewaluacja
    weighted_mape = mean_absolute_percentage_error(y_test, weighted_predictions) * 100
    weighted_rmse = np.sqrt(mean_squared_error(y_test, weighted_predictions))
    weighted_r2 = r2_score(y_test, weighted_predictions)
    
    print(f"✅ Weighted Ensemble MAPE: {weighted_mape:.2f}%")
    
    return {
        'predictions': weighted_predictions,
        'mape': weighted_mape,
        'rmse': weighted_rmse,
        'r2': weighted_r2,
        'weights': weights
    }

def main():
    """Główna funkcja ensemble"""
    print("🚀 ENSEMBLE METHODS - KOMBINACJA MODELI")
    print("🎯 CEL: MAPE < 12%")
    print("=" * 60)
    
    # Załadowanie danych
    df = load_and_prepare_data()
    if df is None:
        return
    
    # Przygotowanie danych
    feature_cols = [col for col in df.columns if col not in ['price']]
    X = df[feature_cols].select_dtypes(include=[np.number])
    y = df['price'] if 'price' in df.columns else df.iloc[:, -1]
    
    print(f"📊 Liczba cech: {X.shape[1]}")
    print(f"📊 Liczba obserwacji: {X.shape[0]}")
    
    # Podział danych
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Tworzenie modeli bazowych
    models = create_base_models()
    
    # Ewaluacja pojedynczych modeli
    results = evaluate_single_models(models, X_train, X_test, y_train, y_test)
    
    if not results:
        print("❌ Brak wyników z modeli bazowych")
        return
    
    # Ensemble methods
    ensemble_results = {}
    
    # 1. Voting Ensemble
    voting_model = create_voting_ensemble(models)
    if voting_model is not None:
        try:
            voting_model.fit(X_train, y_train)
            voting_pred = voting_model.predict(X_test)
            voting_mape = mean_absolute_percentage_error(y_test, voting_pred) * 100
            
            ensemble_results['voting'] = {
                'mape': voting_mape,
                'model': voting_model,
                'predictions': voting_pred
            }
            
            status = "✅ CEL!" if voting_mape < 12 else "❌"
            print(f"🗳️ Voting Ensemble MAPE: {voting_mape:.2f}% {status}")
            
        except Exception as e:
            print(f"❌ Błąd Voting Ensemble: {e}")
    
    # 2. Stacking Ensemble
    stacking_model = create_stacking_ensemble(models)
    if stacking_model is not None:
        try:
            stacking_model.fit(X_train, y_train)
            stacking_pred = stacking_model.predict(X_test)
            stacking_mape = mean_absolute_percentage_error(y_test, stacking_pred) * 100
            
            ensemble_results['stacking'] = {
                'mape': stacking_mape,
                'model': stacking_model,
                'predictions': stacking_pred
            }
            
            status = "✅ CEL!" if stacking_mape < 12 else "❌"
            print(f"🏗️ Stacking Ensemble MAPE: {stacking_mape:.2f}% {status}")
            
        except Exception as e:
            print(f"❌ Błąd Stacking Ensemble: {e}")
    
    # 3. Weighted Ensemble
    try:
        weighted_result = create_weighted_ensemble(models, results, X_test, y_test)
        if weighted_result:
            ensemble_results['weighted'] = weighted_result
            
            status = "✅ CEL!" if weighted_result['mape'] < 12 else "❌"
            print(f"⚖️ Weighted Ensemble MAPE: {weighted_result['mape']:.2f}% {status}")
    except Exception as e:
        print(f"❌ Błąd Weighted Ensemble: {e}")
    
    # Podsumowanie wszystkich wyników
    print(f"\n🏆 PODSUMOWANIE WSZYSTKICH MODELI")
    print("=" * 60)
    
    all_results = []
    
    # Pojedyncze modele
    for name, result in results.items():
        all_results.append({
            'model_name': name.upper(),
            'mape': result['test_mape'],
            'type': 'Single'
        })
    
    # Ensemble modele
    for name, result in ensemble_results.items():
        all_results.append({
            'model_name': name.upper() + ' ENSEMBLE',
            'mape': result['mape'],
            'type': 'Ensemble'
        })
    
    # Sortowanie według MAPE
    all_results_df = pd.DataFrame(all_results).sort_values('mape')
    
    print(f"{'Model':<25} {'MAPE':<8} {'Status':<15} {'Type'}")
    print("-" * 60)
    
    for _, row in all_results_df.iterrows():
        status = "✅ CEL OSIĄGNIĘTY!" if row['mape'] < 12 else "❌ Wymaga pracy"
        print(f"{row['model_name']:<25} {row['mape']:6.2f}% {status:<15} {row['type']}")
    
    # Zapisz najlepszy model
    if all_results:
        best_result = all_results_df.iloc[0]
        best_mape = best_result['mape']
        
        print(f"\n🎯 NAJLEPSZY WYNIK: {best_result['model_name']} - {best_mape:.2f}% MAPE")
        
        if best_mape < 12:
            print("🎉 GRATULACJE! CEL <12% MAPE ZOSTAŁ OSIĄGNIĘTY!")
            
            # Zapisz najlepszy model
            if best_result['model_name'].endswith('ENSEMBLE'):
                ensemble_type = best_result['model_name'].split()[0].lower()
                if ensemble_type in ensemble_results:
                    best_model = ensemble_results[ensemble_type].get('model')
                    if best_model:
                        model_filename = f"models/best_ensemble_model_{best_mape:.2f}pct.pkl"
                        with open(model_filename, 'wb') as f:
                            pickle.dump(best_model, f)
                        print(f"💾 Zapisano najlepszy model: {model_filename}")
            else:
                model_name = best_result['model_name'].lower()
                if model_name in results:
                    best_model = results[model_name]['model']
                    model_filename = f"models/best_single_model_{best_mape:.2f}pct.pkl"
                    with open(model_filename, 'wb') as f:
                        pickle.dump(best_model, f)
                    print(f"💾 Zapisano najlepszy model: {model_filename}")
        else:
            improvement_needed = best_mape - 12
            print(f"⚠️ Potrzeba dalszej optymalizacji. Brakuje {improvement_needed:.2f} punktów procentowych.")
            print("\n💡 DALSZE KROKI:")
            print("   - Więcej feature engineering")
            print("   - Optymalizacja hiperparametrów ensemble")
            print("   - Dodanie więcej danych treningowych")
            print("   - Sprawdzenie quality danych (outliers)")

if __name__ == "__main__":
    main() 