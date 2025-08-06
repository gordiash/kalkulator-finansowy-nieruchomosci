import type { Metadata } from 'next'
import { defaultMeta } from '@/lib/seo/defaultMeta'

export const generateMetadata = (): Metadata => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  return {
    ...defaultMeta,
    title: 'Kalkulator Rentowności Wynajmu - ROI, Przepływy Pieniężne | Analityka Nieruchomości',
    description:
      'Sprawdź rentowność wynajmu mieszkania. Oblicz ROI, przepływy pieniężne, okres zwrotu inwestycji i analizę opłacalności wynajmu.',
    keywords: [
      'kalkulator wynajmu',
      'rentowność wynajmu',
      'ROI nieruchomości',
      'przepływy pieniężne',
      'okres zwrotu inwestycji',
      'opłacalność wynajmu',
      'dochód z wynajmu',
      'koszty wynajmu'
    ],
    alternates: {
      canonical: `${baseUrl}/kalkulator-wynajmu`,
    },
    openGraph: {
      ...defaultMeta.openGraph,
      title: 'Kalkulator Rentowności Wynajmu - ROI, Przepływy Pieniężne',
      description:
        'Sprawdź rentowność wynajmu mieszkania. Oblicz ROI, przepływy pieniężne, okres zwrotu inwestycji.',
      url: `${baseUrl}/kalkulator-wynajmu`,
    },
  }
}

export const revalidate = 3600

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
            name: 'Kalkulator Opłacalności Wynajmu',
            applicationCategory: 'FinancialApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'PLN',
            },
            url: `${baseUrl}/kalkulator-wynajmu`,
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
                name: 'Kalkulator Opłacalności Wynajmu',
                item: `${baseUrl}/kalkulator-wynajmu`,
              },
            ],
          }),
        }}
      />
    </>
  )
} 