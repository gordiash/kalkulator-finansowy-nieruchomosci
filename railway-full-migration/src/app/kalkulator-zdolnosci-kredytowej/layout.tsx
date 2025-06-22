import type { Metadata } from 'next'
import { defaultMeta } from '@/lib/seo/defaultMeta'

export const generateMetadata = (): Metadata => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  return {
    ...defaultMeta,
    title: 'Kalkulator Zdolności Kredytowej',
    description:
      'Oblicz swoją maksymalną zdolność kredytową i wysokość raty hipotecznej.',
    alternates: {
      canonical: `${baseUrl}/kalkulator-zdolnosci-kredytowej`,
    },
    openGraph: {
      ...defaultMeta.openGraph,
      title: 'Kalkulator Zdolności Kredytowej',
      description:
        'Oblicz swoją maksymalną zdolność kredytową i wysokość raty hipotecznej.',
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