# PLAN ROZBUDOWY KALKULATORA ZDOLNOŚCI KREDYTOWEJ

## Cel
Modernizacja i rozbudowa kalkulatora zdolności kredytowej (`/kalkulator-zdolnosci-kredytowej/page.tsx`) w celu dostarczania bardziej realistycznych i użytecznych wyników dla użytkownika.

---

## Etap 1: Modernizacja UI i Dodanie Kluczowych Parametrów

### 1.1. Przebudowa interfejsu na shadcn/ui
[x] Zrefaktoryzuj istniejące pola `input` i `button` na komponenty `Input`, `Button`, `Label` z biblioteki shadcn/ui.
[x] Owiń cały kalkulator w komponent `Card`, a nagłówek w `CardHeader`, `CardTitle` i `CardDescription`.
[x] Ulepsz responsywność układu za pomocą siatki (grid).

### 1.2. Dodanie podstawowych parametrów kredytu
[x] Dodaj pole `Input` dla **okresu kredytowania (w latach)** z domyślną wartością 30.
[x] Dodaj pole `Input` dla **oprocentowania kredytu (%)** z domyślną wartością np. 7.5.
[x] Dodaj komponent `Select` do wyboru **rodzaju rat** (równe / malejące).

### 1.3. Aktualizacja logiki obliczeniowej
[x] Zmodyfikuj funkcję `calculateCreditScore`, aby uwzględniała okres kredytowania i oprocentowanie w odwróconej formule na kwotę kredytu.
[x] Wprowadź rozróżnienie w obliczeniach dla rat równych i malejących.

---

## Etap 2: Uszczegółowienie Danych Wejściowych

### 2.1. Rozbudowa sekcji dochodów
[x] Dodaj pole `Input` na **miesięczny dochód netto drugiego kredytobiorcy**.
[x] (Opcjonalnie) Dodaj `Select` do wyboru **typu umowy** (Umowa o pracę, B2B, Umowa zlecenie/o dzieło) i uwzględnij różne wagi w obliczeniach.

### 2.2. Rozbudowa sekcji zobowiązań
[x] Dodaj pole `Input` na **sumę przyznanych limitów na kartach kredytowych**.
[x] Dodaj pole `Input` na **sumę limitów w koncie (debet)**.
[x] Zaktualizuj logikę, aby wliczała standardowy procent (np. 3-5%) sumy limitów do miesięcznych obciążeń.

---

## Etap 3: Ulepszona Logika i Wizualizacja Wyników

### 3.1. Urealnienie kosztów utrzymania
[x] Zastąp uproszczony model `liczba osób * 1000 zł` bardziej szczegółowym:
    - 1 osoba: ~1300 zł
    - 2 osoby: ~2200 zł
    - 3 osoby: ~3000 zł
    - 4 osoby: ~3800 zł
    - każda kolejna: +700 zł

### 3.2. Wprowadzenie wskaźnika DSTI
[x] Dodaj `Select` pozwalający wybrać **poziom wskaźnika DSTI** (np. 40% - konserwatywnie, 50% - standardowo).
[x] Zmodyfikuj główną formułę obliczeniową, aby maksymalna rata była liczona jako: `(dochód_łączny * DSTI) - suma_istniejących_rat`.

### 3.3. Wizualizacja wyników
[x] Zintegruj bibliotekę `recharts`.
[x] Stwórz **wykres kołowy**, który przedstawia strukturę miesięcznych dochodów i wydatków.
    - Kategorie: Stałe opłaty, Inne kredyty, Koszty utrzymania, Dostępna kwota na ratę, Pozostałe środki.
[x] Ulepsz prezentację wyników, aby były bardziej czytelne.

---

## Etap 4: Przeniesienie Logiki na Backend (Opcjonalne)

### 4.1. Modyfikacja Backendu PHP (`/api/calculate.php`)
[x] Wprowadź nowy warunek rozpoznający typ kalkulacji, np. `calculationType: 'credit-score'`.
[x] Zaimplementuj całą rozbudowaną logikę obliczeniową z etapów 1-3 w PHP.
[x] Ujednolić format odpowiedzi JSON.

### 4.2. Aktualizacja Frontendu
[x] Zrefaktoryzuj komponent, aby wysyłał zapytanie `POST` do `/api/calculate.php` z nowym parametrem.
[x] Dodaj obsługę stanu ładowania (`isLoading`) i błędów (`error`).
[x] Dostosuj wyświetlanie wyników do danych otrzymywanych z API.

---

## Checkpoints

- [x] **Checkpoint 1**: UI zmodernizowane, dodano pola okresu i oprocentowania.
- [x] **Checkpoint 2**: Dodano szczegółowe pola dochodów i zobowiązań.
- [x] **Checkpoint 3**: Wprowadzono ulepszoną logikę kosztów utrzymania i DSTI.
- [x] **Checkpoint 4**: Wyniki są wizualizowane na wykresie kołowym.
- [x] **Checkpoint 5**: Całość działa w oparciu o backend PHP.

---

**Priorytet**: Średni  
**Status**: ✅ UKOŃCZONE