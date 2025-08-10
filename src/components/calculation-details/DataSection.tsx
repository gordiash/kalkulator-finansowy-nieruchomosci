'use client';

import React from 'react';

import { FIELD_DEFINITIONS } from './FieldDefinitions';
import { DataRow } from './DataRow';
import { ValuationResultSection } from './sections/ValuationResultSection';
import { PurchaseResultSection } from './sections/PurchaseResultSection';
import { PurchaseInputSection } from './sections/PurchaseInputSection';
import { RentalInputSection } from './sections/RentalInputSection';
import { RentalResultSection } from './sections/RentalResultSection';
import { CreditScoreInputSection } from './sections/CreditScoreInputSection';
import { CreditScoreResultSection } from './sections/CreditScoreResultSection';

interface DataSectionProps {
  title: string;
  data: any;
  calculationType?: string;
}

export function DataSection({ title, data, calculationType }: DataSectionProps) {
  const allEntries = Object.entries(data || {})
  const filteredKeys = Object.keys(data || {})
    .filter(key => FIELD_DEFINITIONS[key] && data[key] != null && data[key] !== 'Brak' && data[key] !== '')
    .sort((a, b) => (FIELD_DEFINITIONS[a]?.order || 99) - (FIELD_DEFINITIONS[b]?.order || 99));

  // Wybierz odpowiedni komponent na podstawie typu kalkulacji
  if (calculationType === 'valuation' && title === 'Wynik wyceny') {
    return <ValuationResultSection data={data} />;
  }

  if (calculationType === 'purchase' && title === 'Wynik kalkulacji') {
    return <PurchaseResultSection data={data} />;
  }

  if (calculationType === 'purchase' && title === 'Dane wejściowe') {
    return <PurchaseInputSection data={data} />;
  }

  if (calculationType === 'rentability' && title === 'Dane wejściowe') {
    return <RentalInputSection data={data} />;
  }

  if (calculationType === 'rentability' && title === 'Wynik kalkulacji') {
    return <RentalResultSection data={data} />;
  }

  if (calculationType === 'credit-score' && title === 'Dane wejściowe') {
    return <CreditScoreInputSection data={data} />;
  }

  if (calculationType === 'credit-score' && title === 'Wynik kalkulacji') {
    return <CreditScoreResultSection data={data} />;
  }

  // Gdy brak definicji pól, pokaż prostą tabelę klucz/wartość (fallback)
  if (filteredKeys.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allEntries.length === 0 ? (
            <p className="text-gray-500">Brak danych do wyświetlenia.</p>
          ) : (
            allEntries
              .filter(([key]) => key !== 'inputData')
              .map(([key, value]) => (
                <div key={key} className="flex justify-between py-1">
                  <span className="text-gray-600 break-all">{key}</span>
                  <span className="font-medium text-gray-900 break-all">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                </div>
              ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">{title}</h2>
      <div className="space-y-2">
        {filteredKeys.map((key) => {
          const definition = FIELD_DEFINITIONS[key];
          const rawValue = data[key];
          const formattedValue = definition.format ? definition.format(rawValue) : rawValue;
          return <DataRow key={key} label={definition.label} value={formattedValue} />;
        })}
      </div>
    </div>
  );
} 