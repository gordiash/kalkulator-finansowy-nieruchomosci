# Lista Zadań: Implementacja Panelu Użytkownika

Poniższa lista zadań została wygenerowana na podstawie `PLAN_PANELU_UZYTKOWNIKA.md`.

## Faza 1: Backend i Baza Danych

-   [x] **Zadanie 1: Rozbudowa schematu bazy danych (Prisma)**
    -   [x] 1.1: Zdefiniuj model `ValuationHistory` w `prisma/schema.prisma`.
    -   [x] 1.2: Połącz model `ValuationHistory` relacją z modelem `User`.
    -   [x] 1.3: Wygeneruj i uruchom migrację bazy danych.

-   [x] **Zadanie 2: Endpointy API dla profilu użytkownika** (Zależne od: Zadanie 1)
    -   [x] 2.1: Stwórz `GET /api/user/profile`.
    -   [x] 2.2: Stwórz `PUT /api/user/profile` wraz z walidacją danych.
    -   [x] 2.3: Stwórz `POST /api/user/change-password` z logiką zmiany hasła.

-   [x] **Zadanie 3: Endpointy API dla historii wycen** (Zależne od: Zadanie 1)
    -   [x] 3.1: Stwórz `GET /api/user/valuations` z obsługą paginacji.
    -   [x] 3.2: Stwórz `POST /api/user/valuations` do zapisywania nowych wycen.
    -   [x] 3.3: Stwórz `DELETE /api/user/valuations/:id`.

-   [x] **Zadanie 4: Zabezpieczenie endpointów** (Zależne od: Zadanie 2, Zadanie 3)
    -   [x] 4.1: Zaimplementuj middleware lub logikę weryfikującą token JWT dla wszystkich endpointów w `/api/user/*`.
    -   [x] 4.2: Dodaj system autoryzacji JWT z endpointami `/api/auth/login` i `/api/auth/register`.
    -   [x] 4.3: Zabezpiecz routing `/panel` w middleware.ts.

## Faza 2: Frontend

-   [x] **Zadanie 5: Struktura i routing panelu**
    -   [x] 5.1: Stwórz plik `src/app/panel/layout.tsx` z nawigacją.
    -   [x] 5.2: Stwórz puste strony: `profil`, `historia`, `ustawienia` w `src/app/panel/`.
    -   [x] 5.3: Dodaj logikę ochrony routingu w `middleware.ts`, aby `/panel` był dostępny tylko dla zalogowanych.

-   [x] **Zadanie 6: Implementacja komponentów profilu** (Zależne od: Zadanie 4, Zadanie 5)
    -   [x] 6.1: Stwórz komponent `ProfileForm`.
    -   [x] 6.2: Zintegruj `ProfileForm` z `GET` i `PUT /api/user/profile`.
    -   [x] 6.3: Stwórz komponent `ChangePasswordForm`.
    -   [x] 6.4: Zintegruj `ChangePasswordForm` z `POST /api/user/change-password`.

-   [x] **Zadanie 7: Implementacja komponentów historii wycen** (Zależne od: Zadanie 4, Zadanie 5)
    -   [x] 7.1: Stwórz komponent `ValuationsTable` do wyświetlania listy wycen.
    -   [x] 7.2: Zintegruj `ValuationsTable` z `GET /api/user/valuations` (wraz z paginacją).
    -   [x] 7.3: Zaimplementuj funkcję usuwania wyceny (wywołanie `DELETE`).

## Faza 3: Testowanie i Wdrożenie

-   [ ] **Zadanie 8: Testy** (Zależne od: Zadanie 6, Zadanie 7)
    -   [ ] 8.1: Napisz testy jednostkowe dla formularzy.
    -   [x] 8.2: Napisz testy integracyjne dla kluczowych endpointów API.

-   [ ] **Zadanie 9: Wdrożenie** (Zależne od: Zadanie 8)
    -   [ ] 9.1: Upewnij się, że migracje bazy danych zostały uruchomione na produkcji.
    -   [ ] 9.2: Wdróż nową wersję aplikacji.
    -   [ ] 9.3: Monitoruj logi po wdrożeniu. 