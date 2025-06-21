# Random Forest w Produkcji - Dokumentacja

## 🚀 Status: WDROŻONE

**Data wdrożenia:** 21 czerwca 2025  
**Endpoint:** `POST /api/valuation`  
**Model:** Random Forest Regressor  
**Dokładność:** MAPE 15.56%  

---

## 📊 Specyfikacja Modelu

### Dane treningowe
- **Źródło:** Tabela `nieruchomosci` (MySQL)
- **Rozmiar:** 566 rekordów
- **Region:** Olsztyn i okolice (Stawiguda, Dywity, powiat olsztyński)
- **Okres:** Dane aktualne na grudzień 2024

### Cechy modelu
- **Algorytm:** RandomForestRegressor (scikit-learn)
- **Liczba cech:** 35 (po one-hot encoding)
- **Hiperparametry:** Optymalizowane przez RandomizedSearchCV
- **Walidacja:** 5-fold cross-validation

### Metryki wydajności
| Metryka | Wartość |
|---------|---------|
| MAPE | 15.56% |
| RMSE | 172,773 PLN |
| R² | 0.555 |
| Confidence interval | ±7% |

---

## 🔧 Architektura Systemu

```
Frontend (Next.js) 
    ↓ POST /api/valuation
API Route Handler (TypeScript)
    ↓ subprocess
Python Script (predict_rf.py)
    ↓ pickle.load()
Random Forest Model
    ↓ prediction
API Response (JSON)
```

### Komponenty

1. **API Endpoint** (`src/app/api/valuation/route.ts`)
   - Walidacja Zod
   - Wywołanie Python subprocess
   - Fallback do heurystyki
   - Error handling

2. **Prediction Script** (`scripts/predict_rf.py`)
   - Ładowanie modelu z pickle
   - Feature engineering
   - Predykcja i zwracanie JSON

3. **Model File** (`models/valuation_rf.pkl`)
   - Serialized RandomForestRegressor
   - 35 features po preprocessing
   - Metadata w `.meta.txt`

---

## 📋 API Specyfikacja

### Request
```bash
POST /api/valuation
Content-Type: application/json

{
  "city": "Olsztyn",           # required
  "district": "Kortowo",       # optional
  "area": 60,                  # required, > 0
  "rooms": 3,                  # required, > 0
  "floor": 2,                  # optional, >= 0
  "year": 2015                 # optional
}
```

### Response (Success)
```json
{
  "price": 684000,
  "minPrice": 636000,
  "maxPrice": 732000,
  "currency": "PLN",
  "method": "random_forest_v1.0",
  "confidence": "±7%",
  "note": "Wycena oparta o model Random Forest wytrenowany na danych z regionu Olsztyn",
  "timestamp": "2025-06-21T09:20:15.693Z"
}
```

### Response (Fallback)
```json
{
  "price": 350000,
  "minPrice": 332000,
  "maxPrice": 368000,
  "currency": "PLN",
  "method": "heuristic_fallback_v1.0",
  "confidence": "±5%",
  "note": "Wycena heurystyczna - model ML niedostępny"
}
```

---

## 🎯 Przykłady Użycia

### Mieszkanie w centrum Olsztyna
```bash
curl -X POST http://localhost:3000/api/valuation \
  -H "Content-Type: application/json" \
  -d '{"city": "Olsztyn", "district": "Śródmieście", "area": 55, "rooms": 3, "year": 2010}'
```
**Rezultat:** ~620,000 PLN

### Dom w Stawigudzie
```bash
curl -X POST http://localhost:3000/api/valuation \
  -H "Content-Type: application/json" \
  -d '{"city": "Stawiguda", "area": 120, "rooms": 5, "year": 2018}'
```
**Rezultat:** ~850,000 PLN

### Kawalerka na Kortowie
```bash
curl -X POST http://localhost:3000/api/valuation \
  -H "Content-Type: application/json" \
  -d '{"city": "Olsztyn", "district": "Kortowo", "area": 25, "rooms": 1, "year": 2020}'
```
**Rezultat:** ~280,000 PLN

---

## ⚡ Wydajność

### Czasy odpowiedzi
- **Random Forest:** ~2-3 sekundy
- **Heurystyka (fallback):** <100ms
- **Timeout:** 10 sekund

### Dostępność
- **Uptime target:** 99.9%
- **Fallback:** Automatyczny przy błędach ML
- **Emergency fallback:** Zawsze dostępny

---

## 🔍 Monitoring

### Logi
```bash
# Sukces ML
[Valuation API] Random Forest sukces: 684000

# Fallback
[Valuation API] Fallback do heurystyki: 350000

# Błąd
[Random Forest] Błąd wykonania: ModuleNotFoundError
```

### Metryki do śledzenia
- Procent użycia ML vs fallback
- Średni czas odpowiedzi
- Liczba błędów Python subprocess
- Rozkład cen predykcji

---

## 🛠️ Utrzymanie

### Retraining
- **Częstotliwość:** Co 30 dni
- **Trigger:** Nowe dane w bazie
- **Skrypt:** `scripts/train_both_models.py`
- **Backup:** Poprzednia wersja modelu

### Aktualizacje
1. Trenowanie nowego modelu
2. Walidacja na test set
3. Backup starego modelu
4. Wymiana `models/valuation_rf.pkl`
5. Restart aplikacji

### Troubleshooting

#### Model nie działa
```bash
# Sprawdź czy model istnieje
ls -la models/valuation_rf.pkl

# Test manualny
python scripts/predict_rf.py '{"city": "Olsztyn", "area": 50, "rooms": 2}'

# Sprawdź logi
tail -f logs/app.log | grep "Random Forest"
```

#### Wysokie czasy odpowiedzi
- Sprawdź obciążenie CPU
- Zoptymalizuj n_estimators w modelu
- Rozważ cachowanie popularnych zapytań

---

## 📈 Roadmap

### Krótkoterminowe (1-3 miesiące)
- [ ] Cachowanie popularnych kombinacji
- [ ] A/B testing RF vs XGBoost
- [ ] Rozszerzenie na inne miasta

### Długoterminowe (3-12 miesięcy)
- [ ] Model ensemble (RF + XGBoost + Neural Network)
- [ ] Real-time learning z feedback
- [ ] Geolokalizacja i mapy ciepła
- [ ] API rate limiting i autentykacja

---

## 👥 Zespół

**ML Engineer:** Implementacja i utrzymanie modelu  
**Backend Developer:** API integration i monitoring  
**DevOps:** Deployment i CI/CD  

**Kontakt:** [Dodaj szczegóły kontaktowe]

---

*Ostatnia aktualizacja: 21 czerwca 2025* 