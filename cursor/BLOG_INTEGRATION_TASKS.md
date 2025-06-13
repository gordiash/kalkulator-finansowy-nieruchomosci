## Faza 1: Przygotowanie i Instalacja Strapi

### Zadanie 1.1: Konfiguracja środowiska Strapi
- [x] Zainstaluj Node.js (wersja 18 lub wyższa)
- [x] Utwórz nowy projekt Strapi: `npx create-strapi-app@latest blog-backend --quickstart`
- [x] Skonfiguruj bazę danych (PostgreSQL lub SQLite dla developmentu)
- [x] Uruchom Strapi w trybie deweloperskim: `npm run develop`
- [x] Dostęp do panelu administracyjnego: `http://localhost:1337/admin`

### Zadanie 1.2: Utworzenie konta administratora
- [ ] Utwórz pierwsze konto administratora w Strapi
- [ ] Skonfiguruj podstawowe ustawienia bezpieczeństwa
- [ ] Zmień domyślne hasło na bezpieczne

## Faza 2: Modelowanie Danych Bloga

### Zadanie 2.1: Utworzenie Content Type "Blog Post"
- [x] Utwórz nowy Content Type o nazwie "BlogPost"
- [x] Dodaj pola:
  // ... istniejące pola ...

### Zadanie 2.2: Utworzenie Content Type "Blog Category"
- [x] Utwórz Content Type "BlogCategory"
- [x] Dodaj pola:
  // ... istniejące pola ...
- [x] Dodaj relację Many-to-Many między BlogPost a BlogCategory

### Zadanie 2.3: Konfiguracja uprawnień API
- [x] Skonfiguruj uprawnienia dla ról Public:
  // ... istniejące uprawnienia ...
- [x] Skonfiguruj uprawnienia dla ról Authenticated (jeśli potrzebne)
- [x] Przetestuj API endpoints w Postman/Insomnia

## Faza 3: Integracja z Aplikacją Next.js

### Zadanie 3.1: Konfiguracja klienta API
- [x] Zainstaluj biblioteki: `npm install axios @types/node`
- [x] Utwórz plik `src/lib/strapi.ts` z konfiguracją klienta Strapi
- [x] Dodaj zmienne środowiskowe:
  // ... ENV ...
- [x] Utwórz funkcje pomocnicze do pobierania danych z API

### Zadanie 3.2: Utworzenie typów TypeScript
- [x] Utwórz plik `src/types/blog.ts` z definicjami typów:
  // ... typy ...

### Zadanie 3.3: Stworzenie strony listy postów
- [x] Utwórz `src/app/blog/page.tsx`
- [x] Implementuj pobieranie listy postów z paginacją
- [x] Dodaj komponenty:
  // ... komponenty ...
- [x] Zaimplementuj SEO meta tags

### Zadanie 3.4: Stworzenie strony pojedynczego posta
- [x] Utwórz `src/app/blog/[slug]/page.tsx`
- [x] Implementuj pobieranie posta po slug
- [x] Dodaj komponenty:
  // ... komponenty ...
- [x] Zaimplementuj structured data (JSON-LD)

### Zadanie 3.5: Optymalizacja wydajności
- [x] Zaimplementuj ISR (Incremental Static Regeneration)
- [ ] Skonfiguruj cache dla API calls
- [x] Dodaj lazy loading dla obrazów
- [ ] Zoptymalizuj SEO i Core Web Vitals 