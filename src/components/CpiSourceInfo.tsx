import React from 'react';
import { Info } from 'lucide-react';

interface CpiSourceInfoProps {
  source: 'gus' | 'eurostat' | 'nbp';
  value: number;
  date: string;
  className?: string;
}

export function CpiSourceInfo({ source, value, date, className = '' }: CpiSourceInfoProps) {
  const sourceInfo = {
    gus: {
      name: 'GUS',
      fullName: 'Główny Urząd Statystyczny',
      description: 'Krajowy wskaźnik cen towarów i usług konsumpcyjnych',
      methodology: 'Dostosowany do polskich realiów konsumpcyjnych',
      frequency: 'Dane roczne',
      color: 'text-blue-600'
    },
    eurostat: {
      name: 'Eurostat',
      fullName: 'Europejski Urząd Statystyczny',
      description: 'HICP - Harmonised Index of Consumer Prices',
      methodology: 'Zharmonizowany wskaźnik dla krajów UE',
      frequency: 'Dane miesięczne',
      color: 'text-green-600'
    },
    nbp: {
      name: 'NBP',
      fullName: 'Narodowy Bank Polski',
      description: 'Wskaźnik inflacji bazowej i ogólnej',
      methodology: 'Dane monetarne i inflacyjne',
      frequency: 'Dane miesięczne',
      color: 'text-purple-600'
    }
  };

  const info = sourceInfo[source];

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`font-semibold ${info.color}`}>
              {info.name}
            </span>
            <span className="text-sm text-gray-500">
              ({info.fullName})
            </span>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Wartość:</strong> {value}% ({date})</p>
            <p><strong>Metodologia:</strong> {info.description}</p>
            <p><strong>Charakterystyka:</strong> {info.methodology}</p>
            <p><strong>Częstotliwość:</strong> {info.frequency}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CpiComparisonProps {
  gusData?: { value: number; date: string } | null;
  eurostatData?: { value: number; date: string } | null;
  className?: string;
}

export function CpiComparison({ gusData, eurostatData, className = '' }: CpiComparisonProps) {
  const difference = gusData && eurostatData ? 
    Math.abs(gusData.value - eurostatData.value) : null;
  
  const percentageDifference = difference && gusData && eurostatData ?
    Math.abs((gusData.value - eurostatData.value) / ((gusData.value + eurostatData.value) / 2)) * 100 : null;

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">
        Porównanie źródeł danych CPI
      </h3>
      
      <div className="grid gap-4 md:grid-cols-2">
        {eurostatData && (
          <CpiSourceInfo
            source="eurostat"
            value={eurostatData.value}
            date={eurostatData.date}
          />
        )}
        
        {gusData && (
          <CpiSourceInfo
            source="gus"
            value={gusData.value}
            date={gusData.date}
          />
        )}
      </div>
      
      {difference !== null && percentageDifference !== null && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">
            Analiza różnic
          </h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <p><strong>Różnica bezwzględna:</strong> {difference.toFixed(1)} p.p.</p>
            <p><strong>Różnica procentowa:</strong> {percentageDifference.toFixed(1)}%</p>
            <p className="mt-2">
              <strong>Wyjaśnienie:</strong> Różnice wynikają z odmiennych metodologii 
              (krajowa vs. zharmonizowana UE) oraz różnych okresów publikacji danych.
            </p>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">
          Rekomendacja
        </h4>
        <p className="text-sm text-blue-700">
          W kalkulatorach używamy danych z Eurostat jako głównego źródła ze względu na:
        </p>
        <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
          <li>Wyższą częstotliwość aktualizacji (miesięczne vs. roczne)</li>
          <li>Większą aktualność danych</li>
          <li>Standardy harmonizacji UE</li>
          <li>Lepszą dostępność przez API</li>
        </ul>
      </div>
    </div>
  );
}