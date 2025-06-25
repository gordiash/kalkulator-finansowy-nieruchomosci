# 🏠 Wycena Nieruchomości ML API

FastAPI service dla wyceny nieruchomości używający zaawansowanych modeli Machine Learning.

## 🚀 **Deployment na Railway**

### **Krok 1: Przygotowanie**
```bash
# Skopiuj modele ML do katalogu railway-ml-api/models/
cp models/ensemble_optimized_0.79pct.pkl railway-ml-api/models/
cp models/valuation_rf.pkl railway-ml-api/models/
```

### **Krok 2: Deploy na Railway**
1. Połącz GitHub repo z Railway
2. Wybierz katalog `railway-ml-api` jako root
3. Railway automatycznie wykryje Python i zbuduje aplikację
4. Ustaw zmienne środowiskowe w Railway dashboard

### **Krok 3: Konfiguracja CORS**
Zaktualizuj URL Vercel w `main.py`:
```python
allow_origins=["https://twoja-aplikacja.vercel.app", "http://localhost:3000"]
```

## 📊 **Endpoints**

### **GET /** - Status API
```json
{
  "message": "Wycena Nieruchomości ML API",
  "status": "active",
  "models_loaded": {
    "ensemble": true,
    "random_forest": true,
    "xgboost": false
  }
}
```

### **GET /health** - Health Check
```json
{
  "status": "healthy",
  "service": "ml-api"
}
```

### **POST /predict** - Wycena nieruchomości
**Request:**
```json
{
  "city": "Olsztyn",
  "district": "Centrum",
  "area": 65.5,
  "rooms": 3,
  "floor": 2,
  "year": 2010,
  "locationTier": "high",
  "condition": "good",
  "buildingType": "apartment",
  "parking": "garage",
  "finishing": "high",
  "elevator": "yes",
  "balcony": "balcony",
  "orientation": "south",
  "transport": "excellent"
}
```

**Response:**
```json
{
  "price": 503000,
  "minPrice": 493000,
  "maxPrice": 513000,
  "currency": "PLN",
  "method": "ensemble_EstymatorAI_railway",
  "confidence": "±2%",
  "note": "Wycena oparta o zaawansowany model Ensemble z dokładnością 0.78% MAPE",
  "timestamp": "2024-01-15T10:30:00"
}
```

## 🔧 **Modele ML**

### **Hierarchia modeli:**
1. **EstymatorAI** (najlepszy) - MAPE 0.78%
2. **Random Forest** - MAPE 15.56% 
3. **XGBoost** - backup model
4. **Heurystyka** - fallback gdy modele niedostępne

### **Rozmiary modeli:**
- `ensemble_optimized_0.79pct.pkl` - ~45MB
- `valuation_rf.pkl` - ~4.3MB
- `valuation_xgb.pkl` - ~2MB (opcjonalny)

## 💰 **Koszty Railway**

### **Free Tier:**
- $5 credit miesięcznie
- 512MB RAM (za mało dla modeli ML)
- Limit CPU

### **Pro Plan ($20/miesiąc):**
- 8GB RAM (wystarczy)
- Unlimited CPU
- Custom domains
- Priority support

## 🔗 **Integracja z Next.js**

Zaktualizuj endpoint w Next.js:
```typescript
// src/app/api/valuation/route.ts
const RAILWAY_ML_API = process.env.RAILWAY_ML_API_URL;

const response = await fetch(`${RAILWAY_ML_API}/predict`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(validatedData)
});
```

## 📈 **Monitoring**

Railway zapewnia:
- **Live logs** - real-time monitoring
- **Metrics** - CPU, RAM, network usage  
- **Alerts** - powiadomienia o problemach
- **Health checks** - automatyczne sprawdzanie `/health`

## 🛠️ **Development**

### **Lokalnie:**
```bash
cd railway-ml-api
pip install -r requirements.txt
python main.py
```

### **Testowanie:**
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{"city":"Olsztyn","area":65,"rooms":3}'
```

## 🎯 **Następne kroki**

1. ✅ Deploy API na Railway
2. ✅ Integracja z Next.js na Vercel  
3. ⏳ Monitoring i optymalizacja
4. ⏳ A/B testing modeli
5. ⏳ Caching predykcji 