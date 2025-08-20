## Plan wdrożenia: Wskaźniki makroekonomiczne dla rynku nieruchomości

Cel: dodać sekcję „Rynek w liczbach” oraz infrastrukturę (API + baza + CRON) do gromadzenia i prezentacji wskaźników makro powiązanych z rynkiem nieruchomości.

### 1) Zakres i KPI
- Dane startowe:
  - Stopa referencyjna NBP, lombardowa, depozytowa
  - WIBOR 3M/6M/12M lub WIRON O/N (jeśli dostępny publicznie)
  - Inflacja CPI r/r (GUS)
  - Średnia cena m² dla miast: Warszawa, Kraków, Wrocław, Gdańsk, Poznań
- Prezentacja:
  - Strona główna: 4–8 kafelków (snapshot)
  - Strona „/analiza-rynku”: wykresy, historia, porównania
- KPI:
  - Odświeżanie: codziennie (stopy/kursy) i miesięcznie (CPI/ceny)
  - SSR strony głównej (sekcja wskaźników) < 200 ms dzięki cache
  - Pokrycie testów nowej logiki ≥ 80%

### 2) Architektura
- `src/lib/market/` – klienci zewnętrznych API + normalizacja i cache
- `src/app/api/market/` – route handlers (snapshot, serie, refresh)
- `src/components/market/` – UI: kafelki, wykresy
- `src/app/analiza-rynku/page.tsx` – strona z wykresami
- `prisma` – modele na serie i obserwacje (time series)

### 3) Źródła danych (MVP)
- NBP API (publiczne): stopy; dokumentacja: `https://api.nbp.pl/`
- GUS BDL API: CPI i budownictwo; `https://bdl.stat.gov.pl/api/v1/`
- Ceny m²: zestawienia NBP/GUS lub dataset wewnętrzny (MVP)

ENV (dodać do `.env.local`):
```
GUS_BDL_API_KEY=xxxxx            # jeżeli używamy BDL
NBP_BASE_URL=https://api.nbp.pl
```

### 4) Model danych (Prisma)
```prisma
model MarketSeries {
  id           String   @id @default(cuid())
  key          String   @unique
  name         String
  unit         String
  frequency    String   // daily | monthly | quarterly
  source       String   // nbp | gus | custom
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  observations Observation[]
}

model Observation {
  id        String   @id @default(cuid())
  seriesId  String
  date      DateTime
  value     Decimal
  createdAt DateTime @default(now())

  series    MarketSeries @relation(fields: [seriesId], references: [id])

  @@unique([seriesId, date])
  @@index([seriesId, date])
}
```
Migracje:
```
npx prisma migrate dev -n add_market_indicators
```

### 5) Klienci, normalizacja, cache
- `src/lib/market/nbp.ts` – pobieranie stóp (timeout 10s, 2x retry), mapowanie -> `MarketSeries`
- `src/lib/market/gus.ts` – CPI (autoryzacja nagłówkiem)
- `src/lib/market/store.ts` – `upsertSeries`, `upsertObservations`
- `src/lib/market/cache.ts` – `getCachedSeries(key, ttlMs)` + tagi rewalidacji
- Walidacja Zod (wartości liczbowe, zakres dat), sensowne domyślne błędy (bez szczegółów API w UI)

### 6) API (route handlers)
- `GET /api/market/indicators` – snapshot najnowszych wartości (dla kafelków)
- `GET /api/market/series?key=...&from=...&to=...` – dane do wykresów
- `POST /api/market/refresh` – ręczne odświeżenie (tylko admin)

Format odpowiedzi (snapshot):
```json
{
  "data": [
    { "key": "nbp_reference_rate", "name": "Stopa referencyjna NBP", "value": 5.75, "unit": "%", "date": "2025-01-31" }
  ]
}
```

### 7) Aktualizacja (scheduler)
- Lokalnie: `npm run market:refresh` (wywołuje endpoint refresh lub skrypt node)
- Produkcja: CRON co 24h (stopy/kursy) + co miesiąc (CPI/ceny)
- Idempotencja: unikalność `(seriesId, date)` → brak duplikatów

`package.json` – skrypt pomocniczy:
```
"market:refresh": "node scripts/market/refresh.js"
```

### 8) UI – implementacja
- `IndicatorsGrid.tsx` (Server Component): pobiera `GET /api/market/indicators`, cache 1h, 4–8 kart
- `IndicatorCard.tsx`: duża wartość, jednostka, etykieta, zmiana m/m lub r/r (opcjonalnie)
- `/analiza-rynku` (Client): wykresy (Recharts/Chart.js), filtry zakresu, wybór serii
- A11y: prawidłowa hierarchia nagłówków, focus styles, kontrast WCAG AA

Wstawienie na stronę główną (`src/app/page.tsx`):
```tsx
import IndicatorsGrid from '@/components/market/IndicatorsGrid';

{/* Rynek w liczbach */}
<IndicatorsGrid />
```

### 9) Wydajność i cache
- Tagi rewalidacji: `revalidateTag('market')` po refreshu
- SSR: `revalidate: 3600` dla snapshotu
- UI: brak ciężkich animacji; lazy-load wykresów na `/analiza-rynku`

### 10) Testy i jakość
- Jednostkowe: mapowanie NBP/GUS → model, walidacja Zod, `store.upsert*`
- Integracyjne: `GET /api/market/indicators` zwraca poprawny snapshot
- E2E: kafelki widoczne na stronie głównej
- Check lista: `npm run lint`, `npm run test`, `npm run build`

### 11) SEO i treści
- `/analiza-rynku`: `generateMetadata`, OpenGraph, Twitter cards
- `JSON-LD` typu `Dataset` (źródło: NBP/GUS), FAQ

### 12) Bezpieczeństwo
- `rateLimit` na `/api/market/*`
- Klucze wyłącznie po stronie serwera; brak ekspozycji w Client Components
- Spójne komunikaty błędów (bez wycieku szczegółów zewnętrznych API)

### 13) Roadmap (iteracje)
- Iteracja 1 (1–2 dni): schemat DB, klient NBP, snapshot na stronie głównej
- Iteracja 2 (2–3 dni): CPI z GUS, strona `/analiza-rynku` z wykresami
- Iteracja 3 (2 dni): ceny m² w miastach + filtry
- Iteracja 4 (1 dzień): CRON + monitoring + alerty błędów

### 14) Kryteria akceptacji
- Aktualne dane (≤24h) w kafelkach na stronie głównej
- Testy przechodzą w CI, zielony build
- Lighthouse (strona główna): ≥ 90/90/90/100
