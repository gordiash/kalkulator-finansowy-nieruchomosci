import Link from 'next/link';
import { FiHome, FiTrendingUp, FiBarChart2, FiDollarSign, FiCheckCircle, FiUsers, FiAward, FiZap } from 'react-icons/fi';
import { fetchLatestPosts, type BlogPostListing } from '@/lib/supabase/blog';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next'
import { defaultMeta } from '@/lib/seo/defaultMeta'
import Hero from '@/components/ui/Hero';
import FeaturesSection from '@/components/ui/FeaturesSection';
import StatsSection from '@/components/ui/StatsSection';
import CTASection from '@/components/ui/CTASection';
import FAQSection from '@/components/ui/FAQSection';
import IndicatorsGrid from '@/components/market/IndicatorsGrid';

const BlogSlider = dynamic(() => import('@/components/blog/BlogSlider'), {
  loading: () => null,
});

export const generateMetadata = (): Metadata => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  return {
    ...defaultMeta,
    title: 'Kalkulatory Nieruchomości - Wycena AI, Zdolność Kredytowa, Wynajem | KalkulatoryNieruchomosci.pl',
    description:
      'Profesjonalne kalkulatory nieruchomości: wycena mieszkań z AI (MAPE 0.79%), zdolność kredytowa, rentowność wynajmu i koszty zakupu. Blog ekspercki.',
    keywords: [
      'kalkulator wyceny mieszkania',
      'wycena nieruchomości online',
      'sztuczna inteligencja nieruchomości', 
      'EstymatorAI wycena',
      'kalkulator zakupu nieruchomości',
      'kalkulator wynajmu',
      'zdolność kredytowa',
      'analityka nieruchomości',
      'wycena AI',
      'Olsztyn mieszkania',
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
      'rentowność wynajmu',
      'koszty zakupu nieruchomości',
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
      canonical: baseUrl,
    },
    openGraph: {
      ...defaultMeta.openGraph,
      title: 'Kalkulatory Nieruchomości - Wycena AI, Zdolność Kredytowa, Wynajem',
      description:
        'Profesjonalne kalkulatory nieruchomości: wycena mieszkań z AI (MAPE 0.79%), zdolność kredytowa, rentowność wynajmu i koszty zakupu.',
      url: baseUrl,
    },
  }
}

export default async function HomePage() {
  // Pobierz najnowsze posty z bloga
  let latestPosts: BlogPostListing[] = []
  try {
    // Sprawdź czy Supabase jest skonfigurowany
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://dummy.supabase.co') {
      latestPosts = await fetchLatestPosts(6);
    }
  } catch (error) {
    console.warn('HomePage: Nie można pobrać postów z Supabase:', error)
    latestPosts = []
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "KalkulatoryNieruchomosci.pl",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
    "description": "Profesjonalne kalkulatory nieruchomościowe z AI: wycena mieszkań, zakup, wynajem, zdolność kredytowa",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"}/blog?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "mainEntity": [
      {
        "@type": "SoftwareApplication",
        "name": "Kalkulator Wyceny Mieszkania AI",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web Browser",
        "description": "Pierwsza w Polsce wycena mieszkań oparta o sztuczną inteligencję. Model Random Forest z dokładnością 85%.",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"}/kalkulator-wyceny`,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "PLN"
        },
        "featureList": [
          "Wycena oparta o AI (Random Forest)",
          "7000+ ofert w bazie treningowej", 
          "35 cech uwzględnianych w modelu",
          "Średni błąd predykcji 15.56%",
          "Obsługa całej Polski"
        ]
      },
      {
        "@type": "SoftwareApplication", 
        "name": "Kalkulator Zakupu Nieruchomości",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web Browser",
        "description": "Oblicz ratę kredytu, podatek PCC i wszystkie koszty okołozakupowe w jednym miejscu.",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"}/kalkulator-zakupu-nieruchomosci`,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "PLN"
        }
      },
      {
        "@type": "SoftwareApplication",
        "name": "Kalkulator Opłacalności Wynajmu", 
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web Browser",
        "description": "Sprawdź rentowność inwestycji, ROI i czas zwrotu kapitału z wynajmu nieruchomości.",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"}/kalkulator-wynajmu`,
        "offers": {
          "@type": "Offer",
          "price": "0", 
          "priceCurrency": "PLN"
        }
      },
      {
        "@type": "SoftwareApplication",
        "name": "Kalkulator Zdolności Kredytowej",
        "applicationCategory": "FinanceApplication", 
        "operatingSystem": "Web Browser",
        "description": "Oszacuj swoją zdolność kredytową i maksymalną kwotę kredytu hipotecznego.",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"}/kalkulator-zdolnosci-kredytowej`,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "PLN"
        }
      },
      {
        "@type": "SoftwareApplication",
        "name": "Kalkulator Wyceny Mieszkania AI",
        "applicationCategory": "FinanceApplication", 
        "operatingSystem": "Web Browser",
        "description": "Wycena mieszkania oparta o zaawansowany EstymatorAI. Dokładność 0.79% MAPE.",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"}/kalkulator-wyceny`,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "PLN"
        },
        "applicationSubCategory": "Real Estate Valuation",
        "keywords": "wycena mieszkania, EstymatorAI, LightGBM, Random Forest, CatBoost, machine learning, nieruchomości"
      }
    ]
  }

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Hero Section */}
        <Hero />

        {/* Features Section */}
        <FeaturesSection />

        {/* Rynek w liczbach */}
        <IndicatorsGrid />

        {/* Main Dashboard Preview */}
        <section className="relative py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
              {/* Left - Content */}
              <div>
                <div className="inline-flex items-center px-4 py-2 mb-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-full text-slate-300 font-medium text-sm">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Nasze narzędzia
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Jak nasze kalkulatory
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                    upraszczają analizę nieruchomości
                  </span>
                </h2>
                
                <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                  W dzisiejszym dynamicznym rynku nieruchomości podejmowanie świadomych decyzji 
                  inwestycyjnych wymaga precyzyjnych narzędzi. Nasze kalkulatory upraszczają skomplikowane obliczenia.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="text-green-400" size={20} />
                    <span className="text-slate-300">Wycena AI z dokładnością 0.79% MAPE</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="text-green-400" size={20} />
                    <span className="text-slate-300">Analiza rentowności w czasie rzeczywistym</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="text-green-400" size={20} />
                    <span className="text-slate-300">Intuicyjne kalkulatory kredytowe</span>
                  </div>
                </div>
              </div>
              
              {/* Right - Dashboard Preview */}
              <div className="relative">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Witaj ponownie, Jan!</h3>
                    <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                  </div>
                  
                  {/* Portfolio Value */}
                  <div className="bg-slate-700/50 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">Wartość portfela</span>
                      <span className="text-green-400 text-sm">+8.5%</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">2 450 000 zł</div>
                    <div className="text-green-400 text-sm">+192 000 zł w tym roku</div>
                  </div>
                  
                  {/* Monthly Rental Income */}
                  <div className="bg-slate-700/50 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-slate-400 text-sm">Dochód z wynajmu</span>
                      <span className="text-green-400 text-sm">+5.2%</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-3">18 500 zł</div>
                    <div className="h-16 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-slate-400 text-xs">Wykres dochodów z wynajmu</span>
                    </div>
                  </div>
                  
                  {/* Properties */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg"></div>
                        <div>
                          <div className="text-white text-sm font-medium">Mieszkanie 2-pokojowe</div>
                          <div className="text-slate-400 text-xs">Warszawa, Mokotów</div>
                        </div>
                      </div>
                      <div className="text-white font-semibold">650 000 zł</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg"></div>
                        <div>
                          <div className="text-white text-sm font-medium">Dom jednorodzinny</div>
                          <div className="text-slate-400 text-xs">Kraków, Podgórze</div>
                        </div>
                      </div>
                      <div className="text-white font-semibold">1 800 000 zł</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <StatsSection />

        {/* Calculators Section */}
        <section className="relative py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Nasze
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 ml-4">
                  Kalkulatory
                </span>
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Profesjonalne narzędzia do analizy inwestycji nieruchomościowych
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {[
                {
                  icon: <FiDollarSign size={36} />,
                  title: "Wycena Mieszkania AI",
                  description: "Wycena oparta o zaawansowany EstymatorAI. Dokładność 0.79% MAPE.",
                  href: "/kalkulator-wyceny",
                  gradient: "from-green-500 to-emerald-500"
                },
                {
                  icon: <FiHome size={36} />,
                  title: "Zakup Nieruchomości",
                  description: "Oblicz ratę kredytu, podatek PCC i wszystkie koszty okołozakupowe.",
                  href: "/kalkulator-zakupu-nieruchomosci",
                  gradient: "from-blue-500 to-indigo-500"
                },
                {
                  icon: <FiTrendingUp size={36} />,
                  title: "Opłacalność Wynajmu",
                  description: "Sprawdź rentowność inwestycji, ROI i czas zwrotu kapitału.",
                  href: "/kalkulator-wynajmu",
                  gradient: "from-purple-500 to-pink-500"
                },
                {
                  icon: <FiBarChart2 size={36} />,
                  title: "Zdolność Kredytowa",
                  description: "Oszacuj swoją zdolność kredytową i maksymalną kwotę kredytu.",
                  href: "/kalkulator-zdolnosci-kredytowej",
                  gradient: "from-orange-500 to-red-500"
                }
              ].map((calc, index) => (
                <Link 
                  key={index}
                  href={calc.href}
                  className="group relative block p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 ease-out overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className={`flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br ${calc.gradient} rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                      <div className="text-white">
                        {calc.icon}
                      </div>
                    </div>
                    <h3 className="mb-3 text-2xl font-bold tracking-tight text-white group-hover:text-blue-300 transition-colors duration-300">
                      {calc.title}
                    </h3>
                    <p className="font-medium text-slate-300 group-hover:text-slate-200 transition-colors duration-300 leading-relaxed">
                      {calc.description}
                    </p>
                    
                    {/* Decorative gradient orb */}
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <div className="inline-flex items-center px-6 py-3 bg-slate-800/50 backdrop-blur-sm rounded-full text-slate-300 font-medium border border-slate-700/50">
                <span className="text-green-400 mr-2">✨</span>
                Wszystkie kalkulatory są darmowe i nie wymagają rejestracji
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="relative py-16 md:py-24 bg-slate-800/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 mb-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-full text-slate-300 font-medium text-sm">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                Referencje
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Co mówią nasi klienci
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Nasza platforma kalkulatorów nieruchomości transformuje sposób, w jaki ludzie 
                analizują inwestycje. Oto co niektórzy z naszych użytkowników mówią o swoim doświadczeniu.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {[
                {
                  quote: "Z kalkulatorami nieruchomości wreszcie mam jasne zrozumienie wartości moich inwestycji. Wycena AI z dokładnością 0.79% MAPE to rewolucja! Zaoszczędziłem tyle czasu na analizie rynku. Najlepsza decyzja, jaką podjąłem jako inwestor.",
                  author: "Marek Kowalski",
                  role: "Inwestor nieruchomości"
                },
                {
                  quote: "Proste, niezawodne i skuteczne. Idealne narzędzie do analizy rentowności wynajmu i zakupu nieruchomości.",
                  author: "Anna Nowak",
                  role: "Deweloper nieruchomości"
                },
                {
                  quote: "Wreszcie czuję kontrolę nad swoimi inwestycjami w nieruchomości. Dziękuję za profesjonalne kalkulatory!",
                  author: "Piotr Wiśniewski",
                  role: "Inwestor prywatny"
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                  <div className="text-4xl text-slate-400 mb-4">&ldquo;</div>
                  <p className="text-slate-300 mb-6 leading-relaxed">{testimonial.quote}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full"></div>
                    <div>
                      <div className="text-white font-semibold">{testimonial.author}</div>
                      <div className="text-slate-400 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <CTASection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Blog Section */}
        <BlogSlider posts={latestPosts} />
      </div>
    </>
  );
}
