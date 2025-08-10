import { Metadata } from 'next'
import FliperCalculator from '../../components/FliperCalculator'

export const metadata: Metadata = {
  title: 'Kalkulator Flipera Nieruchomości - ROI, Zysk Netto, Koszty Remontu | Analityka Nieruchomości',
  description: 'Profesjonalny kalkulator flipera nieruchomości. Oblicz ROI, zysk netto, koszty remontu, podatki i opłacalność flipa. Analiza inwestycji w nieruchomości z kalkulacją wszystkich kosztów: zakup, remont, utrzymanie, finansowanie, sprzedaż. Sprawdź rentowność flipa nieruchomości.',
  keywords: [
    'kalkulator flipera',
    'fliper nieruchomości',
    'ROI nieruchomości',
    'zysk netto flipa',
    'koszty remontu nieruchomości',
    'opłacalność flipa',
    'inwestycje nieruchomości',
    'kalkulacja kosztów flipa',
    'rentowność nieruchomości',
    'analiza inwestycji',
    'podatki od zysku nieruchomości',
    'koszty zakupu nieruchomości',
    'koszty sprzedaży nieruchomości',
    'finansowanie flipa',
    'remont nieruchomości',
    'kalkulator ROI',
    'analiza opłacalności',
    'inwestowanie w nieruchomości',
    'flip nieruchomości',
    'kalkulacja zysku'
  ].join(', '),
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
  openGraph: {
    title: 'Kalkulator Flipera Nieruchomości - ROI, Zysk Netto, Koszty Remontu',
    description: 'Profesjonalny kalkulator flipera nieruchomości. Oblicz ROI, zysk netto, koszty remontu, podatki i opłacalność flipa. Analiza inwestycji w nieruchomości z kalkulacją wszystkich kosztów.',
    url: 'https://analitykanieruchomosci.pl/kalkulator-flipera',
    siteName: 'Analityka Nieruchomości',
    images: [
      {
        url: 'https://analitykanieruchomosci.pl/og-fliper-calculator.jpg',
        width: 1200,
        height: 630,
        alt: 'Kalkulator Flipera Nieruchomości - ROI i Analiza Opłacalności',
      },
    ],
    locale: 'pl_PL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kalkulator Flipera Nieruchomości - ROI, Zysk Netto, Koszty Remontu',
    description: 'Profesjonalny kalkulator flipera nieruchomości. Oblicz ROI, zysk netto, koszty remontu, podatki i opłacalność flipa.',
    images: ['https://analitykanieruchomosci.pl/og-fliper-calculator.jpg'],
  },
  alternates: {
    canonical: 'https://analitykanieruchomosci.pl/kalkulator-flipera',
  },
  other: {
    'application-name': 'Analityka Nieruchomości',
    'msapplication-TileColor': '#2563EB',
    'theme-color': '#2563EB',
  },
}

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold mb-6">Kalkulator Flipera Nieruchomości</h1>
      <p className="text-gray-600 mb-8 max-w-4xl">
        Profesjonalny kalkulator flipera nieruchomości pomoże Ci obliczyć pełny koszt inwestycji, zysk netto i ROI dla flipa nieruchomości. 
        Uwzględniamy wszystkie koszty: zakup, remont, utrzymanie, finansowanie i sprzedaż. 
        Sprawdź opłacalność swojej inwestycji w nieruchomości z dokładną analizą kosztów i zysków.
      </p>
      <FliperCalculator />
    </div>
  )
}


