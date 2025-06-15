# Deployment na Vercel - Instrukcje

## Zmienne środowiskowe

W panelu Vercel (Settings > Environment Variables) dodaj następujące zmienne:

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` - URL twojego projektu Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Publiczny klucz anon z Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key z Supabase (opcjonalny)

### Strapi (jeśli używasz)
- `NEXT_PUBLIC_STRAPI_URL` - URL twojego Strapi
- `STRAPI_API_TOKEN` - Token API z Strapi

## Konfiguracja Supabase

W panelu Supabase (Authentication > URL Configuration) dodaj:

### Site URL
```
https://twoja-domena.vercel.app
```

### Redirect URLs
```
https://twoja-domena.vercel.app/login
https://twoja-domena.vercel.app/admin
```

## Debugowanie

Po deploymencie możesz sprawdzić stan autentykacji przez:
```
https://twoja-domena.vercel.app/api/debug-auth
```

## Logi

Sprawdź logi w Vercel Dashboard > Functions > View Function Logs aby zobaczyć:
- Czy middleware się wykonuje
- Czy użytkownik jest zalogowany
- Czy występują błędy

## Typowe problemy

1. **Middleware nie działa** - sprawdź czy `vercel.json` jest poprawnie skonfigurowany
2. **Przekierowania nie działają** - sprawdź Redirect URLs w Supabase
3. **Cookies nie są zapisywane** - sprawdź czy domena jest poprawnie ustawiona

## Testowanie

1. Wejdź na `/admin` - powinno przekierować do `/login`
2. Zaloguj się - powinno przekierować z powrotem do `/admin`
3. Wyloguj się - powinno przekierować do `/login`
4. Spróbuj wejść na `/admin` po wylogowaniu - powinno znów przekierować do `/login` 