# Instrukcja debugowania Google Analytics

## Problem
Google Analytics nie zbiera ruchu na stronie.

## Rozwiązania zastosowane

### 1. Dodano debugowanie do konsoli
- Wszystkie operacje GA są teraz logowane do konsoli przeglądarki
- Można śledzić proces inicjalizacji i wykrywać błędy

### 2. Naprawiono inicjalizację GA
- GA jest inicjalizowane tylko po zaakceptowaniu zgody na cookies
- Dodano reinicjalizację po zmianie ustawień cookies
- Poprawiono obsługę błędów

### 3. Dodano narzędzia debugowania
- Utworzono `src/lib/gaDebug.ts` z funkcjami pomocniczymi
- Dostępne globalnie jako `window.gaDebug` w trybie development

## Jak przetestować

### Krok 1: Otwórz konsolę przeglądarki
1. Otwórz stronę w przeglądarce
2. Naciśnij F12 lub Ctrl+Shift+I
3. Przejdź do zakładki "Console"

### Krok 2: Sprawdź status GA
W konsoli wykonaj:
```javascript
gaDebug.checkGAStatus()
```

Powinieneś zobaczyć:
```javascript
{
  hasDataLayer: true/false,
  hasGtag: true/false, 
  hasConsent: true/false,
  hasGAScript: true/false,  // ← NOWE: czy skrypt GA jest załadowany
  dataLayerLength: number,
  measurementId: "G-9ZQNTH7W8J",
  gaScriptSrc: "https://www.googletagmanager.com/gtag/js?id=G-9ZQNTH7W8J" // ← NOWE: URL skryptu
}
```

### Krok 2.5: Sprawdź błędy CSP
```javascript
gaDebug.checkCSPViolations()
```

### Krok 3: Sprawdź zgodę na cookies
```javascript
gaDebug.checkConsent()
```

### Krok 4: Zaakceptuj cookies
1. Kliknij "Zaakceptuj wszystkie" w bannerze cookies
2. Sprawdź w konsoli czy pojawiły się logi:
   - "GA: Initializing after consent acceptance"
   - "GA: Successfully initialized after consent"

### Krok 5: Wyślij test event
```javascript
gaDebug.sendTestEvent('test_page_view')
```

### Krok 6: Sprawdź w Google Analytics
1. Otwórz Google Analytics (https://analytics.google.com)
2. Przejdź do "Reports" > "Realtime"
3. Sprawdź czy widzisz aktywność

## Możliwe przyczyny problemów

### 1. Brak zgody na cookies
- GA nie będzie działać bez zgody na analytics
- Sprawdź `gaDebug.checkConsent()`

### 2. Blokowanie przez adblocker
- Sprawdź czy masz wyłączony adblocker
- Sprawdź czy skrypt GA się załadował w Network tab

### 3. Błędne ID pomiaru
- Sprawdź czy `NEXT_PUBLIC_GA_MEASUREMENT_ID` jest ustawione
- Domyślnie używa `G-9ZQNTH7W8J`

### 4. Problemy z CSP (Content Security Policy)
- **NAPRAWIONE**: Dodano `https://*.google-analytics.com` i `https://www.googletagmanager.com` do `connect-src` w `next.config.js`
- Sprawdź czy middleware.ts pozwala na ładowanie skryptów GA
- Sprawdź Network tab czy są błędy 403/404
- **WAŻNE**: Google Analytics używa różnych regionów (np. `region1.google-analytics.com`), więc potrzebujemy `*.google-analytics.com`

### 5. Skrypt GA nie jest ładowany
- Sprawdź `gaDebug.checkGAStatus()` - pole `hasGAScript`
- Jeśli `hasGAScript: false`, skrypt nie został załadowany
- Sprawdź logi w konsoli: "GA: Appending script to head"

## Debugowanie zaawansowane

### Sprawdź Network tab
1. Otwórz Developer Tools
2. Przejdź do zakładki "Network"
3. Odśwież stronę
4. Szukaj żądań do:
   - `googletagmanager.com`
   - `google-analytics.com`
   - `analytics.google.com`

### Sprawdź dataLayer
```javascript
console.log(window.dataLayer)
```

### Wymuś inicjalizację GA
```javascript
gaDebug.forceInit()
```

## Logi do sprawdzenia

W konsoli powinieneś zobaczyć:
- `GA Consent check: { raw: "...", parsed: {...}, analytics: true/false, ok: true/false }`
- `GA: Analytics consent not given, skipping initialization` (jeśli brak zgody)
- `GA: Initializing with measurement ID: G-9ZQNTH7W8J`
- `GA: Successfully initialized`

## Kontakt
Jeśli problem nadal występuje, sprawdź:
1. Czy wszystkie logi są widoczne w konsoli
2. Czy w Network tab są żądania do Google Analytics
3. Czy w Google Analytics Realtime widzisz aktywność
