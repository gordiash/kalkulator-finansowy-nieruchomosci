"use client";

import Link from 'next/link';
import { useEffect } from 'react';
import { FiHome, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';
import { trackPageView, trackEvent } from '@/lib/analytics';

const Card = ({ icon, title, description, href }: { icon: React.ReactNode, title: string, description: string, href: string }) => (
  <Link 
    href={href} 
    onClick={() => trackEvent('calculator_link_click', { calculator_type: href.replace('/kalkulator-', '').replace('-', '_') })}
    className="group block p-8 bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out"
  >
    <div className="flex items-center justify-center w-16 h-16 mb-6 bg-blue-100 rounded-xl group-hover:bg-blue-500 transition-colors duration-300">
      <div className="text-blue-600 group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
    </div>
    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{title}</h5>
    <p className="font-normal text-gray-600">{description}</p>
  </Link>
);

export default function HomePage() {
  // Śledzenie wejścia na stronę główną
  useEffect(() => {
    trackPageView('homepage');
  }, []);

  return (
    <div className="bg-gray-50">
      <section className="text-center py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
            Twoje Centrum Analityki Nieruchomości
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mt-4 max-w-3xl mx-auto">
            Wszystkie narzędzia, których potrzebujesz, aby podjąć świadomą decyzję. Przejrzyste kalkulacje, kompleksowe analizy.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <Card 
            icon={<FiHome size={32} />}
            title="Kalkulator Zakupu Nieruchomości" 
            description="Oblicz ratę kredytu, podatek PCC i wszystkie koszty okołozakupowe." 
            href="/kalkulator-zakupu-nieruchomosci" 
          />
          <Card 
            icon={<FiTrendingUp size={32} />}
            title="Kalkulator Opłacalności Wynajmu" 
            description="Sprawdź, czy inwestycja w nieruchomość na wynajem jest rentowna." 
            href="/kalkulator-wynajmu"
          />
          <Card 
            icon={<FiBarChart2 size={32} />}
            title="Kalkulator Zdolności Kredytowej" 
            description="Oszacuj swoją zdolność kredytową i dowiedz się, na jaki kredyt Cię stać." 
            href="/kalkulator-zdolnosci-kredytowej"
          />
        </div>
      </div>
    </div>
  );
}
