# Integracja Eurostat CPI - Dokumentacja

## Przegląd

Aplikacja Kalkulatory Nieruchomości używa danych inflacyjnych (CPI) z Eurostat jako głównego źródła danych o inflacji w Polsce. Eurostat zapewnia harmonizowane dane inflacyjne dla wszystkich krajów UE.

## Źródło Danych

### Eurostat HICP (Harmonised Index of Consumer Prices)
- **Dataset**: `prc_hicp_manr` - Monthly HICP annual rate of change
- **URL API**: `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/`
- **Kraj**: `PL` (Poland)
- **Jednostka**: `RCH_A` (Rate of change - annual)
- **Kategoria**: `CP00` (All-items HICP)
- **Format**: JSON
- **Dostęp**: Bezpłatny, bez wymagania kluczy API

## Charakterystyka Danych

### Zalety Eurostat
1. **Harmonizacja UE**: Dane zgodne ze standardami europejskimi
2. **Częstotliwość**: Aktualizacje miesięczne
3. **Aktualność**: Dane dostępne z opóźnieniem 1-2 miesięcy
4. **Stabilność**: Wysokiej jakości API z dobrą dostępnością
5. **Bezpłatność**: Darmowy dostęp bez limitów

### Metodologia HICP
- **Koszyk dóbr**: Zharmonizowany dla krajów UE
- **Wagi**: Dostosowane do struktury konsumpcji w Polsce
- **Rok bazowy**: Aktualizowany regularnie
- **Pokrycie**: Wszystkie kategorie towarów i usług konsumpcyjnych

## Implementacja Techniczna

### Główne Funkcje

#### 1. `fetchEurostatCpiLatest()`
Pobiera najnowsze dane CPI dla Polski.

```typescript
const latestCpi = await fetchEurostatCpiLatest();
// Zwraca: { value: 3.4, date: "2025-06", source: "eurostat" }
```

#### 2. `fetchEurostatCpiHistory(from, to)`
Pobiera dane historyczne w określonym zakresie dat.

```typescript
const historicalData = await fetchEurostatCpiHistory('2024-01-01', '2025-06-01');
// Zwraca tablicę: [{ date: "2024-01-01", value: 4.3 }, ...]
```

#### 3. `testEurostatConnection()`
Testuje połączenie z API Eurostat.

```typescript
const connectionTest = await testEurostatConnection();
// Zwraca status połączenia i przykładowe dane
```

### Endpointy API

#### Główny endpoint CPI
```
GET /api/market/series?key=cpi_pl_ror&from=2024-08-17&to=2025-08-17
```

**Odpowiedź:**
```json
{
  "data": [
    {"date": "2024-09-01", "value": 4.2},
    {"date": "2024-10-01", "value": 4.2},
    {"date": "2025-06-01", "value": 3.4}
  ],
  "source": "eurostat",
  "count": 10
}
```

#### Test Eurostat
```
GET /api/market/test-eurostat?test=latest
GET /api/market/test-eurostat?test=history&from=2024-01-01&to=2025-06-01
```

#### Porównanie źródeł
```
GET /api/market/cpi-comparison?type=latest
GET /api/market/cpi-comparison?type=history&from=2024-01-01&to=2025-06-01
```

## Strategia Fallback

### Hierarchia Źródeł
1. **Eurostat HICP** (priorytet) - miesięczne, aktualne
2. **GUS BDL** (backup) - roczne, opóźnione  
3. **NBP** (alternatywa) - jeśli dostępne

### Automatyczne Przełączanie
```typescript
// Próba 1: Eurostat
try {
  const eurostatData = await fetchEurostatCpiHistory(from, to);
  if (eurostatData.length > 0) {
    return { data: eurostatData, source: 'eurostat' };
  }
} catch (error) {
  console.log('Eurostat failed, trying GUS...');
}

// Próba 2: GUS jako backup
const gusData = await fetchMonthlyCpiData(from, to);
return { data: gusData, source: 'gus' };
```

## Aktualne Dane (Stan na Sierpień 2025)

### Najnowsze Wartości CPI
- **Czerwiec 2025**: 3,4%
- **Maj 2025**: 3,5%
- **Kwiecień 2025**: 3,7%
- **Marzec 2025**: 4,4%
- **Luty 2025**: 4,3%

### Trend Inflacyjny
- **Szczyt**: 4,4% (marzec 2025)
- **Obecny**: 3,4% (czerwiec 2025)
- **Kierunek**: Spadkowy trend inflacji

## Porównanie z Innymi Źródłami

### Eurostat vs GUS
| Aspekt | Eurostat | GUS |
|--------|----------|-----|
| **Metodologia** | HICP (harmonizowana UE) | Krajowy CPI |
| **Częstotliwość** | Miesięczne | Roczne |
| **Aktualność** | Czerwiec 2025 (3,4%) | Grudzień 2024 (3,6%) |
| **API** | Stabilne, bezpłatne | Problemy z niektórymi zmiennymi |
| **Koszyk dóbr** | Zharmonizowany UE | Dostosowany do Polski |

### Różnice w Wartościach
- **Różnica bezwzględna**: 0,2 p.p.
- **Różnica procentowa**: ~5,7%
- **Przyczyny różnic**:
  - Różne metodologie (HICP vs krajowy CPI)
  - Różne okresy (czerwiec 2025 vs grudzień 2024)
  - Różne koszyki dóbr konsumpcyjnych

## Wykorzystanie w Kalkulatorach

### Kalkulator Zakupu Nieruchomości
- Prognozowanie wzrostu cen nieruchomości
- Kalkulacja realnej stopy zwrotu
- Analiza wpływu inflacji na koszty utrzymania

### Kalkulator Wynajmu
- Indeksacja czynszów
- Prognozowanie kosztów operacyjnych
- Analiza realnej rentowności inwestycji

### Kalkulator Zdolności Kredytowej
- Stress testing z uwzględnieniem inflacji
- Prognozowanie kosztów życia
- Analiza realnej siły nabywczej

### Kalkulator Wyceny AI
- Korekta modeli o czynnik inflacyjny
- Prognozowanie trendów cenowych
- Analiza makroekonomiczna

## Monitoring i Jakość Danych

### Automatyczne Testy
- Codzienne sprawdzanie dostępności API
- Walidacja jakości danych
- Monitoring opóźnień w publikacji

### Alerty
- Powiadomienia o problemach z API
- Alerty o znaczących zmianach inflacji
- Monitoring różnic między źródłami

### Backup i Redundancja
- Automatyczne przełączanie na GUS w przypadku problemów
- Cache'owanie ostatnich danych
- Graceful degradation funkcjonalności

## Zgodność i Licencje

### Eurostat
- **Licencja**: Otwarte dane publiczne
- **Warunki użytkowania**: Bezpłatne użytkowanie komercyjne
- **Atrybucja**: Zalecane wskazanie źródła

### Implementacja
- **GDPR**: Nie dotyczy (dane publiczne, zagregowane)
- **Caching**: Dozwolone i zalecane
- **Rate limiting**: Brak oficjalnych limitów

## Przyszłe Rozszerzenia

### Planowane Funkcje
1. **Prognozowanie inflacji** - modele predykcyjne
2. **Inflacja sektorowa** - dane dla kategorii mieszkaniowych
3. **Porównania międzynarodowe** - inflacja w innych krajach UE
4. **Alerty inflacyjne** - powiadomienia o znaczących zmianach

### Optymalizacje
1. **Caching inteligentny** - cache z TTL dostosowanym do częstotliwości publikacji
2. **Kompresja danych** - optymalizacja transferu
3. **Predykcja braków** - interpolacja brakujących danych
4. **Machine Learning** - wykrywanie anomalii w danych

## Kontakt i Wsparcie

W przypadku problemów z danymi Eurostat:
1. Sprawdź status API: `/api/market/test-eurostat?test=connection`
2. Porównaj z innymi źródłami: `/api/market/cpi-comparison?type=latest`
3. Sprawdź logi aplikacji pod kątem błędów API
4. Skontaktuj się z zespołem deweloperskim

---

*Dokumentacja aktualizowana: Sierpień 2025*
*Wersja API Eurostat: 1.0*
*Status integracji: Produkcja - Stabilna*