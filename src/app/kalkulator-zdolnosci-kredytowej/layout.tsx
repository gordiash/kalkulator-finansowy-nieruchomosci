import type { Metadata } from 'next'
import { defaultMeta } from '@/lib/seo/defaultMeta'

export const generateMetadata = (): Metadata => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  return {
    ...defaultMeta,
    title: 'Kalkulator Zdolności Kredytowej - Oblicz Kredyt Hipoteczny | Analityka Nieruchomości',
    description:
      'Oblicz maksymalną kwotę kredytu hipotecznego i miesięczną ratę. Profesjonalny kalkulator zdolności kredytowej z analizą dochodów, kosztów i RRSO.',
    keywords: [
      'kalkulator zdolności kredytowej',
      'kalkulator kredytu hipotecznego',
      'zdolność kredytowa kalkulator',
      'oblicz zdolność kredytową',
      'symulacja kredytu hipotecznego',
      'kalkulator kredytu mieszkaniowego',
      'rata kredytu hipotecznego',
      'kalkulator RRSO',
      'kredyt hipoteczny kalkulator',
      'kredyt na mieszkanie kalkulator',
      'oprocentowanie kredytu hipotecznego',
      'koszt kredytu hipotecznego',
      'wkład własny kalkulator',
      'kalkulator prowizji bankowej',
      'kredyt hipoteczny rata',
      'najlepszy kredyt hipoteczny',
      'kredyt dla młodych kalkulator',
      'ile kosztuje kredyt na mieszkanie',
      'jaki kredyt hipoteczny wybrać',
      'ubezpieczenie kredytu hipotecznego koszt',
      'opłaty dodatkowe kredyt hipoteczny',
      'marża kredytu hipotecznego',
      'WIBOR aktualne stawki'
    ],
    alternates: {
      canonical: `${baseUrl}/kalkulator-zdolnosci-kredytowej`,
    },
    openGraph: {
      ...defaultMeta.openGraph,
      title: 'Kalkulator Zdolności Kredytowej - Oblicz Kredyt Hipoteczny',
      description:
        'Oblicz maksymalną kwotę kredytu hipotecznego i miesięczną ratę. Profesjonalny kalkulator zdolności kredytowej z analizą dochodów, kosztów i RRSO.',
      url: `${baseUrl}/kalkulator-zdolnosci-kredytowej`,
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
            name: 'Kalkulator Zdolności Kredytowej',
            applicationCategory: 'FinancialApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'PLN',
            },
            url: `${baseUrl}/kalkulator-zdolnosci-kredytowej`,
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
                name: 'Kalkulator Zdolności Kredytowej',
                item: `${baseUrl}/kalkulator-zdolnosci-kredytowej`,
              },
            ],
          }),
        }}
      />
    </>
  )
} 