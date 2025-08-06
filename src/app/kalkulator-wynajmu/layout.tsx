import type { Metadata } from 'next'
import { defaultMeta } from '@/lib/seo/defaultMeta'

export const generateMetadata = (): Metadata => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  return {
    ...defaultMeta,
    title: 'Kalkulator Rentowności Wynajmu - ROI, Przepływy Pieniężne | Analityka Nieruchomości',
    description:
      'Sprawdź rentowność wynajmu mieszkania. Oblicz ROI, przepływy pieniężne, okres zwrotu inwestycji i analizę opłacalności wynajmu. Kalkulator inwestycji nieruchomości.',
    keywords: [
      'kalkulator wynajmu',
      'rentowność wynajmu',
      'ROI nieruchomości',
      'przepływy pieniężne',
      'okres zwrotu inwestycji',
      'opłacalność wynajmu',
      'dochód z wynajmu',
      'koszty wynajmu',
      'kalkulator inwestycji',
      'kredyt na nieruchomość inwestycyjną',
      'kredyt hipoteczny dla firm',
      'refinansowanie kredytu hipotecznego',
      'przedterminowa spłata kredytu kalkulator',
      'kredyt gotówkowy czy hipoteczny',
      'kredyt hipoteczny w CHF kalkulator',
      'banki kredyt hipoteczny porównanie',
      'kredyt hipoteczny PKO kalkulator',
      'mBank kredyt hipoteczny warunki',
      'ING kredyt mieszkaniowy oprocentowanie',
      'Santander kredyt hipoteczny opinie',
      'porównanie ofert kredytowych',
      'kredyt mieszkaniowy warunki'
    ],
    alternates: {
      canonical: `${baseUrl}/kalkulator-wynajmu`,
    },
    openGraph: {
      ...defaultMeta.openGraph,
      title: 'Kalkulator Rentowności Wynajmu - ROI, Przepływy Pieniężne',
      description:
        'Sprawdź rentowność wynajmu mieszkania. Oblicz ROI, przepływy pieniężne, okres zwrotu inwestycji. Kalkulator inwestycji nieruchomości.',
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