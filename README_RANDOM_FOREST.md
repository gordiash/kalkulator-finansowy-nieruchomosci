# 🌲 Random Forest Model - Kalkulator Wyceny

Implementacja modelu Random Forest dla kalkulatora wyceny mieszkań.

## 📋 Przegląd

Ten folder zawiera pełną implementację modelu Random Forest dla wyceny nieruchomości, w tym:

- **Trenowanie modelu** - zaawansowany pipeline ML z hyperparameter tuning
- **API endpoint** - integracja z Next.js
- **Porównanie modeli** - Random Forest vs XGBoost
- **Predykcja** - skrypt do inference

## 🚀 Szybki Start

### 1. Trenowanie modelu Random Forest

```bash
# Upewnij się, że masz skonfigurowane środowisko Python
python -m pip install -r requirements-model.txt

# Ustaw zmienne środowiskowe MySQL
export MYSQL_HOST=localhost
export MYSQL_USER=your_user
export MYSQL_PASSWORD=your_password
export MYSQL_DATABASE=your_database

# Trenuj Random Forest model
python scripts/train_random_forest_model.py --out models/valuation_rf.pkl
```

### 2. Test predykcji

```bash
# Test pojedynczej predykcji
python scripts/predict_rf.py '{"city": "warszawa", "area": 60, "rooms": 3, "year": 2015}'
```

### 3. Porównanie z XGBoost

```bash
# Najpierw wytrenuj oba modele
python scripts/train_valuation_model.py          # XGBoost
python scripts/train_random_forest_model.py      # Random Forest

# Porównaj modele
python scripts/compare_models.py
```

### 4. Użyj nowego API endpoint

```bash
# Endpoint dostępny pod:
POST /api/valuation-rf

# Przykładowe zapytanie:
curl -X POST http://localhost:3000/api/valuation-rf \
  -H "Content-Type: application/json" \
  -d '{
    "city": "warszawa",
    "area": 60,
    "rooms": 3,
    "year": 2015
  }'
```

## 📊 Przykładowe Wyniki

```json
{
  "price": 720000,
  "minPrice": 670000,
  "maxPrice": 770000,
  "currency": "PLN",
  "method": "random_forest_v1.0",
  "model": "RandomForestRegressor",
  "confidence": "±7%",
  "features_used": ["area", "rooms", "year", "city_warszawa", ...],
  "note": "Predykcja z modelu Random Forest wytrenowanego na danych transakcyjnych"
}
```

## 🔧 Pliki w Implementacji

### Python Scripts
- `scripts/train_random_forest_model.py` - Trenowanie modelu RF
- `scripts/predict_rf.py` - Predykcja z modelu RF
- `scripts/compare_models.py` - Porównanie RF vs XGBoost

### API Endpoints
- `src/app/api/valuation-rf/route.ts` - Nowy endpoint z RF
- `src/app/api/valuation/route.ts` - Oryginalny endpoint (heurystyka)

### Modele
- `models/valuation_rf.pkl` - Wytrenowany model Random Forest
- `models/valuation_rf.pkl.meta.txt` - Metadane modelu
- `models/valuation_rf_feature_importance.csv` - Ważność cech

## 🌟 Zalety Random Forest

| Aspekt | Random Forest | XGBoost |
|--------|---------------|---------|
| **Szybkość trenowania** | ⚡ Szybka | 🐌 Wolniejsza |
| **Interpretacja** | 📊 Dobra | 📈 Średnia |
| **Overfitting** | 🛡️ Odporny | ⚠️ Podatny |
| **Hyperparameters** | 🎯 Mniej | 🔧 Więcej |
| **Stabilność** | ✅ Stabilny | 📊 Zmienne |

## 📈 Metryki Wydajności

Po trenowaniu model generuje:

- **MAPE** - Mean Absolute Percentage Error
- **RMSE** - Root Mean Square Error  
- **R²** - Coefficient of Determination
- **Feature Importance** - Ważność poszczególnych cech

## 🔍 Feature Engineering

Model wykorzystuje następujące cechy:

### Cechy bazowe:
- `area` - Powierzchnia (m²)
- `rooms` - Liczba pokoi
- `floor` - Piętro
- `year` - Rok budowy

### Cechy inżynierskie:
- `building_age` - Wiek budynku (2024 - year)
- `rooms_per_area` - Stosunek pokoi do powierzchni
- `price_per_sqm` - Cena za m² (tylko do trenowania)

### Cechy kategoryczne (one-hot):
- `city_*` - Miasto (warszawa, krakow, wroclaw, ...)
- `district_*` - Dzielnica (mokotow, praga, zoliborz, ...)

## 🛠️ Konfiguracja Modelu

```python
# Podstawowa konfiguracja Random Forest
RandomForestRegressor(
    n_estimators=300,        # Liczba drzew
    max_depth=20,           # Maksymalna głębokość
    min_samples_split=5,    # Min. próbek do podziału
    min_samples_leaf=2,     # Min. próbek w liściu
    max_features='sqrt',    # Cechy na podział
    bootstrap=True,         # Bootstrapping
    n_jobs=-1,             # Równoległość
    random_state=42        # Reproductibilność
)
```

## 📱 Integracja z Frontend

Endpoint `/api/valuation-rf` jest w pełni kompatybilny z istniejącym frontendem:

```typescript
// Zmień URL w komponencie kalkulatora:
const response = await fetch('/api/valuation-rf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
})
```

## 🔄 Fallback Strategy

Jeśli model Random Forest nie jest dostępny, API automatycznie używa heurystyki:

1. **Próba** - Załaduj model RF i wykonaj predykcję
2. **Fallback** - Jeśli błąd, użyj heurystyki z oryginalnego API
3. **Response** - Zawsze zwróć odpowiedź (z informacją o metodzie)

## 📊 Monitoring & Logowanie

```bash
# Logi modelu
tail -f logs/random_forest.log

# Metryki w real-time
python scripts/monitor_model_performance.py
```

## 🚨 Troubleshooting

### Model nie ładuje się
```bash
# Sprawdź czy plik istnieje
ls -la models/valuation_rf.pkl

# Sprawdź wersję scikit-learn
python -c "import sklearn; print(sklearn.__version__)"
```

### Błędy predykcji
```bash
# Test manualny
python scripts/predict_rf.py '{"city": "warszawa", "area": 50, "rooms": 2}'

# Debug verbose
python scripts/predict_rf.py '{"city": "test"}' --verbose
```

### Problemy z API
```bash
# Sprawdź proces Node.js
ps aux | grep node

# Test endpoint
curl -X POST localhost:3000/api/valuation-rf \
  -H "Content-Type: application/json" \
  -d '{"city": "warszawa", "area": 50, "rooms": 2}'
```

## 🎯 Roadmap

### Faza 1 ✅
- [x] Podstawowy model Random Forest
- [x] API endpoint
- [x] Fallback do heurystyki

### Faza 2 🔄
- [ ] A/B testing RF vs XGBoost
- [ ] Automatyczne retraining
- [ ] Model versioning

### Faza 3 📋
- [ ] Ensemble of models
- [ ] Deep learning integration
- [ ] Real-time model updates

## 📞 Support

Jeśli masz problemy z implementacją:

1. Sprawdź logi: `tail -f logs/random_forest.log`
2. Uruchom testy: `python -m pytest tests/test_random_forest.py`
3. Porównaj z XGBoost: `python scripts/compare_models.py`

---

**Autor**: AI Assistant  
**Wersja**: 1.0  
**Data**: 2024  
**Licencja**: MIT 