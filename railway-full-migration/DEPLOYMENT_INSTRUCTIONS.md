# 🚂 Railway Deployment Instructions - EstymatorAI ML Fix

## Problem Resolution Summary
Naprawiliśmy problem z ML modelami na produkcji Railway, które nie uruchamiały się z powodu nieprawidłowej konfiguracji. Główne problemy:

1. **Railway używał NIXPACKS** zamiast naszego Dockerfile z konfiguracją Python + ML
2. **Brak plików ML** - modele nie były kopiowane podczas build
3. **Nieprawidłowe Python paths** - endpoint używał lokalnych ścieżek zamiast Docker

## 🔧 Zmiany które zostały wprowadzone

### 1. Railway Configuration (`railway.toml`)
```toml
[build]
builder = "DOCKERFILE"  # Zmieniono z NIXPACKS na DOCKERFILE
```

### 2. Dockerfile Improvements
- Użycie `python:3.11-slim-bookworm` jako base image
- Instalacja Node.js 18 + Python 3.11
- Kopiowanie modeli ML PRZED build
- Instalacja ML dependencies przez pip
- Debug output do sprawdzania plików

### 3. ML Models Directory
Skopiowano wszystkie modele do `railway-full-migration/models/`:
- ✅ `ensemble_optimized_0.79pct.pkl` (45MB) - główny model EstymatorAI v2.1
- ✅ `ensemble_optimized_0.78pct.pkl` (46MB) - backup model
- ✅ `valuation_rf.pkl` (4.3MB) - Random Forest fallback
- ✅ Wszystkie meta pliki i feature importance

### 4. API Endpoints Updates
**Priority Python commands** dla Docker environment:
```javascript
const pythonCommands = [
  'python3',                   // Docker main
  'python',                    // Docker alias  
  '/usr/bin/python3',          // system Linux path
  '/usr/bin/python',           // system Linux path
  '/usr/local/bin/python3'     // alternative installations
];
```

### 5. Enhanced Diagnostics
Endpoint `/api/diagnostics` teraz testuje:
- `python3 --version` (priorytet)
- `python --version`
- `/usr/bin/python3 --version`
- `/usr/bin/python --version`
- Sprawdzenie plików ML models i scripts
- Environment variables
- Supabase connectivity

## 🚀 Deployment Steps

### 1. Railway Dashboard Setup
1. Wejdź na [Railway Dashboard](https://railway.app)
2. Wybierz projekt EstymatorAI
3. Idź do Settings → Environment Variables
4. Ustaw zmienne:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://lhihjbltatugcnbcpzzt.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=twój_klucz
   SUPABASE_SERVICE_ROLE_KEY=twój_service_key
   NODE_ENV=production
   ```

### 2. Deploy from GitHub
1. Railway automatycznie wykryje zmiany w `railway.toml`
2. Użyje `DOCKERFILE` builder
3. Skopiuje modele ML podczas build
4. Zainstaluje Python dependencies

### 3. Monitoring Deployment
Sprawdź logi build w Railway:
```bash
=== Sprawdzanie plików ML ===
models/
scripts/
Python 3.11.x
/usr/bin/python3
```

### 4. Health Checks
Po deployment sprawdź:

**Health Check:**
```bash
curl https://twoja-domena.railway.app/api/health
```

**Diagnostics:**
```bash
curl https://twoja-domena.railway.app/api/diagnostics
```

**ML Prediction Test:**
```bash
curl -X POST https://twoja-domena.railway.app/api/valuation-railway \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Olsztyn",
    "area": 65,
    "rooms": 3,
    "year": 2015,
    "locationTier": "medium"
  }'
```

## 📊 Expected Results

### Successful ML Response:
```json
{
  "price": 531000,
  "minPrice": 520000,
  "maxPrice": 542000,
  "currency": "PLN",
  "method": "ensemble_EstymatorAI_railway",
  "confidence": "±2%",
  "note": "Wycena oparta o zaawansowany model Ensemble z dokładnością 0.79% MAPE",
  "debug": {
    "individual_predictions": {
      "lightgbm": 530000,
      "catboost": 532000,
      "random_forest": 531000
    }
  }
}
```

### Fallback Response (if ML fails):
```json
{
  "price": 487500,
  "method": "heuristic_railway",
  "note": "Wycena heurystyczna - Railway fallback"
}
```

## 🔍 Troubleshooting

### If Python not found:
1. Sprawdź logi build Railway
2. Sprawdź `/api/diagnostics` output
3. Verify Dockerfile build steps

### If Models not found:
1. Sprawdź czy `models/` directory został skopiowany
2. Sprawdź `/api/diagnostics` → `file_checks`
3. Verify COPY commands w Dockerfile

### If ML prediction fails:
1. Sprawdź Python libraries installation
2. Check `requirements-railway.txt`
3. Fallback do heuristic pricing aktywny

## 📁 Files Structure Railway
```
railway-full-migration/
├── Dockerfile              # Python 3.11 + Node.js 18 + ML
├── railway.toml            # DOCKERFILE builder
├── models/                 # ML models (45MB+)
├── scripts/                # Python prediction scripts
├── requirements-railway.txt # ML dependencies
├── src/app/api/
│   ├── valuation-railway/  # Main ML endpoint
│   ├── diagnostics/        # Environment check
│   └── health/            # Health monitoring
└── .dockerignore          # Optimized Docker build
```

## 🎯 Success Criteria
- ✅ Railway uses Dockerfile (not NIXPACKS)
- ✅ Python 3.11 accessible as `python3`
- ✅ ML models copied and accessible
- ✅ EstymatorAI v2.1 model (0.79% MAPE) working
- ✅ Fallback heuristic for edge cases
- ✅ Comprehensive logging and diagnostics

---

**EstymatorAI v2.1** - 0.79% MAPE accuracy model ready for production! 🎉 