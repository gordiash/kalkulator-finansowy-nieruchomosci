import { Suspense } from 'react'
import { Metadata } from 'next'
import ValuationCalculator from '../../components/ValuationCalculator'
import { generateDynamicMetadata } from '@/lib/seo/dynamicMeta'

export const revalidate = 0

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  // Pobierz parametry z URL dla dynamicznego meta title
  const params = await searchParams
  const city = typeof params.miasto === 'string' ? params.miasto : 'Olsztyn'
  const area = typeof params.metraz === 'string' ? params.metraz : ''
  const rooms = typeof params.pokoje === 'string' ? params.pokoje : ''
  const year = typeof params.rok === 'string' ? params.rok : ''

  return generateDynamicMetadata({
    city,
    area,
    rooms,
    year,
    type: 'valuation'
  })
}

export default async function ValuationPage({ searchParams }: PageProps) {
  // Przekaż parametry URL do komponentu dla pre-wypełnienia
  const params = await searchParams
  const initialData = {
    city: typeof params.miasto === 'string' ? params.miasto : 'Olsztyn',
    area: typeof params.metraz === 'string' ? params.metraz : '',
    rooms: typeof params.pokoje === 'string' ? params.pokoje : '',
    year: typeof params.rok === 'string' ? params.rok : '',
    district: typeof params.dzielnica === 'string' ? params.dzielnica : '',
  }

  return (
    <section className="container mx-auto px-4 py-10 max-w-3xl">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">
          Kalkulator Wyceny Mieszkania
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Oszacuj wartość rynkową mieszkania za pomocą sztucznej inteligencji. 
          Model Random Forest wytrenowany na {' '}
          <span className="font-semibold text-blue-600">566 ofertach z regionu Olsztyn</span>.
        </p>
      </header>
      
      <Suspense fallback={
        <div className="text-center py-10">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie formularza wyceny...</p>
        </div>
      }>
        <ValuationCalculator initialData={initialData} />
      </Suspense>
      
      {/* SEO Content */}
      <aside className="mt-12 prose prose-gray max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Jak działa kalkulator wyceny mieszkania?
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">🤖 Sztuczna inteligencja</h3>
            <p>
              Używamy modelu Random Forest wytrenowanego na rzeczywistych ofertach 
              z rynku nieruchomości w regionie Olsztyn. Dokładność modelu wynosi MAPE 15.56%.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">📊 Analiza parametrów</h3>
            <p>
              Model uwzględnia 35 cech nieruchomości: lokalizację, metraż, liczbę pokoi, 
              piętro, rok budowy i wiele innych czynników wpływających na cenę.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">⚡ Natychmiastowe wyniki</h3>
            <p>
              Otrzymasz szacowaną wartość mieszkania w kilka sekund wraz z przedziałem 
              ufności i możliwością sprawdzenia zdolności kredytowej.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">🔗 Integracja z kalkulatorami</h3>
            <p>
              Po wycenie możesz od razu sprawdzić ratę kredytu, rentowność wynajmu 
              czy koszty zakupu nieruchomości.
            </p>
          </div>
        </div>
      </aside>
    </section>
  )
} 