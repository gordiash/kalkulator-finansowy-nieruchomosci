import type { Metadata } from 'next'
import { defaultMeta } from '@/lib/seo/defaultMeta'

export const generateMetadata = (): Metadata => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  return {
    ...defaultMeta,
    title: 'Kalkulator Wyceny Mieszkania - AI EstymatorAI MAPE 0.79% | Analityka Nieruchomości',
    description: 'Oszacuj wartość rynkową mieszkania za pomocą sztucznej inteligencji EstymatorAI. Model ensemble MAPE 0.79%, wytrenowany na 7000+ ofertach. Sprawdź też zdolność kredytową i rentowność wynajmu.',
    keywords: [
      'kalkulator wyceny mieszkania',
      'wycena nieruchomości',
      'wycena nieruchomości online',
      'sztuczna inteligencja',
      'EstymatorAI',
      'cena mieszkania',
      'wartość rynkowa',
      'Olsztyn',
      'zdolność kredytowa',
      'rentowność wynajmu',
      'model ensemble',
      'MAPE 0.79%',
      'kalkulator kredytu hipotecznego',
      'kredyt hipoteczny kalkulator',
      'zdolność kredytowa kalkulator',
      'oblicz zdolność kredytową',
      'symulacja kredytu hipotecznego',
      'kalkulator kredytu mieszkaniowego',
      'rata kredytu hipotecznego',
      'kalkulator RRSO',
      'kredyt na mieszkanie kalkulator',
      'oprocentowanie kredytu hipotecznego',
      'koszt kredytu hipotecznego',
      'porównanie ofert kredytowych',
      'kredyt hipoteczny rata',
      'wkład własny kalkulator',
      'kalkulator prowizji bankowej',
      'kredyt mieszkaniowy warunki',
      'najlepszy kredyt hipoteczny',
      'kredyt dla młodych kalkulator',
      'ile kosztuje kredyt na mieszkanie',
      'jaki kredyt hipoteczny wybrać',
      'kredyt hipoteczny bez wkładu własnego',
      'kredyt mieszkaniowy dla singla',
      'refinansowanie kredytu hipotecznego',
      'przedterminowa spłata kredytu kalkulator',
      'kredyt hipoteczny w CHF kalkulator',
      'kredyt gotówkowy czy hipoteczny',
      'kredyt na dom z działką',
      'ubezpieczenie kredytu hipotecznego koszt',
      'banki kredyt hipoteczny porównanie',
      'kredyt hipoteczny PKO kalkulator',
      'mBank kredyt hipoteczny warunki',
      'ING kredyt mieszkaniowy oprocentowanie',
      'Santander kredyt hipoteczny opinie',
      'kredyt hipoteczny dla firm',
      'kredyt na nieruchomość inwestycyjną',
      'kredyt mieszkaniowy dla bezrobotnych',
      'kredyt hipoteczny senior',
      'kredyt mieszkaniowy rodzina 3+',
      'nieruchomości kalkulator kosztów',
      'podatek od nieruchomości kalkulator',
      'koszt notariusza przy kredycie',
      'ubezpieczenie nieruchomości kalkulator',
      'opłaty dodatkowe kredyt hipoteczny',
      'marża kredytu hipotecznego',
      'WIBOR aktualne stawki',
      'rejestr zabezpieczeń koszt',
      'kredyt hipoteczny dokumenty wymagane'
    ],
    alternates: {
      canonical: `${baseUrl}/kalkulator-wyceny`,
    },
    openGraph: {
      ...defaultMeta.openGraph,
      title: 'Kalkulator Wyceny Mieszkania - AI EstymatorAI MAPE 0.79%',
      description: 'Oszacuj wartość rynkową mieszkania za pomocą EstymatorAI. Model ensemble MAPE 0.79%, wytrenowany na 7000+ ofertach z całej Polski.',
      url: `${baseUrl}/kalkulator-wyceny`,
      type: 'website',
      images: [
        {
          url: `${baseUrl}/images/kalkulator-wyceny-og.jpg`,
          width: 1200,
          height: 630,
          alt: 'Kalkulator Wyceny Mieszkania - AI EstymatorAI'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Kalkulator Wyceny Mieszkania - AI EstymatorAI',
      description: 'Oszacuj wartość mieszkania za pomocą EstymatorAI. Model ensemble MAPE 0.79%.',
      images: [`${baseUrl}/images/kalkulator-wyceny-twitter.jpg`]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
    },
    other: {
      'application-name': 'Analityka Nieruchomości',
      'msapplication-TileColor': '#2563EB',
      'theme-color': '#2563EB',
    }
  }
}

export const revalidate = 3600

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  
  return (
    <>
      {children}
      
      {/* Schema.org: SoftwareApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Kalkulator Wyceny Mieszkania',
            applicationCategory: 'FinanceApplication',
            applicationSubCategory: 'RealEstateApplication',
            operatingSystem: 'Web',
            description: 'Profesjonalny kalkulator do wyceny mieszkań wykorzystujący EstymatorAI. Model ensemble wytrenowany na rzeczywistych danych rynkowych.',
            url: `${baseUrl}/kalkulator-wyceny`,
            author: {
              '@type': 'Organization',
              name: 'Analityka Nieruchomości',
              url: baseUrl
            },
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'PLN',
              availability: 'https://schema.org/InStock'
            },
            featureList: [
              'Wycena oparta o EstymatorAI',
              'Model ensemble (LightGBM+RF+CatBoost)',
              'MAPE 0.79%',
              '7000+ próbek treningowych',
              'Integracja z kalkulatorami',
              'Responsywny interfejs'
            ],
            screenshot: `${baseUrl}/images/kalkulator-wyceny-screenshot.jpg`,
            softwareVersion: '1.0',
            datePublished: '2024-01-01',
            dateModified: new Date().toISOString().split('T')[0]
          }),
        }}
      />
      
      {/* Schema.org: FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Jak dokładny jest kalkulator wyceny mieszkania?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Nasz kalkulator wykorzystuje EstymatorAI z dokładnością MAPE 0.79%, wytrenowany na 7000+ rzeczywistych ofertach z całej Polski. To oznacza średni błąd około 0.79%.'
                }
              },
              {
                '@type': 'Question',
                name: 'Jakie parametry wpływają na wycenę mieszkania?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'EstymatorAI uwzględnia 35+ cech: lokalizację (miasto, dzielnica), metraż, liczbę pokoi, piętro, rok budowy i wiele innych parametrów wpływających na cenę nieruchomości.'
                }
              },
              {
                '@type': 'Question',
                name: 'Czy mogę sprawdzić zdolność kredytową po wycenie?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Tak! Po otrzymaniu wyceny możesz od razu przejść do kalkulatora zdolności kredytowej, wynajmu lub kosztów zakupu - parametry zostaną automatycznie przeniesione.'
                }
              },
              {
                '@type': 'Question',
                name: 'Dla jakich miast działa kalkulator?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Model został wytrenowany głównie na danych z regionu Olsztyn, ale może być używany dla innych miast w Polsce. Dokładność może być niższa dla lokalizacji znacznie różniących się od danych treningowych.'
                }
              }
            ]
          }),
        }}
      />
      
      {/* Schema.org: Breadcrumbs */}
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
                name: 'Strona główna',
                item: baseUrl
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Kalkulatory',
                item: `${baseUrl}/#kalkulatory`
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Kalkulator Wyceny Mieszkania',
                item: `${baseUrl}/kalkulator-wyceny`
              }
            ]
          }),
        }}
      />
      
      {/* Schema.org: Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Analityka Nieruchomości',
            url: baseUrl,
            logo: `${baseUrl}/images/logo.png`,
            description: 'Profesjonalne narzędzia do analizy rynku nieruchomości, kalkulatory inwestycyjne i blog ekspercki.',
            sameAs: [
              'https://facebook.com/analityka-nieruchomosci',
              'https://linkedin.com/company/analityka-nieruchomosci',
              'https://twitter.com/analityka_nier'
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer service',
              email: 'kontakt@analityka-nieruchomosci.pl',
              availableLanguage: 'Polish'
            }
          }),
        }}
      />
    </>
  )
} 