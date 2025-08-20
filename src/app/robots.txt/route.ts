export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  const isProd = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'

  let content = `User-agent: *
Allow: /

# Główne strony
Allow: /blog/
Allow: /kalkulator-wyceny/
Allow: /kalkulator-flipera/
Allow: /kalkulator-wynajmu/
Allow: /kalkulator-zakupu-nieruchomosci/
Allow: /kalkulator-zdolnosci-kredytowej/
Allow: /o-nas/
Allow: /kontakt/
Allow: /polityka-prywatnosci/
Allow: /regulamin/
Allow: /analiza-rynku/
Allow: /dane-eurostat/

# Zasoby statyczne
Allow: /sitemap.xml
Allow: /favicon.ico
Allow: /manifest.webmanifest
Allow: /icon-192.png
Allow: /icon-512.png
Allow: /apple-touch-icon.png

# Blokuj strony administracyjne i API
Disallow: /admin/
Disallow: /api/
Disallow: /login/
Disallow: /logowanie/
Disallow: /rejestracja/
Disallow: /panel/

# Blokuj stare URL-e które są przekierowywane
Disallow: /kalkulator-wartosci-najmu/
Disallow: /kalkulator-roi/
Disallow: /kalkulator-inwestycji/

# Blokuj pliki techniczne
Disallow: /_next/

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml`

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