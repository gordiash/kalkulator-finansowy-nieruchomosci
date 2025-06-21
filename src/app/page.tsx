import Link from 'next/link';
import { FiHome, FiTrendingUp, FiBarChart2, FiDollarSign } from 'react-icons/fi';
import { fetchLatestPosts } from '@/lib/supabase/blog';
import BlogSlider from '@/components/blog/BlogSlider';
import ValuationCalculator from '@/components/ValuationCalculator';
import type { Metadata } from 'next'
import { defaultMeta } from '@/lib/seo/defaultMeta'

const Card = ({ icon, title, description, href }: { icon: React.ReactNode, title: string, description: string, href: string }) => (
  <Link 
    href={href} 
    className="group relative block p-8 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 ease-out overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-50/20 before:to-indigo-50/20 before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100"
  >
    <div className="relative z-10">
      <div className="flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h5 className="mb-3 text-2xl font-bold tracking-tight text-gray-900 group-hover:text-blue-700 transition-colors duration-300">{title}</h5>
      <p className="font-medium text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">{description}</p>
      
      {/* Decorative gradient orb */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
    </div>
  </Link>
);

export const generateMetadata = (): Metadata => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  return {
    ...defaultMeta,
    title: 'Analityka Nieruchomości – Kalkulatory Wyceny, Zakupu i Wynajmu',
    description:
      'Kalkulator wyceny mieszkań z AI (Random Forest), kalkulatory zakupu i wynajmu nieruchomości, zdolności kredytowej oraz blog inwestycyjny.',
    keywords: [
      'kalkulator wyceny mieszkania',
      'sztuczna inteligencja nieruchomości', 
      'Random Forest wycena',
      'kalkulator zakupu nieruchomości',
      'kalkulator wynajmu',
      'zdolność kredytowa',
      'analityka nieruchomości',
      'wycena AI',
      'Olsztyn mieszkania'
    ],
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      ...defaultMeta.openGraph,
      title: 'Analityka Nieruchomości – Kalkulatory Wyceny, Zakupu i Wynajmu',
      description:
        'Kalkulator wyceny mieszkań z AI (Random Forest), kalkulatory zakupu i wynajmu nieruchomości, zdolności kredytowej oraz blog inwestycyjny.',
      url: baseUrl,
    },
  }
}

export default async function HomePage() {
  // Pobierz najnowsze posty z bloga
  const latestPosts = await fetchLatestPosts(6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Analityka Nieruchomości",
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
          "566 ofert w bazie treningowej", 
          "35 cech uwzględnianych w modelu",
          "Średni błąd predykcji 15.56%",
          "Obsługa regionu Olsztyn"
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
        "description": "Wycena mieszkania oparta o zaawansowany model Ensemble AI. Dokładność 0.77% MAPE.",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"}/kalkulator-wyceny`,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "PLN"
        },
        "applicationSubCategory": "Real Estate Valuation",
        "keywords": "wycena mieszkania, ensemble AI, LightGBM, Random Forest, CatBoost, machine learning, nieruchomości"
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
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <section className="relative text-center py-24 md:py-32 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="inline-flex items-center px-4 py-2 mb-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full text-blue-700 font-medium text-sm border border-blue-200/50">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            Profesjonalne narzędzia analityczne
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 leading-tight mb-6">
            Twoje Centrum
            <br />
            <span className="text-gradient bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">Analityki Nieruchomości</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mt-6 max-w-4xl mx-auto font-light leading-relaxed">
            Wszystkie narzędzia, których potrzebujesz, aby podjąć 
            <span className="font-semibold text-blue-700"> świadomą decyzję</span>. 
            Przejrzyste kalkulacje, kompleksowe analizy.
          </p>
          
          <div className="mt-12">
            <Link 
              href="/kalkulator-wyceny"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <FiDollarSign className="mr-2" size={20} />
              Sprawdź wartość mieszkania
            </Link>
          </div>
        </div>
      </section>

      {/* Sekcja kalkulatora wyceny */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full text-blue-700 font-medium text-sm border border-blue-200/50">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              Nowy! Wycena oparta o AI
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Kalkulator Wyceny</span> Mieszkania
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Pierwsza w Polsce wycena mieszkań oparta o zaawansowany model Ensemble AI. 
              LightGBM + Random Forest + CatBoost wytrenowane na <span className="font-semibold text-blue-700">566 ofertach</span> z regionu Olsztyn.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8 md:p-12">
            <ValuationCalculator />
          </div>
          
          <div className="mt-12 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50">
                <div className="text-2xl font-bold text-green-600 mb-2">0.77%</div>
                <div className="text-sm text-gray-600">Średni błąd predykcji (MAPE)</div>
              </div>
              <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50">
                <div className="text-2xl font-bold text-blue-600 mb-2">566</div>
                <div className="text-sm text-gray-600">Ofert w bazie treningowej</div>
              </div>
              <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50">
                <div className="text-2xl font-bold text-blue-600 mb-2">100+</div>
                <div className="text-sm text-gray-600">Cech uwzględnianych w modelu</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nasze <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Kalkulatory</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Profesjonalne narzędzia do analizy inwestycji nieruchomościowych
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8">
            <Card 
              icon={<FiDollarSign size={36} />}
              title="Kalkulator Wyceny Mieszkania" 
              description="Wycena mieszkania oparta o zaawansowany model Ensemble AI. Dokładność 0.77% MAPE." 
              href="/kalkulator-wyceny" 
            />
            <Card 
              icon={<FiHome size={36} />}
              title="Kalkulator Zakupu Nieruchomości" 
              description="Oblicz ratę kredytu, podatek PCC i wszystkie koszty okołozakupowe w jednym miejscu." 
              href="/kalkulator-zakupu-nieruchomosci" 
            />
            <Card 
              icon={<FiTrendingUp size={36} />}
              title="Kalkulator Opłacalności Wynajmu" 
              description="Sprawdź rentowność inwestycji, ROI i czas zwrotu kapitału z wynajmu nieruchomości." 
              href="/kalkulator-wynajmu"
            />
            <Card 
              icon={<FiBarChart2 size={36} />}
              title="Kalkulator Zdolności Kredytowej" 
              description="Oszacuj swoją zdolność kredytową i maksymalną kwotę kredytu hipotecznego." 
              href="/kalkulator-zdolnosci-kredytowej"
            />
          </div>
          
          <div className="mt-16 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-full text-gray-700 font-medium border border-gray-200/50">
              <span className="text-green-500 mr-2">✨</span>
              Wszystkie kalkulatory są darmowe i nie wymagają rejestracji
            </div>
          </div>
        </div>
      </section>

      {/* Sekcja O nas */}
      <section className="relative py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">
            Nasza <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Misja</span> i&nbsp;Wartości
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6 text-center">
            W&nbsp;<span className="font-semibold">KalkulatoryNieruchomosci.pl</span> wierzymy, że&nbsp;każdy zasługuje
            na jasność i pewność w świecie nieruchomości. Upraszczamy skomplikowane obliczenia,
            abyś mógł podejmować świadome decyzje – zawsze i wszędzie.
          </p>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Dostępność',
                desc: 'Intuicyjne narzędzia, które każdy może łatwo obsłużyć – wiedza na wyciągnięcie ręki.'
              },
              {
                title: 'Dokładność',
                desc: 'Aktualne i precyzyjne dane, by wyniki kalkulacji były wiarygodne.'
              },
              {
                title: 'Wsparcie',
                desc: 'Nie tylko kalkulatory – również wiedza i poradniki, które prowadzą krok po kroku.'
              },
              {
                title: 'Transparentność',
                desc: 'Pełna jasność założeń i rezultatów, abyś zawsze wiedział, na czym stoisz.'
              }
            ].map((item) => (
              <div key={item.title} className="p-6 bg-gray-50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold mb-2 text-blue-700">{item.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BlogSlider posts={latestPosts} />
      </div>
    </>
  );
}
