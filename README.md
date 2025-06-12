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

### Analytics & Marketing
- **Google Analytics 4** - Analityka ruchu
- **Facebook Pixel** - Śledzenie konwersji
- **Hotjar** - Heatmapy i nagrania sesji

## 🏗️ Architektura

```
src/
├── app/                          # Next.js App Router
│   ├── api/calculate.php/        # TypeScript API endpoint
│   ├── kalkulator-zakupu-nieruchomosci/
│   ├── kalkulator-wynajmu/
│   └── kalkulator-zdolnosci-kredytowej/
├── components/                   # Komponenty React
│   ├── ui/                      # Komponenty bazowe (Radix UI)
│   └── charts/                  # Komponenty wykresów
├── hooks/                       # Custom React hooks
├── lib/                         # Logika biznesowa
│   ├── CalculationService.ts    # Serwis obliczeń
│   ├── apiService.ts           # API client
│   └── analytics.ts            # Śledzenie zdarzeń
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
