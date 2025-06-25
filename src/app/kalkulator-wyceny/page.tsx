import { Suspense } from 'react'
import { Metadata } from 'next'
import ValuationCalculator from '../../components/ValuationCalculator'
import { generateDynamicMetadata } from '../../dynamicMeta'

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <span className="text-4xl">🏠</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Kalkulator Wyceny
              <span className="block text-emerald-300">Mieszkania</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed max-w-3xl mx-auto">
              Oszacuj wartość rynkową mieszkania za pomocą <strong className="text-white">EstymatorAI</strong>
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <span className="text-emerald-300 font-semibold">7000+</span> ofert treningowych
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <span className="text-emerald-300 font-semibold">0.79%</span> błąd MAPE
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <span className="text-emerald-300 font-semibold">&lt;3s</span> czas wyceny
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16 max-w-5xl relative z-10 -mt-8">
      
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
            <h3 className="font-semibold text-gray-900 mb-2">🤖 EstymatorAI</h3>
            <p>
              Używamy zaawansowanego modelu ensemble wytrenowanego na rzeczywistych ofertach 
              z rynku nieruchomości w całej Polski. Dokładność modelu wynosi MAPE 0.79%.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">📊 Analiza parametrów</h3>
            <p>
              EstymatorAI uwzględnia 35+ cech nieruchomości: lokalizację, metraż, liczbę pokoi, 
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
      
      {/* Additional Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Dlaczego EstymatorAI?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Najdokładniejszy kalkulator wyceny mieszkań w Polsce, oparty na zaawansowanych algorytmach machine learning
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">EstymatorAI</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Zaawansowany model ensemble wytrenowany na rzeczywistych ofertach 
                z rynku nieruchomości w całej Polsce.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">35+ parametrów</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Uwzględniamy lokalizację, metraż, liczbę pokoi, 
                piętro, rok budowy i wiele innych czynników.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Błyskawiczne wyniki</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Otrzymasz szacowaną wartość mieszkania w mniej niż 3 sekundy 
                wraz z przedziałem ufności.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Pełna analiza</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Po wycenie sprawdź ratę kredytu, rentowność wynajmu 
                i wszystkie koszty zakupu.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 