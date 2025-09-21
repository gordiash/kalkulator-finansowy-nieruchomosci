import { Metadata } from 'next'
import FliperCalculatorWithSave from '@/components/FliperCalculatorWithSave'
import Disclaimer from '@/components/ui/Disclaimer'

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
    <div className="container mx-auto px-4 pt-24 sm:pt-28 pb-8">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">Kalkulator flipera nieruchomości</h1>
        <p className="mt-3 text-sm md:text-base text-slate-600 max-w-4xl">
          Policz pełny koszt inwestycji, zysk netto i ROI dla flipa. Kalkulator uwzględnia koszty: zakup, remont, miesięczne utrzymanie, finansowanie oraz sprzedaż. 
          Wykresy automatycznie prezentują strukturę kosztów i opłacalność, a walidacja na polach pomaga utrzymać poprawność danych.
        </p>
      </header>

      <section className="mb-8">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 text-xl" aria-hidden>🧮</div>
              <div>
                <p className="font-semibold text-slate-900">Jak korzystać</p>
                <ul className="mt-1 text-sm text-slate-600 list-disc pl-4 space-y-0.5">
                  <li>Uzupełnij sekcje: zakup, remont, utrzymanie, finansowanie, sprzedaż.</li>
                  <li>Przy polach z przełącznikiem wybierz jednostkę <span className="font-medium">kwota/%</span>.</li>
                  <li>Błędy walidacji oznaczamy kolorem czerwonym i opisem pod polem.</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-emerald-600 text-xl" aria-hidden>📊</div>
              <div>
                <p className="font-semibold text-slate-900">Wyniki i wykresy</p>
                <ul className="mt-1 text-sm text-slate-600 list-disc pl-4 space-y-0.5">
                  <li>Wykres kołowy pokazuje strukturę kosztów; etykiety ukrywamy poniżej 3%.</li>
                  <li>Wykres słupkowy skaluje się do wartości ujemnych; zysk poniżej zera jest czerwony.</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-indigo-600 text-xl" aria-hidden>💾</div>
              <div>
                <p className="font-semibold text-slate-900">Zapisywanie kalkulacji</p>
                <ul className="mt-1 text-sm text-slate-600 list-disc pl-4 space-y-0.5">
                  <li>Zaloguj się, aby zapisać wynik w zakładce <span className="font-medium">Panel → Kalkulacje</span>.</li>
                  <li>W szczegółach zapisu zobaczysz także wykresy i rozbite koszty.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FliperCalculatorWithSave />

      <Disclaimer className="mt-8" />
    </div>
  )
}


