# Naprawa polityki RLS dla tabeli posts

## Problem
Błąd: `new row violates row-level security policy for table "posts"`

## Przyczyna
Tabela `posts` w Supabase ma włączoną politykę Row Level Security (RLS), ale nie ma skonfigurowanych polityk INSERT, które pozwalałyby na dodawanie nowych wpisów.

## Rozwiązanie

### 1. Przejdź do panelu Supabase
- Otwórz [supabase.com](https://supabase.com)
- Zaloguj się do swojego konta
- Wybierz projekt

### 2. Przejdź do bazy danych
- Kliknij **Database** w menu bocznym
- Wybierz **Tables**
- Znajdź tabelę **posts**
- Kliknij na tabelę **posts**

### 3. Sprawdź polityki RLS
- Kliknij na zakładkę **Policies**
- Sprawdź czy istnieją polityki INSERT

### 4. Dodaj politykę INSERT
Jeśli nie ma polityki INSERT, dodaj ją:

#### Opcja A: Polityka dla wszystkich użytkowników (anon)
```sql
-- Polityka INSERT dla roli 'anon'
CREATE POLICY "Enable INSERT for anon" ON posts
FOR INSERT TO anon
WITH CHECK (true);
```

#### Opcja B: Polityka dla zalogowanych użytkowników (authenticated)
```sql
-- Polityka INSERT dla roli 'authenticated'
CREATE POLICY "Enable INSERT for authenticated" ON posts
FOR INSERT TO authenticated
WITH CHECK (true);
```

#### Opcja C: Polityka dla wszystkich ról
```sql
-- Polityka INSERT dla wszystkich ról
CREATE POLICY "Enable INSERT for all" ON posts
FOR INSERT
WITH CHECK (true);
```

### 5. Dodaj politykę SELECT (opcjonalnie)
Jeśli chcesz, aby wpisy były widoczne publicznie:

```sql
-- Polityka SELECT dla wszystkich
CREATE POLICY "Enable SELECT for all" ON posts
FOR SELECT
USING (true);
```

### 6. Sprawdź czy RLS jest włączone
- W zakładce **Settings** tabeli posts
- Upewnij się, że **Row Level Security** jest włączone
- Jeśli nie, włącz je

### 7. Testowanie
Po dodaniu polityk, spróbuj ponownie zapisać wpis w panelu administracyjnym.

## Alternatywne rozwiązanie - wyłączenie RLS
Jeśli nie potrzebujesz RLS dla tabeli posts, możesz je wyłączyć:

1. Przejdź do **Database** → **Tables** → **posts**
2. Kliknij **Settings**
3. Wyłącz **Row Level Security**
4. Kliknij **Save**

## Uwaga
Wyłączenie RLS oznacza, że wszystkie operacje na tabeli będą dozwolone bez ograniczeń. Używaj tego rozwiązania tylko jeśli nie potrzebujesz kontroli dostępu do tabeli posts. 