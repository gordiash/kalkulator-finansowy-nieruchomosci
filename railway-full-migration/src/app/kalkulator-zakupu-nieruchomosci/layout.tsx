import type { Metadata } from 'next'
import { defaultMeta } from '@/lib/seo/defaultMeta'

export const revalidate = 3600

export const generateMetadata = (): Metadata => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  return {
    ...defaultMeta,
    title: 'Kalkulator Zakupu Nieruchomości',
    description:
      'Oblicz ratę kredytu, podatek PCC, koszty notarialne i całkowity koszt zakupu nieruchomości.',
    alternates: {
      canonical: `${baseUrl}/kalkulator-zakupu-nieruchomosci`,
    },
    openGraph: {
      ...defaultMeta.openGraph,
      title: 'Kalkulator Zakupu Nieruchomości',
      description:
        'Oblicz ratę kredytu, podatek PCC, koszty notarialne i całkowity koszt zakupu nieruchomości.',
      url: `${baseUrl}/kalkulator-zakupu-nieruchomosci`,
    },
  }
}

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Kalkulator Zakupu Nieruchomości',
            applicationCategory: 'FinancialApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'PLN',
            },
            url: `${baseUrl}/kalkulator-zakupu-nieruchomosci`,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Kalkulatory',
                item: `${baseUrl}/`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Kalkulator Zakupu Nieruchomości',
                item: `${baseUrl}/kalkulator-zakupu-nieruchomosci`,
              },
            ],
          }),
        }}
      />
    </>
  )
} 