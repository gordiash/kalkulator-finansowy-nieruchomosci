# Kalkulator Wyceny Mieszkań – Plan Implementacji

---

## 1. Analiza wymagań i projekt architektury
1.1. Zdefiniowanie person i przypadków użycia (buyer, investor, research).  
1.2. Określenie kluczowych parametrów wejściowych (miasto, dzielnica, ulica, metraż, pokoje, piętro, rok budowy).  
1.3. Wybór źródeł danych (scrapowane portale, ewentualnie API publiczne).  
1.4. Specyfikacja metryk dokładności (MAPE ≤ 10 %).  
1.5. Diagram wysokopoziomowej architektury (Next.js ↔ API ↔ Baza danych ↔ Model ML).

## 2. Przygotowanie i inżynieria danych
2.1. Audyt istniejącej tabeli `nieruchomosci` (sprawdzenie braków, duplikatów).  
2.2. Czyszczenie danych (normalizacja nazw ulic, usuwanie wartości odstających).  
2.3. Enrichment – geokodowanie (szer./dł.), dystans do centrum, uczelni itp.  
2.4. Feature engineering (cena / m², stan wykończenia jako skala liczbowo-porządkowa).  
2.5. Utworzenie widoku lub materialized view `nieruchomosci` przygotowanego pod model.

## 3. Warstwa modelu (estymacja ceny)
3.1. ✅ Proof-of-Concept: prosta regresja liniowa (baseline).  
3.2. ✅ Model produkcyjny: Gradient Boosting / Random Forest lub XGBoost.  
3.3. ✅ Hyper-parameter tuning (Grid / Bayes).  
3.4. ✅ Walidacja k-fold, raportowanie dokładności.  
3.5. ✅ Serializacja modelu (pickle / ONNX) i wersjonowanie w Git LFS lub DVC.

## 4. Back-end API (Next.js Route Handlers)
4.1. ✅ Endpoint `POST /api/valuation` – przyjmuje JSON z parametrami.  
4.2. ✅ Walidacja schematu przez Zod.  
4.3. Ładowanie najnowszego modelu z `/models/latest`.  
4.4. ✅ Zwracanie prognozowanej ceny, pułapu błędu oraz timestampu modelu.  
4.5. ✅ Logowanie zapytań (i opcjonalnie zapisywanie do bazy dla dalszego uczenia).

## 5. Front-end – komponent kalkulatora
5.1. ✅ Formularz w `/kalkulator-wyceny` (Server Components + Client Inputs).  
5.2. Autouzupełnianie miasta/dzielnicy/ulicy (lista z bazy).  
5.3. Klientowa walidacja i formatowanie liczb (maski input).  
5.4. Zapytanie do `/api/valuation` z useMutation (React Query).  
5.5. Wyświetlenie wyniku w kaflu + przedział ufności.  
5.6. Obsługa stanów: ładowanie, błąd, brak danych dla lokalizacji.

## 6. Integracja z innymi kalkulatorami
6.1. Po otrzymaniu wyceny renderuj trzy przyciski akcji:  
  • "Oblicz ratę kredytu" → `/kalkulator-zdolnosci-kredytowej?kwota=550000`.  
  • "Sprawdź rentowność wynajmu" → `/kalkulator-wynajmu?cena=550000`.  
  • "Koszty transakcyjne" → `/kalkulator-zakupu-nieruchomosci?cena=550000`.  
6.2. Propagacja parametrów przez URL-query i pre-wypełnianie formularzy docelowych.  
6.3. Test E2E przepływu użytkownika (Playwright).

## 7. UX / UI / Accessibility
7.1. Design system – wykorzystanie istniejących komponentów UI.  
7.2. Responsywność i mobile first.  
7.3. ARIA labels, kontrast, klawiaturowa nawigacja.  
7.4. Copywriting: microcopy, tooltipy z definicjami pojęć.

## 8. SEO & Analytics
8.1. Dynamiczne meta title "Kalkulator Wyceny Mieszkania – {Miasto} {Rok Budowy} ...".  
8.2. Schema.org `RealEstate` + `Offer`.  
8.3. Rejestrowanie eventów GA4/Firebase: `valuation_submitted`, `valuation_result_viewed`, kliknięcia przycisków akcji.  
8.4. Dodanie strony do mapy XML `/sitemap.xml` z priorytetem 0.9.

## 9. Testy i CI/CD
9.1. Jednostkowe (Jest) – walidacja wejścia, funkcja predykcji.  
9.2. Integracyjne – request → response z mockiem modelu.  
9.3. E2E (Playwright) – pełny happy path i edge-case (empty result).  
9.4. Pipeline GitHub Actions: lint → test → build → deploy → Invalidate Cache.

## 10. Utrzymanie i monitoring
10.1. Monitorowanie błędów (Sentry).  
10.2. Cron retraining modelu co 30 dni na nowych danych.  
10.3. Alerty, kiedy MAPE > 15 % w production.  
10.4. Dokumentacja wersji modelu w CHANGELOG.

---

### Priorytety Fazowe (MVP → Full)

| Faza | Zakres | Czas (roboczo-dni) |
|------|--------|---------------------|
| 1 | Etapy 1 + 4 + 5 (MVP statyczny model) | 5–7 |
| 2 | Etapy 2 + 3 (ulepszony model) | 8–12 |
| 3 | Etap 6 + 7 + 8 | 4–6 |
| 4 | Etap 9 + 10 | 3–4 |

> **Uwaga :** Dane ofertowe przedstawiają ceny wywoławcze – należy uwzględnić współczynnik negocjacyjny (np. −6 %) lub zebrać dane cen transakcyjnych w kolejnych iteracjach. 