import type { Metadata } from 'next'
import { defaultMeta } from '@/lib/seo/defaultMeta'

export const generateMetadata = (): Metadata => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  return {
    ...defaultMeta,
    title: 'Kalkulator Wyceny Mieszkania',
    description: 'Szacuj wartość rynkową mieszkania na podstawie parametrów takich jak lokalizacja, metraż czy rok budowy.',
    alternates: {
      canonical: `${baseUrl}/kalkulator-wyceny`,
    },
    openGraph: {
      ...defaultMeta.openGraph,
      title: 'Kalkulator Wyceny Mieszkania',
      description: 'Szacuj wartość rynkową mieszkania i sprawdź dalsze analizy finansowe jednym kliknięciem.',
      url: `${baseUrl}/kalkulator-wyceny`,
    },
  }
}

export const revalidate = 3600

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  return (
    <>
      {children}
      {/* Schema.org: aplikacja kalkulatora */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Kalkulator Wyceny Mieszkania',
            applicationCategory: 'FinancialApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'PLN',
            },
            url: `${baseUrl}/kalkulator-wyceny`,
          }),
        }}
      />
      {/* Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Kalkulatory', item: `${baseUrl}/` },
              { '@type': 'ListItem', position: 2, name: 'Kalkulator Wyceny Mieszkania', item: `${baseUrl}/kalkulator-wyceny` },
            ],
          }),
        }}
      />
    </>
  )
} 