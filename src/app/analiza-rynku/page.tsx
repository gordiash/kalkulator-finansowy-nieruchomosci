import IndicatorsGrid from '@/components/market/IndicatorsGrid';
import ClientView from './ClientView';
import { Suspense } from 'react';

export const metadata = {
  title: 'Analiza rynku nieruchomości',
  description: 'Wskaźniki makro i wykresy dla rynku nieruchomości w Polsce',
};

function LoadingIndicator() {
  return (
    <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50">
      <div className="animate-pulse">
        <div className="h-6 bg-slate-700 rounded mb-4"></div>
        <div className="h-4 bg-slate-700 rounded mb-2"></div>
        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
      </div>
    </div>
  );
}

export default async function MarketAnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white pt-20 sm:pt-24">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Analiza rynku nieruchomości</h1>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto">
            Kompleksowa analiza wskaźników makroekonomicznych wpływających na rynek nieruchomości w Polsce
          </p>
        </div>
        
        <div className="space-y-12">
          <Suspense fallback={<LoadingIndicator />}>
            <IndicatorsGrid />
          </Suspense>
          
          <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-2xl font-bold mb-6 text-center">Interaktywne wykresy rynkowe</h2>
            <Suspense fallback={<LoadingIndicator />}>
              <ClientView />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
