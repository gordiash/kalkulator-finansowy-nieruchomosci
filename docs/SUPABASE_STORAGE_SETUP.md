# Konfiguracja Supabase Storage dla obrazków wpisów

## Wymagania

Aby funkcja uploadu obrazków działała poprawnie, należy skonfigurować bucket `posts-images` w Supabase Storage.

## Instrukcje konfiguracji

### 1. Przejdź do panelu Supabase
- Otwórz [supabase.com](https://supabase.com)
- Zaloguj się do swojego konta
- Wybierz projekt

### 2. Utwórz bucket Storage
- Przejdź do sekcji **Storage** w menu bocznym
- Kliknij **Create a new bucket**
- Wprowadź nazwę: `posts-images`
- Zaznacz opcję **Public bucket** (aby obrazy były dostępne publicznie)
- Kliknij **Create bucket**

### 3. Skonfiguruj uprawnienia (opcjonalnie)
- W sekcji **Storage** → **Policies**
- Dla bucketa `posts-images` możesz dodać polityki RLS:

**Opcja A: Polityka dla zalogowanych użytkowników (authenticated)**
- **INSERT**: `true` (dla zalogowanych użytkowników)
- **SELECT**: `true` (dla wszystkich - publiczne)
- **UPDATE**: `true` (dla zalogowanych użytkowników)
- **DELETE**: `true** (dla zalogowanych użytkowników)

**Opcja B: Polityka dla anonimowych użytkowników (anon)**
- **INSERT**: `true` (dla wszystkich)
- **SELECT**: `true` (dla wszystkich - publiczne)
- **UPDATE**: `true` (dla wszystkich)
- **DELETE**: `true** (dla wszystkich)

**WAŻNE:** Jeśli polityki są skonfigurowane dla folderu `private`, pliki będą uploadowane do ścieżki `private/filename.ext`

### 4. Sprawdź konfigurację
- Bucket powinien być widoczny w liście bucketów
- Status powinien być **Public**

## Funkcjonalności

Po skonfigurowaniu bucketa, funkcja uploadu obrazków będzie oferować:

- ✅ **Drag & Drop** - przeciągnij obrazek do obszaru uploadu
- ✅ **Kliknięcie** - kliknij aby wybrać plik
- ✅ **Podgląd** - natychmiastowy podgląd wybranego obrazka
- ✅ **Walidacja** - sprawdza typ pliku (JPG, PNG, GIF, WebP)
- ✅ **Limit rozmiaru** - maksymalnie 5MB
- ✅ **Unikalne nazwy** - automatyczne generowanie unikalnych nazw plików
- ✅ **Publiczne URL** - automatyczne generowanie publicznych linków
- ✅ **Usuwanie** - możliwość usunięcia obrazka
- ✅ **Progress bar** - pasek postępu podczas uploadu

## Struktura plików

Obrazki będą zapisywane w buckecie `posts-images` z nazwami w formacie:
```
{timestamp}-{random_string}.{extension}
```

Przykład: `1703123456789-abc123def456.webp`

## Integracja z wpisami

Po uploadu obrazka, URL zostanie automatycznie zapisany w polu `image_display` wpisu i będzie wyświetlany:

1. **W edytorze** - jako podgląd w sekcji "Obrazek główny"
2. **W podglądzie wpisu** - jako główny obrazek artykułu
3. **Na stronie bloga** - jako obrazek wpisu

## Rozwiązywanie problemów

### Problem: "Brak uprawnień do uploadu"
Jeśli otrzymujesz błąd uprawnień, sprawdź polityki RLS:

1. **Przejdź do panelu Supabase** → **Storage** → **Policies**
2. **Znajdź bucket `posts-images`**
3. **Sprawdź polityki INSERT:**
   - Jeśli polityka wymaga `auth.role() = 'authenticated'` - zmień na `true`
   - Lub dodaj politykę dla roli `anon` z warunkiem `true`

**Przykład polityki dla anonimowych użytkowników:**
```sql
-- Polityka INSERT dla roli 'anon'
((bucket_id = 'posts-images'::text) AND ((storage.foldername(name))[1] = 'private'::text) AND (true))
```

**Przykład polityki dla wszystkich użytkowników:**
```sql
-- Polityka INSERT dla wszystkich
((bucket_id = 'posts-images'::text) AND ((storage.foldername(name))[1] = 'private'::text))
```

### Problem: "new row violates row-level security policy for table posts"
Jeśli otrzymujesz błąd przy zapisie wpisu do bazy danych:

1. **Przejdź do panelu Supabase** → **Database** → **Tables** → **posts**
2. **Kliknij na zakładkę "Policies"**
3. **Dodaj politykę INSERT:**
   - **Policy name:** "Enable INSERT for all users"
   - **Target roles:** `anon` (lub `authenticated` jeśli wymagane)
   - **USING expression:** `true`
   - **WITH CHECK expression:** `true`

**Przykład polityki INSERT dla tabeli posts:**
```sql
-- Polityka INSERT dla roli 'anon'
(true)
```

**Przykład polityki SELECT dla tabeli posts:**
```sql
-- Polityka SELECT dla wszystkich
(true)
```

### Błąd: "Bucket posts-images nie istnieje"
- Sprawdź czy bucket został utworzony w panelu Supabase
- Upewnij się, że nazwa to dokładnie `posts-images`

### Błąd: "Permission denied"
- Sprawdź polityki RLS dla bucketa
- Upewnij się, że bucket jest publiczny
- Sprawdź czy polityki pozwalają na upload dla roli `anon`

### Błąd: "File too large"
- Sprawdź rozmiar pliku (max 5MB)
- Skompresuj obrazek jeśli jest za duży

### Błąd: "Invalid file type"
- Użyj tylko formatów: JPG, PNG, GIF, WebP
- Sprawdź rozszerzenie pliku 