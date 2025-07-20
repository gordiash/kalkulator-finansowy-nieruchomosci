'use client';

import { useState } from 'react';
import CalculationsTable from '@/components/panel/CalculationsTable';

export default function CalculationsPage() {
  const [selectedType, setSelectedType] = useState<string>('');

  const calculationTypes = [
    { value: '', label: 'Wszystkie kalkulacje' },
    { value: 'purchase', label: 'Zakup nieruchomości' },
    { value: 'rental', label: 'Opłacalność wynajmu' },
    { value: 'creditScore', label: 'Zdolność kredytowa' },
    { value: 'valuation', label: 'Wycena nieruchomości' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zapisane kalkulacje</h1>
          <p className="text-sm text-gray-600 mt-1">
            Przeglądaj i zarządzaj swoimi zapisanymi kalkulacjami
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {calculationTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <CalculationsTable type={selectedType || undefined} />
    </div>
  );
} 