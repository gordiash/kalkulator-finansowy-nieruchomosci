# Plan Implementacji Panelu Użytkownika

## 1. Cel projektu

Celem jest stworzenie dedykowanego panelu dla zalogowanych użytkowników, który umożliwi im zarządzanie swoimi danymi, przeglądanie historii aktywności oraz dostęp do spersonalizowanych funkcji.

## 2. Funkcjonalności (Wersja MVP)

-   **Profil Użytkownika**: Wyświetlanie i edycja podstawowych danych (imię, nazwisko, e-mail).
-   **Historia Wycen**: Dostęp do listy poprzednich wycen nieruchomości wykonanych przez użytkownika.
-   **Ustawienia Konta**: Możliwość zmiany hasła.
-   **Moje Zapisane Wyceny**: Opcja zapisywania interesujących wycen do późniejszego wglądu.

## 3. Architektura i Technologie

-   **Frontend**:
    -   Framework: **Next.js (React)** - kontynuacja istniejącego stosu.
    -   Styling: **Tailwind CSS** - zgodnie z resztą aplikacji.
    -   Zarządzanie stanem: React Context lub Zustand/Jotai dla globalnego stanu użytkownika.
-   **Backend**:
    -   API: Rozbudowa istniejących **Next.js API Routes** (`src/app/api`).
    -   Autentykacja: Wykorzystanie istniejącego systemu opartego prawdopodobnie na JWT i middleware.
-   **Baza Danych**:
    -   Rozszerzenie schematu Prisma (`prisma/schema.prisma`) o nowe modele lub pola do przechowywania historii wycen i ustawień użytkownika.

## 4. Szczegółowe Zadania Implementacyjne

### Faza 1: Backend i Baza Danych

1.  **Rozbudowa schematu bazy danych:**
    -   Dodanie modelu `ValuationHistory` powiązanego z `User`.
    -   Pola w `ValuationHistory`: `id`, `userId`, `createdAt`, `inputParams` (JSON), `result` (JSON).
2.  **Stworzenie Endpointów API:**
    -   `GET /api/user/profile`: Pobiera dane zalogowanego użytkownika.
    -   `PUT /api/user/profile`: Aktualizuje dane profilu użytkownika.
    -   `POST /api/user/change-password`: Zmienia hasło użytkownika.
    -   `GET /api/user/valuations`: Zwraca paginowaną listę historii wycen.
    -   `POST /api/user/valuations`: Zapisuje nową wycenę w historii.
    -   `DELETE /api/user/valuations/:id`: Usuwa wycenę z historii.
3.  **Logika Biznesowa:**
    -   Implementacja logiki do zapisu i odczytu historii.
    -   Walidacja danych przychodzących na endpointy.
4.  **Zabezpieczenia:**
    -   Zabezpieczenie wszystkich nowych endpointów API, tak aby były dostępne tylko dla autoryzowanych (zalogowanych) użytkowników.

### Faza 2: Frontend

1.  **Stworzenie struktury panelu:**
    -   Nowy layout w `src/app/panel/layout.tsx` z nawigacją boczną.
    -   Stworzenie podstron: `/panel/profil`, `/panel/historia`, `/panel/ustawienia`.
2.  **Implementacja komponentów:**
    -   `ProfileForm`: Formularz do edycji danych użytkownika.
    -   `ChangePasswordForm`: Formularz do zmiany hasła.
    -   `ValuationsTable`: Tabela wyświetlająca historię wycen z opcjami sortowania i paginacji.
    -   `ValuationDetails`: Komponent do wyświetlania szczegółów pojedynczej wyceny.
3.  **Integracja z API:**
    -   Podłączenie komponentów do stworzonych endpointów API.
    -   Zarządzanie stanem ładowania, błędów i sukcesu operacji.
4.  **Routing i Ochrona Stron:**
    -   Dodanie logiki w `middleware.ts` lub po stronie klienta, która będzie przekierowywać niezalogowanych użytkowników z `/panel/*` na stronę logowania.

## 5. Testowanie

-   **Testy jednostkowe (Jest/RTL)**:
    -   Testowanie logiki formularzy (walidacja).
    -   Testowanie renderowania komponentów na podstawie propsów.
-   **Testy API (integracyjne)**:
    -   Sprawdzenie poprawności działania każdego endpointu (autoryzacja, walidacja, odpowiedzi).
-   **Testy End-to-End (Cypress/Playwright)**:
    -   Symulacja ścieżki użytkownika: logowanie -> wejście do panelu -> edycja profilu -> przeglądanie historii.

## 6. Wdrożenie

1.  Stworzenie i uruchomienie migracji bazy danych na środowisku deweloperskim i produkcyjnym.
2.  Wdrożenie nowej wersji aplikacji na Vercel/Railway.
3.  Monitoring logów po wdrożeniu w celu wychwycenia ewentualnych błędów. 