# Plan Migracji Logiki Obliczeniowej do Backendu PHP

Dokument ten opisuje kroki niezbędne do przeniesienia całej logiki biznesowej kalkulatorów z aplikacji klienckiej (Next.js) do dedykowanego API napisanego w języku PHP.

---

### Faza 1: Stworzenie i Implementacja Backendu API w PHP

**Cel:** Opracowanie w pełni funkcjonalnego i przetestowanego API, które replikuje całą logikę obliczeniową istniejącą na frontendzie.

- **1.1. Konfiguracja Środowiska i Struktury Projektu**
    - [ ] Stworzenie katalogu `/api` w głównym folderze projektu.
    - [ ] Ustawienie lokalnego serwera PHP (np. za pomocą XAMPP, Laragon lub wbudowanego serwera PHP) do testowania.
    - [ ] Utworzenie pliku `api/calculate.php` jako głównego endpointu.
    - [ ] Zdefiniowanie podstawowej konfiguracji w pliku (obsługa błędów, nagłówki CORS).

- **1.2. Implementacja Logiki w PHP (Tłumaczenie z JS)**
    - **1.2.1. Funkcje Pomocnicze:**
        - [ ] Przeniesienie i adaptacja funkcji `calculateNotaryFee` (obliczanie taksy notarialnej).
    - **1.2.2. Główny Silnik Harmonogramu:**
        - [ ] Przeniesienie i adaptacja funkcji `generateSchedule` do PHP. Musi obsługiwać:
            - [ ] Raty równe i malejące.
            - [ ] Logikę ubezpieczenia pomostowego.
            - [ ] Wszystkie warianty nadpłat (jednorazowa, miesięczna, roczna; skracanie okresu, zmniejszanie raty).
    - **1.2.3. Główna Funkcja Obliczeniowa:**
        - [ ] Stworzenie w PHP odpowiednika funkcji `calculate`, która:
            - [ ] Oblicza koszty początkowe (PCC, prowizje, opłaty sądowe).
            - [ ] Wywołuje logikę harmonogramu (`generateSchedule`).
            - [ ] Obsługuje symulację zmiany stóp procentowych.
            - [ ] Agreguje wszystkie dane do finalnej odpowiedzi.

- **1.3. Komunikacja i Bezpieczeństwo API**
    - [ ] Implementacja odczytu danych wejściowych z żądania `POST` w formacie JSON.
    - [ ] Implementacja solidnej walidacji i sanityzacji wszystkich danych wejściowych (kluczowe dla bezpieczeństwa).
    - [ ] Ustrukturyzowanie odpowiedzi API w spójny format JSON.
    - [ ] Implementacja obsługi błędów i zwracanie odpowiednich kodów statusu HTTP (np. 400 dla złych danych, 500 dla błędów serwera).

- **1.4. Testowanie Backendu**
    - [ ] Przeprowadzenie testów jednostkowych dla poszczególnych funkcji obliczeniowych w PHP.
    - [ ] Wykonanie testów integracyjnych za pomocą narzędzia typu Postman/Insomnia:
        - [ ] Wysłanie zapytań z różnymi zestawami danych.
        - [ ] Weryfikacja poprawności obliczeń poprzez porównanie z wynikami z obecnego frontendu.
        - [ ] Testowanie przypadków brzegowych (wartości zerowe, ujemne, nietypowe dane).

---
### Faza 2: Refaktoryzacja Frontendu (Next.js)

**Cel:** "Odchudzenie" frontendu z logiki obliczeniowej i przekształcenie go w klienta dla nowego API PHP.

- **2.1. Stworzenie Warstwy Komunikacji z API**
    - [ ] Utworzenie dedykowanego serwisu lub hooka (np. `useApi.ts`) do obsługi zapytań `fetch` do backendu.
    - [ ] Zdefiniowanie typów (TypeScript) dla danych wejściowych (request) i wyjściowych (response) z API dla pełnego bezpieczeństwa typów.

- **2.2. Modyfikacja Komponentu Kalkulatora**
    - [ ] Wprowadzenie stanów `isLoading` i `error` do zarządzania cyklem życia zapytania do API.
    - [ ] Przebudowa funkcji `handleCalculate` tak, aby:
        - [ ] Ustawiała `isLoading` na `true`.
        - [ ] Zbierała dane z formularza.
        - [ ] Wywoływała serwis API.
        - [ ] Po otrzymaniu odpowiedzi, aktualizowała wszystkie stany (wyniki, harmonogram) i ustawiała `isLoading` na `false`.
        - [ ] W przypadku błędu, zapisywała informację o błędzie w stanie.
    - [ ] Aktualizacja interfejsu użytkownika:
        - [ ] Wyświetlanie wskaźnika ładowania (spinner, zmiana tekstu na przycisku), gdy `isLoading` jest `true`.
        - [ ] Wyświetlanie komunikatu o błędzie, jeśli API zwróci błąd.
    - [ ] **Usunięcie starej logiki:** Całkowite wyczyszczenie komponentu z funkcji `calculate`, `generateSchedule` i innych, które zostały przeniesione na backend.

- **2.3. Testowanie End-to-End**
    - [ ] Przeprowadzenie pełnych testów z poziomu przeglądarki, weryfikując, czy interakcja z formularzem poprawnie wywołuje API i czy wyniki są prawidłowo renderowane.

---
### Faza 3: Wdrożenie i Finalizacja

**Cel:** Publikacja obu części aplikacji (frontend i backend) na środowisku produkcyjnym.

- **3.1. Wdrożenie Backendu PHP**
    - [ ] Wybór i konfiguracja hostingu obsługującego PHP.
    - [ ] Wgranie plików API na serwer produkcyjny.
    - [ ] Aktualizacja reguł CORS na serwerze produkcyjnym, aby zezwalały na zapytania tylko z domeny frontendu.

- **3.2. Wdrożenie Frontendu Next.js**
    - [ ] Aktualizacja adresu URL endpointu API w kodzie frontendu na adres produkcyjny.
    - [ ] Wdrożenie aplikacji Next.js na platformie hostingowej (np. Vercel).

- **3.3. Sprzątanie**
    - [ ] Usunięcie nieużywanych plików i kodu.
    - [ ] Przegląd kodu (Code Review).
    - [ ] Finalne testy na środowisku produkcyjnym.