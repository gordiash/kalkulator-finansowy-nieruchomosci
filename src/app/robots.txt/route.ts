export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  const isProd = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'

  let content = `User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml

# Główne strony - pozwól na indeksowanie
Allow: /blog
Allow: /kalkulator-wyceny
Allow: /kalkulator-flipera
Allow: /kalkulator-wynajmu
Allow: /kalkulator-zakupu-nieruchomosci
Allow: /kalkulator-zdolnosci-kredytowej
Allow: /o-nas
Allow: /kontakt
Allow: /polityka-prywatnosci
Allow: /regulamin

# Blokuj strony administracyjne i API
Disallow: /admin
Disallow: /api
Disallow: /login
Disallow: /logowanie
Disallow: /rejestracja
Disallow: /panel
Disallow: /panel/

# Blokuj stare URL-e które są przekierowywane
Disallow: /kalkulator-wartosci-najmu
Disallow: /kalkulator-roi
Disallow: /kalkulator-inwestycji

# Blokuj pliki techniczne
Disallow: /_next/
Disallow: /favicon.ico
Disallow: /robots.txt
Disallow: /sitemap.xml

# Specjalne reguły dla różnych crawlerów
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 2

User-agent: DuckDuckBot
Allow: /
Crawl-delay: 1

User-agent: Baiduspider
Allow: /
Crawl-delay: 2

User-agent: YandexBot
Allow: /
Crawl-delay: 2

# Blokuj agresywne crawlers
User-agent: *
Disallow: /admin
Disallow: /api
Disallow: /login
Disallow: /logowanie
Disallow: /rejestracja
Disallow: /panel
Disallow: /panel/
Disallow: /_next/
Disallow: /favicon.ico
Disallow: /robots.txt
Disallow: /sitemap.xml
Disallow: /kalkulator-wartosci-najmu
Disallow: /kalkulator-roi
Disallow: /kalkulator-inwestycji`

  if (!isProd) {
    // W środowiskach innych niż produkcyjne blokujemy całą witrynę
    content = `User-agent: *
Disallow: /
Sitemap: ${baseUrl}/sitemap.xml`
  }

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
} 