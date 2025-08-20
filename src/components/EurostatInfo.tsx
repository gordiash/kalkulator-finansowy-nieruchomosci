'use client';

import React, { useState } from 'react';
import { Info, ExternalLink, TrendingDown, Calendar, Globe, CheckCircle } from 'lucide-react';

interface EurostatInfoProps {
  className?: string;
  showDetails?: boolean;
}

export function EurostatInfo({ className = '', showDetails = false }: EurostatInfoProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails);

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Globe className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-900">
              Dane inflacyjne z Eurostat
            </h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {isExpanded ? 'Zwiń' : 'Rozwiń'}
            </button>
          </div>
          
          <p className="text-sm text-blue-800 mb-3">
            Używamy oficjalnych danych HICP (Harmonised Index of Consumer Prices) 
            z Europejskiego Urzędu Statystycznego dla najwyższej jakości prognoz.
          </p>
          
          <div className="flex flex-wrap gap-4 text-xs text-blue-700">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>Dane miesięczne</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Aktualne do czerwca 2025</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              <span>Trend spadkowy: 3,4%</span>
            </div>
          </div>
          
          {isExpanded && (
            <div className="mt-4 space-y-4">
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-3">
                  Najnowsze dane CPI dla Polski
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-semibold text-blue-900">3,4%</div>
                    <div className="text-blue-600">Czerwiec 2025</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-semibold text-blue-900">3,5%</div>
                    <div className="text-blue-600">Maj 2025</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-semibold text-blue-900">3,7%</div>
                    <div className="text-blue-600">Kwiecień 2025</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-semibold text-blue-900">4,4%</div>
                    <div className="text-blue-600">Marzec 2025</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-3">
                  Dlaczego Eurostat?
                </h4>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div>
                    <h5 className="font-medium mb-2">Zalety metodologiczne:</h5>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Harmonizacja z standardami UE</li>
                      <li>Jednolita metodologia dla wszystkich krajów</li>
                      <li>Regularne aktualizacje miesięczne</li>
                      <li>Wysokiej jakości kontrola danych</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Zalety techniczne:</h5>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Stabilne i niezawodne API</li>
                      <li>Bezpłatny dostęp bez limitów</li>
                      <li>Dane dostępne w czasie rzeczywistym</li>
                      <li>Automatyczne aktualizacje</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">
                  Porównanie z GUS
                </h4>
                <div className="text-sm text-yellow-700 space-y-2">
                  <div className="flex justify-between">
                    <span>Eurostat (czerwiec 2025):</span>
                    <span className="font-semibold">3,4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GUS (grudzień 2024):</span>
                    <span className="font-semibold">3,6%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Różnica:</span>
                    <span className="font-semibold">0,2 p.p.</span>
                  </div>
                  <p className="text-xs mt-2">
                    Różnice wynikają z odmiennych metodologii i okresów publikacji.
                    Eurostat zapewnia bardziej aktualne dane miesięczne.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-blue-600">
                <span>Źródło: Eurostat HICP Dataset (prc_hicp_manr)</span>
                <a
                  href="https://ec.europa.eu/eurostat/databrowser/view/prc_hicp_manr/default/table?lang=en&category=prc.prc_hicp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-blue-800"
                >
                  <span>Zobacz dane</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface EurostatBadgeProps {
  value: number;
  date: string;
  trend?: 'up' | 'down' | 'stable';
  className?: string;
}

export function EurostatBadge({ value, date, trend, className = '' }: EurostatBadgeProps) {
  const trendColors = {
    up: 'text-red-600 bg-red-50 border-red-200',
    down: 'text-green-600 bg-green-50 border-green-200',
    stable: 'text-blue-600 bg-blue-50 border-blue-200'
  };

  const trendColor = trend ? trendColors[trend] : 'text-blue-600 bg-blue-50 border-blue-200';

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${trendColor} ${className}`}>
      <Globe className="w-4 h-4" />
      <span>CPI: {value}%</span>
      <span className="text-xs opacity-75">({date})</span>
      <span className="text-xs opacity-75">Eurostat</span>
    </div>
  );
}

interface EurostatStatusProps {
  isLoading?: boolean;
  error?: string | null;
  lastUpdate?: string;
  className?: string;
}

export function EurostatStatus({ isLoading, error, lastUpdate, className = '' }: EurostatStatusProps) {
  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-blue-600 ${className}`}>
        <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        <span>Pobieranie danych z Eurostat...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-sm text-red-600 ${className}`}>
        <Info className="w-4 h-4" />
        <span>Błąd połączenia z Eurostat: {error}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-sm text-green-600 ${className}`}>
      <CheckCircle className="w-4 h-4" />
      <span>
        Dane aktualne z Eurostat
        {lastUpdate && (
          <span className="text-gray-500 ml-1">
            (ostatnia aktualizacja: {lastUpdate})
          </span>
        )}
      </span>
    </div>
  );
}