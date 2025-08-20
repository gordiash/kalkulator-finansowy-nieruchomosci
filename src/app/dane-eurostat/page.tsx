import React from 'react';
import { Metadata } from 'next';
import { EurostatInfo, EurostatBadge, EurostatStatus } from '@/components/EurostatInfo';
import { Globe, TrendingDown, Calendar, CheckCircle, BarChart3, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dane Eurostat CPI - Inflacja w Polsce | Kalkulatory Nieruchomości',
  description: 'Oficjalne dane inflacyjne CPI dla Polski z Eurostat. Harmonizowany wskaźnik cen konsumpcyjnych HICP z miesięcznymi aktualizacjami.',
  keywords: 'eurostat, CPI, inflacja, HICP, dane inflacyjne, Polska, harmonizowany wskaźnik cen',
};

async function getEurostatData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/market/eurostat-info?type=overview`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch Eurostat data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Eurostat data:', error);
    return null;
  }
}

async function getComparisonData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/market/eurostat-info?type=comparison`, {
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch comparison data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    return null;
  }
}

export default async function EurostatDataPage() {
  const [eurostatData, comparisonData] = await Promise.all([
    getEurostatData(),
    getComparisonData()
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Dane Eurostat CPI
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Oficjalne dane inflacyjne dla Polski z Europejskiego Urzędu Statystycznego. 
            Harmonizowany wskaźnik cen konsumpcyjnych (HICP) z miesięcznymi aktualizacjami.
          </p>
          
          {eurostatData?.current && (
            <div className="mt-6">
              <EurostatBadge
                value={eurostatData.current.value}
                date={eurostatData.current.date}
                trend={eurostatData.current.trend}
                className="text-lg px-6 py-3"
              />
            </div>
          )}
        </div>

        {/* Main Info Component */}
        <div className="mb-8">
          <EurostatInfo showDetails={true} />
        </div>

        {/* Current Data Section */}
        {eurostatData && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Aktualne Dane
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Najnowsza wartość:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {eurostatData.current.value}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-medium">{eurostatData.current.date}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trend:</span>
                  <span className={`font-medium ${
                    eurostatData.current.trend === 'down' ? 'text-green-600' :
                    eurostatData.current.trend === 'up' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {eurostatData.current.trend === 'down' ? 'Spadkowy' :
                     eurostatData.current.trend === 'up' ? 'Wzrostowy' : 'Stabilny'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Statystyki
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Punkty danych:</span>
                  <span className="font-medium">{eurostatData.statistics.dataPoints}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Średnia:</span>
                  <span className="font-medium">{eurostatData.statistics.average}%</span>
                </div>
                
                {eurostatData.statistics.peak && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Szczyt:</span>
                    <span className="font-medium text-red-600">
                      {eurostatData.statistics.peak.value}% ({eurostatData.statistics.peak.date})
                    </span>
                  </div>
                )}
                
                {eurostatData.statistics.trough && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Dołek:</span>
                    <span className="font-medium text-green-600">
                      {eurostatData.statistics.trough.value}% ({eurostatData.statistics.trough.date})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recent Trend */}
        {eurostatData?.recentTrend && eurostatData.recentTrend.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-blue-600" />
              Ostatnie Miesiące
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {eurostatData.recentTrend.slice(-6).map((item: any, index: number) => (
                <div key={index} className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-900">
                    {item.value}%
                  </div>
                  <div className="text-sm text-blue-600">
                    {new Date(item.date).toLocaleDateString('pl-PL', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source Comparison */}
        {comparisonData && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-purple-600" />
              Porównanie Źródeł Danych
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(comparisonData.sources).map(([key, source]: [string, any]) => (
                <div key={key} className={`p-4 rounded-lg border-2 ${
                  key === comparisonData.recommendation.primary 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-semibold text-gray-900">{source.name}</h3>
                    {key === comparisonData.recommendation.primary && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Metodologia:</span>
                      <div className="text-gray-900">{source.methodology}</div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Częstotliwość:</span>
                      <div className="text-gray-900">{source.frequency}</div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Opóźnienie:</span>
                      <div className="text-gray-900">{source.delay}</div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="text-xs text-green-700 mb-1">Zalety:</div>
                    <ul className="text-xs text-green-600 list-disc list-inside">
                      {source.advantages.map((advantage: string, idx: number) => (
                        <li key={idx}>{advantage}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Nasza Rekomendacja</h4>
              <p className="text-blue-800 text-sm">
                {comparisonData.recommendation.reason}
              </p>
              <p className="text-blue-700 text-xs mt-2">
                Strategia: {comparisonData.recommendation.strategy}
              </p>
            </div>
          </div>
        )}

        {/* Technical Information */}
        {eurostatData?.technicalInfo && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informacje Techniczne
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">API i Dostęp</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Endpoint:</span>
                    <span className="text-gray-900 text-xs">eurostat/api/...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format:</span>
                    <span className="text-gray-900">{eurostatData.technicalInfo.responseFormat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Limity:</span>
                    <span className="text-gray-900">{eurostatData.technicalInfo.rateLimits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dostępność:</span>
                    <span className="text-gray-900">{eurostatData.technicalInfo.availability}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Dane</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Okres:</span>
                    <span className="text-gray-900">{eurostatData.technicalInfo.supportedPeriods}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cache:</span>
                    <span className="text-gray-900">{eurostatData.technicalInfo.caching}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aktualizacje:</span>
                    <span className="text-gray-900">Miesięczne</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advantages */}
        {eurostatData?.advantages && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Dlaczego Eurostat?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {eurostatData.advantages.map((advantage: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-800 text-sm">{advantage}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}