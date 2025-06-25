# Kalkulatory Nieruchomości

Nowoczesne kalkulatory finansowe dla rynku nieruchomości w Polsce, zbudowane z Next.js 14, React i TypeScript.

## 🚀 Funkcjonalności

### 1. Kalkulator Zakupu Nieruchomości
- Obliczanie pełnych kosztów zakupu nieruchomości
- Symulacja kredytu hipotecznego z różnymi parametrami
- Harmonogram spłat (raty równe i malejące)
- Analiza nadpłat kredytu
- Koszty dodatkowe (PCC, taksa notarialna, prowizje)
- Generowanie raportów PDF

### 2. Kalkulator Opłacalności Wynajmu
- Analiza ROI dla nieruchomości inwestycyjnych
- Obliczanie cash flow miesięcznego i rocznego
- Uwzględnienie okresów pustostanów
- Koszty operacyjne i zarządzania
- Optymalizacja podatkowa (ryczałt vs skala)
- Projekcja wieloletnia

### 3. Kalkulator Zdolności Kredytowej
- Zaawansowany algorytm oceny zdolności kredytowej
- Stress test stóp procentowych (+2.5%)
- Dynamiczne koszty utrzymania
- Uwzględnienie wszystkich zobowiązań finansowych
- Różne typy umów o pracę
- Wizualizacja struktury budżetu

### 4. Kalkulator Wyceny Mieszkań 🚀 AI Ensemble
- **Zaawansowana sztuczna inteligencja** - Model Ensemble (LightGBM + Random Forest + CatBoost)
- **Dokładność 0.77% MAPE** - Najlepsza precyzja wyceny w Polsce
- **Inteligentny fallback** - Ensemble → Random Forest → Heurystyka
- **Autouzupełnianie lokalizacji** - Baza miast i dzielnic z regionu Olsztyn
- **Integracja z kalkulatorami** - Przekazywanie ceny do innych narzędzi
- **100+ cech** - Ultra-zaawansowane feature engineering

## 🛠️ Stack Technologiczny

### Frontend
- **Next.js 14** - React framework z App Router
- **TypeScript** - Typowanie statyczne
- **Tailwind CSS** - Framework CSS
- **Radix UI** - Komponenty dostępnościowe
- **Recharts** - Wykresy i wizualizacje
- **jsPDF** - Generowanie raportów PDF

### Backend
- **Next.js API Routes** - TypeScript backend
- **Vercel** - Deployment i hosting
- **Airtable** - Baza danych newslettera

### Machine Learning
- **Python** - Środowisko ML (scikit-learn, pandas, numpy, LightGBM, CatBoost)
- **EstymatorAI** - Model produkcyjny (0.77% MAPE) - LightGBM + Random Forest + CatBoost
- **Advanced Fallback** - Random Forest (15.56% MAPE), Heurystyka (25% MAPE)
- **MySQL** - Baza danych nieruchomości (566 rekordów)
- **Feature Engineering** - 100+ cech (lokalizacja, powierzchnia, wiek, interakcje)
- **Hyperparameter Tuning** - Optuna, GridSearchCV, Weighted Averaging

### Analytics & Marketing
- **Google Analytics 4** - Analityka ruchu
- **Facebook Pixel** - Śledzenie konwersji
- **Hotjar** - Heatmapy i nagrania sesji

## 🏗️ Architektura

```
src/
├── app/                          # Next.js App Router
│   ├── api/                     # API endpoints
│   │   ├── calculate.php/       # TypeScript API endpoint
│   │   ├── valuation/           # 🤖 ML wycena mieszkań
│   │   ├── valuation-ensemble/  # 🚀 Advanced EstymatorAI
│   │   └── locations/           # Autouzupełnianie miast/dzielnic
│   ├── kalkulator-zakupu-nieruchomosci/
│   ├── kalkulator-wynajmu/
│   ├── kalkulator-zdolnosci-kredytowej/
│   └── kalkulator-wyceny/       # 🤖 AI Kalkulator wyceny
├── components/                   # Komponenty React
│   ├── ui/                      # Komponenty bazowe (Radix UI)
│   ├── charts/                  # Komponenty wykresów
│   └── ValuationCalculator.tsx  # 🤖 Komponent wyceny AI
├── hooks/                       # Custom React hooks
│   └── useLocations.ts          # Hook lokalizacji
├── lib/                         # Logika biznesowa
│   ├── CalculationService.ts    # Serwis obliczeń
│   ├── apiService.ts           # API client
│   └── analytics.ts            # Śledzenie zdarzeń
├── scripts/                     # 🤖 Machine Learning
│   ├── train_random_forest.py  # Trenowanie RF model
│   ├── predict_rf.py           # Predykcja ML
│   ├── train_advanced_ensemble.py # 🚀 Advanced models
│   └── analyze_model_errors.py # Analiza błędów
└── types/                       # Definicje typów TypeScript
```

## 🧮 Logika Obliczeniowa

### Kalkulator Zakupu
- **Harmonogram spłat**: Implementacja algorytmów rat równych i malejących
- **Nadpłaty**: Jednorazowe, miesięczne i roczne z opcją skracania okresu lub obniżania rat
- **Ubezpieczenie pomostowe**: Tymczasowe zwiększenie marży w pierwszych miesiącach
- **Stress test**: Symulacja zmiany stóp procentowych

### Kalkulator Wynajmu  
- **ROI**: Return on Investment z uwzględnieniem wszystkich kosztów
- **Cash-on-cash return**: Analiza gotówkowego zwrotu z inwestycji
- **Optymalizacja podatkowa**: Porównanie ryczałtu vs skali podatkowej
- **Projekcja**: 10-letnia prognoza wzrostu wartości i czynszów

### Kalkulator Zdolności Kredytowej
- **DSTI**: Debt Service to Income ratio z limitami dla różnych poziomów dochodów
- **Stress test**: Automatyczne zwiększenie stopy o 2.5% zgodnie z wymogami KNF
- **Dynamiczne koszty życia**: Bazowa kwota + 10% dochodu netto
- **Wagi zatrudnienia**: Różne współczynniki dla typów umów

## 🚀 Deployment na Vercel

### Automatyczny Deploy
```bash
# Push do repozytorium automatycznie wdraża na Vercel
git add .
git commit -m "Deploy to production"
git push origin main
```

### Zmienne Środowiskowe
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXX
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=XXXXXXXX
NEXT_PUBLIC_HOTJAR_ID=XXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXX
AIRTABLE_TABLE_NAME=Newsletter
AIRTABLE_ACCESS_TOKEN=patXXXXXXXXXX
```

### Build Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## 📱 Responsywność

Aplikacja jest w pełni responsywna z breakpointami:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

## 🎯 SEO i Performance

- **Static Generation**: Pre-renderowane strony dla lepszego SEO
- **Meta tags**: Dynamiczne meta opisy dla każdego kalkulatora
- **Core Web Vitals**: Optymalizacja metryk wydajności
- **Lighthouse Score**: 95+ we wszystkich kategoriach

## 🔧 Instalacja i Uruchomienie

```bash
# Klonowanie repozytorium
git clone https://github.com/your-username/kalkulatory-nieruchomosci.git
cd kalkulatory-nieruchomosci

# Instalacja zależności
npm install

# Uruchomienie w trybie deweloperskim
npm run dev

# Build produkcyjny
npm run build
npm start
```

## 📄 Licencja

Ten projekt jest dostępny na licencji MIT. Zobacz plik `LICENSE` dla szczegółów.

## 🤝 Wsparcie

Jeśli masz pytania lub sugestie, skontaktuj się poprzez:
- Email: kontakt@kalkulatory-nieruchomosci.pl
- GitHub Issues

---

**Notatka**: Ten projekt został przepisany z PHP na TypeScript/Next.js dla lepszej kompatybilności z Vercel i nowoczesnym stack'iem technologicznym.

## Konfiguracja SEO i Google Search Console

### Problemy zidentyfikowane i rozwiązane

#### 1. Duplikaty bez canonical URL
**Problem:** Google indeksuje nieistniejące URL-e:
- `/kalkulator-wartosci-najmu`
- `/kalkulator-roi`

**Rozwiązanie:** Dodano przekierowania 301 w `next.config.ts` kierujące na `/kalkulator-wynajmu`

#### 2. Błąd 404 dla `/kalkulator-inwestycji`
**Rozwiązanie:** Dodano przekierowanie 301 na `/kalkulator-wynajmu`

#### 3. Canonical URL używa fallback `https://example.com`
**Problem:** Brak konfiguracji `NEXT_PUBLIC_SITE_URL`

**Rozwiązanie:**
1. Dodano `NEXT_PUBLIC_SITE_URL` do `env.example`
2. W produkcji ustaw: `NEXT_PUBLIC_SITE_URL=https://www.kalkulatorynieruchomosci.pl`
3. Wszystkie strony teraz mają poprawne canonical URL

#### 4. Strony o-nas i kontakt dodane do sitemap
- Dodano canonical URL dla stron `/o-nas` i `/kontakt`
- Dodano te strony do `sitemap.ts`
- Ustawiono odpowiednie priorytety SEO

### Wymagane zmienne środowiskowe

```bash
# W .env.local lub .env.production
NEXT_PUBLIC_SITE_URL=https://www.kalkulatorynieruchomosci.pl
```

### Weryfikacja

Po wdrożeniu sprawdź:
1. Przekierowania działają: `/kalkulator-roi` → `/kalkulator-wynajmu`
2. Canonical URL są poprawne (nie zawierają `example.com`)
3. Sitemap.xml zawiera wszystkie strony
4. Robots.txt wskazuje na poprawny sitemap

### Obsługa Google Search Console

1. **Przekierowania 301** automatycznie informują Google o zmianach URL
2. **Canonical URL** zapobiegają duplikatom
3. **Sitemap** pomaga w indeksacji nowych stron
4. Możesz użyć "URL Inspection Tool" w GSC aby przyspieszyć indeksację
