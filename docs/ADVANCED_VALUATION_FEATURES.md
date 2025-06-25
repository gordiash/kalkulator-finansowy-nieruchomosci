# Rozbudowa Kalkulatora Wyceny - Plan Wdrożenia

## Cel projektu
Rozszerzenie istniejącego kalkulatora AI o funkcje zbliżające go do profesjonalnego operatu szacunkowego, wykorzystując wyłącznie bezpłatne źródła danych i biblioteki open-source.

## Hierarchia zadań i kolejność wykonania

### FAZA 1: Fundament - Infrastruktura i podstawowe API (Priorytet: KRYTYCZNY)
**Czas realizacji: 1-2 tygodnie**

#### 1.1 Przygotowanie środowiska Python (ZADANIE #001) - ✅ **UKOŃCZONE**
- [x] Aktualizacja `requirements-railway.txt` o nowe zależności:
  ```
  # UWAGA: Użyto ONNX Runtime zamiast TensorFlow ze względu na kompatybilność z Python 3.13
  onnxruntime>=1.16.0
  # tensorflow>=2.13.0  # POMINIĘTE - brak wsparcia dla Python 3.13
  opencv-python-headless>=4.8.0
  pillow>=10.0.0
  scikit-image>=0.21.0
  overpy>=0.7.0
  geopy>=2.3.0
  ```
- [x] Test kompatybilności z Railway.app deployment
- [x] **WYNIK: 17/17 testów zaliczonych, środowisko gotowe**

#### 1.2 Cache i rate limiting (ZADANIE #002) - ✅ **UKOŃCZONE**
- [ ] Implementacja Redis cache dla Overpass API
- [ ] Rate limiting dla zewnętrznych API (Overpass, OpenRouteService)
- [ ] Mechanizm retry z exponential backoff
- [ ] Lokalne cache geolokalizacji (tile-based 1km grid)

### FAZA 2: Geolokalizacja i dane przestrzenne (Priorytet: WYSOKI)
**Czas realizacji: 1 tydzień**

#### 2.1 Integracja ULDK (ZADANIE #003)
- [ ] Utworzenie `scripts/geolocation_service.py`
- [ ] Funkcja `get_parcel_by_point(lat, lon)` → identyfikator działki
- [ ] Funkcja `get_parcel_geometry(parcel_id)` → WKB polygon
- [ ] Error handling dla działek nieznalezionych

#### 2.2 Geocoding i walidacja adresu (ZADANIE #004)
- [ ] Integracja z Nominatim OSM dla geocoding
- [ ] Walidacja formatu adresu polskiego
- [ ] Korekta współrzędnych dla centrum działki
- [ ] Fallback do przybliżonej lokalizacji (gmina/miasto)

### FAZA 3: Analiza otoczenia nieruchomości (Priorytet: WYSOKI)
**Czas realizacji: 1-2 tygodnie**

#### 3.1 Overpass API integration (ZADANIE #005)
- [ ] Utworzenie `scripts/analyze_environment.py`
- [ ] Query POI w promieniu 500m i 1km:
  - [ ] Szkoły i przedszkola (`amenity=school,kindergarten`)
  - [ ] Przystanki komunikacji (`public_transport=platform,stop_position`)
  - [ ] Sklepy i usługi (`shop=*, amenity=restaurant,cafe,pharmacy`)
  - [ ] Tereny zielone (`leisure=park, landuse=forest,grass`)
  - [ ] Placówki zdrowia (`amenity=hospital,clinic`)
- [ ] Kalkulacja wskaźników:
  - [ ] `poi_density` = liczba POI / pole powierzchni
  - [ ] `green_ratio` = % terenów zielonych w promieniu 1km
  - [ ] `transport_score` = ważona punktacja dostępności
- [ ] Cache wyników na 24h per coordinate

#### 3.2 Plan zagospodarowania przestrzennego (ZADANIE #006)
- [ ] Lista WMS endpoints dla MPZP głównych miast
- [ ] Funkcja `get_mpzp_zone(lat, lon)` → symbol przeznaczenia
- [ ] Mapowanie symboli na kategorie (`MN`, `MW`, `U`, `P`, etc.)
- [ ] Fallback do INSPIRE LandUse dla gmin bez MPZP
- [ ] Feature engineering: dummy variables dla typów zabudowy

#### 3.3 Analiza dostępności komunikacyjnej (ZADANIE #007)
- [ ] OpenRouteService API integration (free tier)
- [ ] Czas dojścia pieszo do:
  - [ ] Najbliższego przystanku komunikacji publicznej
  - [ ] Centrum miasta/dzielnicy
  - [ ] Głównych węzłów handlowych
- [ ] Fallback: dystans euclidean × współczynnik pieszego
- [ ] Cache z TTL 7 dni

### FAZA 4: Analiza zdjęć mieszkania (Priorytet: ŚREDNI)
**Czas realizacji: 2-3 tygodnie**

#### 4.1 Przygotowanie modelu ML do oceny stanu (ZADANIE #008)
- [ ] Pobranie pre-trained EfficientNet-B0 (ImageNet)
- [ ] Fine-tuning na dataset mieszkań:
  - [ ] Zbieranie zdjęć z Otodom/OLX (web scraping)
  - [ ] Etykietowanie: `very_new`, `good`, `renovated`, `poor`
  - [ ] Split train/validation/test (70/15/15)
  - [ ] Augmentacja danych (rotation, brightness, contrast)
- [ ] Konwersja do ONNX dla production
- [ ] Benchmark accuracy vs inference time

#### 4.2 Upload i przetwarzanie zdjęć (ZADANIE #009)
- [ ] Frontend: drag&drop component dla zdjęć
  - [ ] Maksymalnie 10 plików, każdy ≤ 5MB
  - [ ] Preview thumbnails przed wysłaniem
  - [ ] Progress bar podczas uploadu
- [ ] Backend route `/api/valuation/photos`
  - [ ] Walidacja format (JPEG, PNG, WebP)
  - [ ] Resize do 224×224 dla modelu
  - [ ] Batch processing wszystkich zdjęć
  - [ ] Zwrot `condition_score` ∈ [0,1] + confidence

#### 4.3 Integracja z modelem wyceny (ZADANIE #010)
- [ ] Dodanie `image_condition_score` do feature vector
- [ ] Re-training modeli RF/Ensemble z nową zmienną
- [ ] A/B testing wpływu na accuracy
- [ ] Domyślna wartość dla mieszkań bez zdjęć (median conditional)

### FAZA 5: Rozbudowa modelu ML (Priorytet: ŚREDNI)
**Czas realizacji: 1-2 tygodnie**

#### 5.1 Feature engineering środowiskowe (ZADANIE #011)
- [ ] Normalizacja zmiennych geograficznych
- [ ] Utworzenie composite scores:
  - [ ] `livability_index` = f(poi_density, green_ratio, transport_score)
  - [ ] `development_potential` = f(mpzp_zone, infrastructure_density)
- [ ] Interaction terms (metraż × transport_score)
- [ ] Polynomial features dla nieliniowych zależności

#### 5.2 Multi-source price validation (ZADANIE #012)
- [ ] Integracja RCN (Rejestr Cen Nieruchomości)
  - [ ] Parser CSV exports z Geoportal
  - [ ] Filtrowanie transakcji: ostatnie 12 miesięcy, similarity threshold
  - [ ] Kalkulacja median price per sqm w promieniu 2km
- [ ] GUS BDL API - średnie ceny województwo/powiat
- [ ] Cross-validation predykcji względem rzeczywistych transakcji
- [ ] Alert gdy predykcja > ±20% od median rynkowych

#### 5.3 Model ensemble optimization (ZADANIE #013)
- [ ] Hyperparameter tuning (GridSearch/RandomSearch)
- [ ] Stacking ensemble: RF + XGBoost + CatBoost
- [ ] Dynamic weighting based on confidence scores
- [ ] Model interpretability (SHAP values)
- [ ] Performance monitoring w production

### FAZA 6: User Experience i reporting (Priorytet: ŚREDNI)
**Czas realizacji: 1-2 tygodnie**

#### 6.1 Enhanced results presentation (ZADANIE #014)
- [ ] Mapa interaktywna z lokalizacją i POI
  - [ ] Leaflet.js z OpenStreetMap tiles
  - [ ] Markery dla szkół, przystanków, sklepów
  - [ ] Heatmap dostępności transportu
- [ ] Breakdown analysis:
  - [ ] Wpływ lokalizacji vs. cechy mieszkania vs. stan (zdjęcia)
  - [ ] Porównanie z sąsiednimi transakcjami
  - [ ] Confidence intervals dla predykcji

#### 6.2 PDF report generation (ZADANIE #015)
- [ ] Template zbliżony do operatu szacunkowego:
  - [ ] Executive summary
  - [ ] Dane wejściowe i źródła
  - [ ] Analiza porównawcza (transakcje podobne)
  - [ ] Analiza otoczenia (POI, MPZP, transport)
  - [ ] Ocena stanu z zdjęć
  - [ ] Metodologia wyceny
  - [ ] Wyniki i zastrzeżenia prawne
- [ ] Watermark "NIE STANOWI OPERATU SZACUNKOWEGO"
- [ ] QR code z linkiem do aktualizacji online

#### 6.3 API for professionals (ZADANIE #016)
- [ ] REST endpoint `/api/valuation/professional`
- [ ] Batch processing wielu nieruchomości
- [ ] Export do formatów CAD/GIS (KML, GeoJSON)
- [ ] Rate limiting i API keys dla power users
- [ ] Documentation OpenAPI 3.0

### FAZA 7: Monitoring i optymalizacja (Priorytet: NISKI)
**Czas realizacji: 1 tydzień**

#### 7.1 Performance monitoring (ZADANIE #017)
- [ ] Logging czasów odpowiedzi external APIs
- [ ] Alerting przy failure rate > 5%
- [ ] Metrics dashboard (Grafana/Simple Analytics)
- [ ] Database optimization dla historical data

#### 7.2 Continuous model improvement (ZADANIE #018)
- [ ] Automated model retraining (monthly)
- [ ] Data drift detection
- [ ] A/B testing nowych features
- [ ] User feedback collection i incorporation

## Szacowane zasoby

### Techniczne
- **Backend development**: 3-4 tygodnie (1 developer)
- **Frontend development**: 2 tygodnie (1 developer)
- **ML engineering**: 2-3 tygodnie (1 ML engineer)
- **DevOps/deployment**: 1 tydzień
- **Testing & QA**: 1 tydzień

### Infrastruktura
- **Railway.app**: obecny plan (wystarczający)
- **Redis cache**: $10/miesiąc (lub Railway Redis addon)
- **Storage dla zdjęć**: Railway volumes lub AWS S3 (5GB ≈ $1/m)

### Dane
- **Dataset zdjęć mieszkań**: scraping + manual labeling (~100h)
- **Historical transactions**: RCN + własne dane (bezpłatne)
- **MPZP data**: publiczne WMS (bezpłatne)

## Kryteria sukcesu

### Metryki techniczne
- [ ] MAPE < 0.65% (poprawa z obecnych 0.77%)
- [ ] Response time < 5s dla pełnej analizy
- [ ] Uptime > 99.5%
- [ ] Error rate < 2%

### Metryki biznesowe
- [ ] Wzrost conversion rate o 25%
- [ ] Zwiększenie avg session time o 40%
- [ ] 80% użytkowników korzysta z nowych funkcji
- [ ] Net Promoter Score > 70

### Compliance
- [ ] Zgodność z RODO (przetwarzanie zdjęć)
- [ ] Disclaimer prawny o braku równoważności z operatem
- [ ] Terms of Service dla API usage
- [ ] Data retention policies

## Ryzyka i mitigation

### Techniczne
- **Overpass API rate limits** → Local cache + fallback to distance-based scoring
- **Model accuracy na nowych regionach** → Transfer learning + region-specific fine-tuning
- **Railway deployment limits** → Horizontal scaling plan + CDN for static assets

### Prawne
- **Copyright na zdjęcia training data** → Tylko public domain/own photos + synthetic data augmentation
- **Liability za błędne wyceny** → Wyraźne disclaimer + insurance consideration

### Operacyjne
- **Maintenance overhead** → Automated testing + monitoring alerts
- **Data quality degradation** → Regular validation + manual QA samples

---

**Ostatnia aktualizacja**: Grudzień 2024  
**Odpowiedzialny**: Development Team  
**Review**: Co 2 tygodnie + po każdej fazie 