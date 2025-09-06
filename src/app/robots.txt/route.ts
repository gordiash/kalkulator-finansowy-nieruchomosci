export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  const isProd = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'

  let content = `User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml

# Sekcje wyłączone z indeksowania
Disallow: /admin
Disallow: /api
Disallow: /login
Disallow: /logowanie
Disallow: /rejestracja
Disallow: /panel
Disallow: /_next/

# Stare/przekierowane adresy
Disallow: /kalkulator-wartosci-najmu
Disallow: /kalkulator-roi
Disallow: /kalkulator-inwestycji

# Specjalne reguły dla wybranych botów (tylko crawl-delay)
User-agent: Googlebot
Crawl-delay: 1

User-agent: Bingbot
Crawl-delay: 1

User-agent: Slurp
Crawl-delay: 2

User-agent: DuckDuckBot
Crawl-delay: 1

User-agent: Baiduspider
Crawl-delay: 2

User-agent: YandexBot
Crawl-delay: 2`

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