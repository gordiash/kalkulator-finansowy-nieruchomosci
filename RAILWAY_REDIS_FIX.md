# 🔧 Naprawa Redis + EstymatorAI na Railway

## 🚨 **Obecne problemy:**
- ❌ Redis nie działa (`redis_connected: false`)
- ❌ EstymatorAI nie załadowany (`ensemble: false`)  
- ❌ Używa tylko heurystyki zamiast ML

---

## 🛠️ **Krok 1: Dodaj Redis Service w Railway**

### **1.1 W Railway Dashboard:**
1. Otwórz projekt: `kalkulator-finansowy-nieruchomosci-production`
2. Kliknij **"+ Add Service"**
3. Wybierz **"Redis"**
4. Railway automatycznie utworzy Redis service

### **1.2 Sprawdź Environment Variables:**
```bash
# W Railway Service Settings → Variables:
REDIS_URL=${{Redis.REDIS_URL}}  # ✅ Powinno być automatycznie
PORT=8000
PYTHON_VERSION=3.11
```

---

## 🧠 **Krok 2: Napraw ładowanie EstymatorAI**

### **2.1 Problem: Model nie w katalogu**
Railway prawdopodobnie nie ma pliku `ensemble_optimized_0.79pct.pkl`

### **2.2 Rozwiązanie:**
```bash
# Sprawdź czy model jest w repo
git ls-files railway-ml-api/models/

# Jeśli brak, dodaj:
cp models/ensemble_optimized_0.79pct.pkl railway-ml-api/models/
git add railway-ml-api/models/ensemble_optimized_0.79pct.pkl
git commit -m "Add EstymatorAI model to Railway"
git push origin main
```

---

## 🚀 **Krok 3: Redeploy z poprawkami**

### **3.1 Aktualizuj CORS dla Vercel:**
```python
# railway-ml-api/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-vercel-app.vercel.app",           # Twój Vercel
        "https://kalkulatorynieruchomosci.pl",          # Produkcja
        "https://*.vercel.app",                         # Wszystkie Vercel
        "http://localhost:3000",                        # Development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### **3.2 Push i auto-redeploy:**
```bash
git add .
git commit -m "Fix Redis + EstymatorAI integration"  
git push origin main
# Railway automatycznie redeploy
```

---

## 🧪 **Krok 4: Testowanie po naprawie**

### **4.1 Test Redis connection:**
```bash
curl https://kalkulator-finansowy-nieruchomosci-production.up.railway.app/health
# Oczekiwane: "redis_connected": true
```

### **4.2 Test EstymatorAI model:**
```bash
curl -X POST https://kalkulator-finansowy-nieruchomosci-production.up.railway.app/predict \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Olsztyn",
    "area": 65,
    "rooms": 3,
    "year": 2015
  }'

# Oczekiwane: "method": "ensemble_EstymatorAI_railway"
```

### **4.3 Test cache stats:**
```bash
curl https://kalkulator-finansowy-nieruchomosci-production.up.railway.app/cache/stats
# Oczekiwane: "cache_enabled": true
```

---

## 📋 **Troubleshooting**

### **Problem: Redis timeout**
```bash
# Sprawdź logi Railway:
# Railway Dashboard → Service → Logs
# Szukaj: "Redis connection failed"
```

### **Problem: Model za duży**
```bash
# EstymatorAI ~47MB może przekraczać limity
# Sprawdź logi build w Railway
```

### **Problem: Slow startup**
```bash
# Modele ładują się przy pierwszym request
# Pierwsze wywołanie może trwać 30s+
```

---

## ✅ **Oczekiwany wynik po naprawie:**

### **Health check:**
```json
{
  "status": "healthy",
  "service": "ml-api", 
  "cache": {
    "status": "active",
    "redis_connected": true
  },
  "models": {
    "ensemble": true,     // ✅ EstymatorAI
    "rf": false,
    "xgb": false
  }
}
```

### **Predykcja EstymatorAI:**
```json
{
  "price": 503000,
  "minPrice": 493000, 
  "maxPrice": 513000,
  "currency": "PLN",
  "method": "ensemble_EstymatorAI_railway",  // ✅ Nie heurystyka!
  "confidence": "±1%",                       // ✅ 0.79% MAPE
  "note": "Wycena oparta o zaawansowany EstymatorAI z dokładnością 0.79% MAPE",
  "cached": false
}
```

### **Cache stats:**
```json
{
  "cache_enabled": true,     // ✅ Redis działa
  "redis_connected": true,   // ✅ Połączenie OK
  "hit_rate": 0.0,           // Nowe - będzie rosnąć
  "model_version": "estymatorai-v2.1-0.79pct"
}
```

---

## 🎯 **Następne kroki:**

1. **✅ Dodaj Redis service w Railway Dashboard**
2. **✅ Sprawdź czy model EstymatorAI jest w repo** 
3. **✅ Push + redeploy**
4. **✅ Test wszystkich endpointów**
5. **✅ Aktualizuj URL w Vercel env variables**

Po naprawie będziesz mieć pełny stack ML z cache! 