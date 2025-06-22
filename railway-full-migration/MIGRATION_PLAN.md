# 🚀 **Plan pełnej migracji na Railway**

## 📋 **Przegląd migracji**

Pełna migracja aplikacji **Wycena Nieruchomości** z Vercel na Railway, łącząc Next.js frontend z Python ML backend w jednej platformie.

## 🎯 **Cele migracji**

### ✅ **Korzyści:**
- **Modele ML działają natywnie** (Python support)
- **Jedna platforma** = łatwiejsze zarządzanie
- **Lepsza integracja** frontend ↔ backend
- **Realtime logs** i monitoring
- **Automatyczny deployment** z GitHub
- **Skalowanie** według potrzeb

### ⚠️ **Wyzwania:**
- **Wyższe koszty** niż Vercel Free
- **Migracja danych** i konfiguracji
- **Testowanie** nowej architektury
- **DNS** i domeny

## 📊 **Porównanie kosztów**

| Platforma | Plan | Koszt/miesiąc | RAM | CPU | Features |
|-----------|------|---------------|-----|-----|----------|
| **Vercel** | Free | $0 | - | - | Frontend only |
| **Railway** | Pro | $20 | 8GB | Unlimited | Full-stack + ML |
| **Razem** | - | **$20** | 8GB | Unlimited | Wszystko w jednym |

## 🏗️ **Architektura docelowa**

```
┌─────────────────────────────────────────┐
│              Railway Platform            │
│                                         │
│  ┌─────────────────┐ ┌─────────────────┐ │
│  │   Next.js App   │ │  Python ML      │ │
│  │   - Frontend    │◄┤  - Models       │ │
│  │   - API Routes  │ │  - Scripts      │ │
│  │   - SSR/SSG     │ │  - Processing   │ │
│  └─────────────────┘ └─────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │         Shared Storage              │ │
│  │  - Models (~50MB)                   │ │
│  │  - Static Assets                    │ │
│  │  - Logs & Cache                     │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 📦 **Struktura projektu Railway**

```
railway-full-migration/
├── 📁 src/                    # Next.js app
│   ├── 📁 app/
│   ├── 📁 components/
│   └── 📁 lib/
├── 📁 scripts/                # Python ML scripts
│   └── predict_ensemble_railway.py
├── 📁 models/                 # ML models (~50MB)
│   ├── ensemble_optimized_0.78pct.pkl
│   └── valuation_rf.pkl
├── 📁 public/                 # Static assets
├── package.json               # Node.js dependencies
├── requirements-railway.txt   # Python dependencies  
├── next.config.js            # Next.js config
├── railway.toml              # Railway config
├── Dockerfile                # Multi-stage build
└── .railwayignore           # Ignore patterns
```

## 🚀 **Plan implementacji**

### **Faza 1: Przygotowanie (1-2 dni)**

#### **1.1 Kopiowanie plików**
```bash
# Skopiuj całą aplikację do nowego katalogu
cp -r src/ railway-full-migration/
cp -r public/ railway-full-migration/
cp package.json railway-full-migration/
cp tailwind.config.ts railway-full-migration/
cp tsconfig.json railway-full-migration/

# Skopiuj modele ML
cp models/ensemble_optimized_0.78pct.pkl railway-full-migration/models/
cp models/valuation_rf.pkl railway-full-migration/models/

# Skopiuj skrypty Python
cp scripts/predict_*.py railway-full-migration/scripts/
```

#### **1.2 Konfiguracja**
- ✅ `package.json` - zaktualizowano start script
- ✅ `next.config.js` - standalone output
- ✅ `railway.toml` - konfiguracja Railway
- ✅ `Dockerfile` - multi-stage build
- ✅ `requirements-railway.txt` - Python dependencies

### **Faza 2: Migracja API (2-3 dni)**

#### **2.1 Nowe endpointy**
- ✅ `/api/health` - health check dla Railway
- ✅ `/api/valuation-railway` - wycena z lokalnymi modelami
- 🔄 Aktualizacja istniejących API routes

#### **2.2 Integracja Python**
- ✅ `predict_ensemble_railway.py` - skrypt predykcji
- ✅ Komunikacja Node.js ↔ Python przez spawn
- ✅ Fallback do heurystyki

### **Faza 3: Deployment Railway (1 dzień)**

#### **3.1 Setup Railway**
```bash
# Zainstaluj Railway CLI
npm install -g @railway/cli

# Login do Railway
railway login

# Utwórz nowy projekt
railway new
```

#### **3.2 Konfiguracja**
- Połącz GitHub repo
- Ustaw root directory: `railway-full-migration/`
- Konfiguruj environment variables
- Ustaw custom domain

#### **3.3 Pierwsze deployment**
```bash
# Deploy z CLI
railway up

# Lub automatycznie z GitHub
git push origin main
```

### **Faza 4: Testowanie (2-3 dni)**

#### **4.1 Testy funkcjonalne**
- [ ] Kalkulator wyceny działa
- [ ] Modele ML ładują się poprawnie
- [ ] API endpoints odpowiadają
- [ ] Health check działa
- [ ] Fallback do heurystyki

#### **4.2 Testy wydajnościowe**
- [ ] Czas ładowania strony < 3s
- [ ] Czas predykcji ML < 5s
- [ ] Memory usage < 6GB
- [ ] CPU usage optimized

#### **4.3 Testy integracyjne**
- [ ] Wszystkie kalkulatory działają
- [ ] Blog i strony statyczne
- [ ] Formularze kontaktowe
- [ ] SEO i meta tags

### **Faza 5: Przełączenie DNS (1 dzień)**

#### **5.1 Backup**
- Pełny backup bazy danych (jeśli jest)
- Backup konfiguracji Vercel
- Export analytics data

#### **5.2 DNS Migration**
```bash
# Ustaw custom domain w Railway
railway domain add your-domain.com

# Zaktualizuj DNS records
# A record: your-domain.com -> Railway IP
# CNAME: www.your-domain.com -> your-app.railway.app
```

#### **5.3 SSL & Security**
- Railway automatycznie konfiguruje SSL
- Sprawdź security headers
- Testuj HTTPS redirects

## 🔧 **Konfiguracja środowiska**

### **Environment Variables (Railway)**
```bash
# Next.js
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000

# Database (jeśli używasz)
DATABASE_URL=postgresql://...

# Auth (jeśli używasz)
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-app.railway.app

# Analytics
GOOGLE_ANALYTICS_ID=...

# Python
PYTHON_VERSION=3.11
PYTHONPATH=/app
```

### **Build Configuration**
```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

## 📈 **Monitoring i maintenance**

### **Railway Dashboard**
- **Live logs** - real-time monitoring
- **Metrics** - CPU, RAM, network
- **Deployments** - historia wdrożeń
- **Environment** - zmienne środowiskowe

### **Health Checks**
```bash
# Sprawdź status aplikacji
curl https://your-app.railway.app/api/health

# Sprawdź modele ML
curl -X POST https://your-app.railway.app/api/valuation-railway \
  -H "Content-Type: application/json" \
  -d '{"city":"Olsztyn","area":65,"rooms":3}'
```

### **Alerting**
- Railway automatycznie wysyła alerty
- Konfiguruj webhook notifications
- Monitor error rates i response times

## 💰 **Optymalizacja kosztów**

### **Immediate optimizations**
- Użyj `.railwayignore` dla niepotrzebnych plików
- Optimize Docker layers
- Compress static assets
- Enable gzip compression

### **Long-term optimizations**
- Implement caching dla predykcji ML
- Optimize model loading (lazy loading)
- Database connection pooling
- CDN dla static assets

## 🎯 **Timeline i milestones**

| Faza | Czas | Status | Zadania |
|------|------|--------|---------|
| **Przygotowanie** | 1-2 dni | 🟡 W toku | Kopiowanie, konfiguracja |
| **Migracja API** | 2-3 dni | ⏳ Pending | Endpointy, Python integration |
| **Deployment** | 1 dzień | ⏳ Pending | Railway setup, pierwszy deploy |
| **Testowanie** | 2-3 dni | ⏳ Pending | Funkcjonalne, wydajnościowe |
| **DNS Migration** | 1 dzień | ⏳ Pending | Przełączenie domeny |
| **Total** | **7-10 dni** | 🟡 **20% Complete** | |

## ✅ **Checklist migracji**

### **Pre-migration**
- [x] Analiza obecnej architektury
- [x] Przygotowanie plików Railway
- [x] Konfiguracja Docker i Railway
- [x] Backup obecnej aplikacji
- [ ] Testy lokalne nowej konfiguracji

### **Migration**
- [ ] Deploy na Railway (staging)
- [ ] Testy funkcjonalne
- [ ] Testy wydajnościowe
- [ ] Konfiguracja custom domain
- [ ] Przełączenie DNS

### **Post-migration**
- [ ] Monitoring przez pierwsze 48h
- [ ] Optymalizacja wydajności
- [ ] Dokumentacja nowej architektury
- [ ] Training zespołu (jeśli jest)

## 🆘 **Plan rollback**

W przypadku problemów:

1. **Przywróć DNS** do Vercel (5 min)
2. **Zachowaj Railway** jako backup
3. **Debuguj problemy** offline
4. **Ponowna migracja** po naprawach

## 📞 **Kontakt i wsparcie**

- **Railway Support**: help@railway.app
- **Community Discord**: https://discord.gg/railway
- **Documentation**: https://docs.railway.com/

---

**🎯 Cel: Pełna migracja w 7-10 dni z 99.9% uptime** 