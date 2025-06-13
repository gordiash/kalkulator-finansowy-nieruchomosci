# Zadania Integracji Strapi z Aplikacją - Blog AI

## Faza 1: Przygotowanie i Instalacja Strapi

### Zadanie 1.1: Konfiguracja środowiska Strapi
- [ ] Zainstaluj Node.js (wersja 18 lub wyższa)
- [ ] Utwórz nowy projekt Strapi: `npx create-strapi-app@latest blog-backend --quickstart`
- [ ] Skonfiguruj bazę danych (PostgreSQL lub SQLite dla developmentu)
- [ ] Uruchom Strapi w trybie deweloperskim: `npm run develop`
- [ ] Dostęp do panelu administracyjnego: `http://localhost:1337/admin`

### Zadanie 1.2: Utworzenie konta administratora
- [ ] Utwórz pierwsze konto administratora w Strapi
- [ ] Skonfiguruj podstawowe ustawienia bezpieczeństwa
- [ ] Zmień domyślne hasło na bezpieczne

## Faza 2: Modelowanie Danych Bloga

### Zadanie 2.1: Utworzenie Content Type "Blog Post"
- [ ] Utwórz nowy Content Type o nazwie "BlogPost"
- [ ] Dodaj pola:
  - `title` (Text) - wymagane
  - `slug` (UID z title) - wymagane, unikalne
  - `excerpt` (Text) - krótki opis
  - `content` (Rich Text) - treść posta
  - `featured_image` (Media) - główne zdjęcie
  - `author` (Text) - autor posta
  - `tags` (Text) - tagi oddzielone przecinkami
  - `seo_title` (Text) - tytuł SEO
  - `seo_description` (Text) - opis meta
  - `ai_generated` (Boolean) - czy post został wygenerowany przez AI
  - `published_at` (DateTime) - data publikacji
  - `status` (Enumeration: draft, published, archived)

### Zadanie 2.2: Utworzenie Content Type "Blog Category"
- [ ] Utwórz Content Type "BlogCategory"
- [ ] Dodaj pola:
  - `name` (Text) - nazwa kategorii
  - `slug` (UID z name) - unikalne
  - `description` (Text) - opis kategorii
  - `color` (Text) - kolor kategorii (hex)
- [ ] Dodaj relację Many-to-Many między BlogPost a BlogCategory

### Zadanie 2.3: Konfiguracja uprawnień API
- [ ] Skonfiguruj uprawnienia dla ról Public:
  - BlogPost: find, findOne (tylko published)
  - BlogCategory: find, findOne
- [ ] Skonfiguruj uprawnienia dla ról Authenticated (jeśli potrzebne)
- [ ] Przetestuj API endpoints w Postman/Insomnia

## Faza 3: Integracja z Aplikacją Next.js

### Zadanie 3.1: Konfiguracja klienta API
- [ ] Zainstaluj biblioteki: `npm install axios @types/node`
- [ ] Utwórz plik `src/lib/strapi.ts` z konfiguracją klienta Strapi
- [ ] Dodaj zmienne środowiskowe:
  ```env
  NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
  STRAPI_API_TOKEN=your_api_token
  ```
- [ ] Utwórz funkcje pomocnicze do pobierania danych z API

### Zadanie 3.2: Utworzenie typów TypeScript
- [ ] Utwórz plik `src/types/blog.ts` z definicjami typów:
  - `BlogPost`
  - `BlogCategory`
  - `StrapiResponse`
  - `PaginationMeta`

### Zadanie 3.3: Stworzenie strony listy postów
- [ ] Utwórz `src/app/blog/page.tsx`
- [ ] Implementuj pobieranie listy postów z paginacją
- [ ] Dodaj komponenty:
  - `BlogPostCard` - karta pojedynczego posta
  - `BlogPagination` - nawigacja między stronami
  - `BlogFilter` - filtrowanie po kategoriach
- [ ] Zaimplementuj SEO meta tags

### Zadanie 3.4: Stworzenie strony pojedynczego posta
- [ ] Utwórz `src/app/blog/[slug]/page.tsx`
- [ ] Implementuj pobieranie posta po slug
- [ ] Dodaj komponenty:
  - `BlogPostHeader` - nagłówek z tytułem, autorem, datą
  - `BlogPostContent` - renderowanie rich text
  - `BlogPostNavigation` - poprzedni/następny post
  - `RelatedPosts` - podobne posty
- [ ] Zaimplementuj structured data (JSON-LD)

### Zadanie 3.5: Optymalizacja wydajności
- [ ] Zaimplementuj ISR (Incremental Static Regeneration)
- [ ] Skonfiguruj cache dla API calls
- [ ] Dodaj lazy loading dla obrazów
- [ ] Zoptymalizuj SEO i Core Web Vitals

## Faza 4: Automatyzacja AI

### Zadanie 4.1: Konfiguracja OpenAI API
- [ ] Załóż konto w OpenAI
- [ ] Uzyskaj API key
- [ ] Dodaj zmienną środowiskową: `OPENAI_API_KEY=your_api_key`
- [ ] Zainstaluj bibliotekę: `npm install openai`

### Zadanie 4.2: Utworzenie skryptu generowania treści
- [ ] Utwórz `scripts/generate-blog-post.ts`
- [ ] Zaimplementuj funkcje:
  - `generateBlogTopic()` - generowanie tematu posta
  - `generateBlogContent()` - generowanie treści
  - `generateSEOContent()` - generowanie meta tagów
  - `generateSlug()` - tworzenie slug z tytułu
- [ ] Dodaj prompt engineering dla kontekstu nieruchomości/finansów

### Zadanie 4.3: Integracja ze Strapi API
- [ ] Utwórz funkcję `createBlogPost()` wysyłającą dane do Strapi
- [ ] Implementuj obsługę błędów i retry logic
- [ ] Dodaj walidację wygenerowanej treści
- [ ] Zaimplementuj automatyczne tagowanie

### Zadanie 4.4: Automatyzacja procesu
- [ ] Utwórz skrypt `scripts/auto-publish.ts`
- [ ] Skonfiguruj cron job lub GitHub Actions dla regularnego generowania
- [ ] Dodaj webhook w Strapi do odświeżania cache Next.js
- [ ] Zaimplementuj monitoring i alerty

## Faza 5: Zaawansowane Funkcje

### Zadanie 5.1: System moderacji AI
- [ ] Dodaj pole `moderation_status` do BlogPost
- [ ] Zaimplementuj automatyczną moderację treści
- [ ] Dodaj możliwość ręcznej weryfikacji przed publikacją
- [ ] Utwórz panel do zarządzania postami AI

### Zadanie 5.2: Personalizacja treści
- [ ] Zaimplementuj różne typy postów (poradniki, newsy, analizy)
- [ ] Dodaj system tagów oparty na tematyce kalkulatorów
- [ ] Utwórz szablony promptów dla różnych kategorii
- [ ] Dodaj generowanie obrazów przez AI (DALL-E, Midjourney)

### Zadanie 5.3: SEO i Analytics
- [ ] Zintegruj Google Analytics 4
- [ ] Dodaj Google Search Console
- [ ] Zaimplementuj sitemap XML dla bloga
- [ ] Skonfiguruj automatyczne pingowanie wyszukiwarek

### Zadanie 5.4: Cache i wydajność
- [ ] Skonfiguruj Redis cache dla Strapi
- [ ] Zaimplementuj CDN dla obrazów
- [ ] Dodaj kompresję i optymalizację obrazów
- [ ] Skonfiguruj HTTP/2 push dla krytycznych zasobów

## Faza 6: Deployment i Monitoring

### Zadanie 6.1: Deployment Strapi
- [ ] Wybierz hosting (Railway, DigitalOcean, AWS)
- [ ] Skonfiguruj bazę danych produkcyjną
- [ ] Ustaw zmienne środowiskowe produkcyjne
- [ ] Skonfiguruj backups bazy danych

### Zadanie 6.2: Aktualizacja Next.js app
- [ ] Zaktualizuj URL Strapi w zmiennych środowiskowych
- [ ] Przetestuj integrację na środowisku staging
- [ ] Wdróż na Vercel z nowymi zmiennymi
- [ ] Skonfiguruj domeny i SSL

### Zadanie 6.3: Monitoring i utrzymanie
- [ ] Dodaj monitoring uptime dla Strapi
- [ ] Skonfiguruj logi błędów
- [ ] Utwórz alerty dla problemów z API
- [ ] Zaimplementuj backup automatyczny

## Zadania Dodatkowe (Opcjonalne)

### Newsletter Integration
- [ ] Dodaj Content Type dla newslettera
- [ ] Zintegruj z dostawcą email (Mailchimp, ConvertKit)
- [ ] Automatyczne wysyłanie nowych postów do subskrybentów

### Komentarze
- [ ] Dodaj system komentarzy (własny lub zewnętrzny jak Disqus)
- [ ] Moderacja komentarzy przez AI
- [ ] Notyfikacje o nowych komentarzach

### Multi-język
- [ ] Skonfiguruj i18n w Strapi
- [ ] Dodaj tłumaczenia AI dla postów
- [ ] Zaimplementuj przełączanie języków w Next.js

## Harmonogram

**Tydzień 1-2:** Fazy 1-2 (Setup Strapi, modelowanie danych)
**Tydzień 3-4:** Faza 3 (Integracja z Next.js)
**Tydzień 5-6:** Faza 4 (Automatyzacja AI)
**Tydzień 7-8:** Fazy 5-6 (Zaawansowane funkcje, deployment)

## Notatki Techniczne

### Kluczowe biblioteki
- `@strapi/strapi` - główny framework
- `openai` - integracja z ChatGPT
- `axios` - HTTP client
- `gray-matter` - parsowanie frontmatter (jeśli potrzebne)
- `markdown-it` - renderowanie markdown

### Bezpieczeństwo
- Zawsze używaj API tokenów dla komunikacji ze Strapi
- Ogranicz uprawnienia API do minimum
- Implementuj rate limiting dla AI generation
- Szyfruj wrażliwe dane w zmiennych środowiskowych

### Koszty AI
- Monitoruj użycie OpenAI API
- Ustaw limity miesięczne
- Rozważ cache dla często generowanych treści
- Optymalizuj prompty dla lepszej efektywności 