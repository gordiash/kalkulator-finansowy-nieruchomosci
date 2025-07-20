'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Calculation {
  id: string;
  title: string;
  calculation_type: string;
  input_json: any;
  result_json: any;
  created_at: string;
  updated_at: string;
}

interface CalculationsTableProps {
  type?: string;
}

const CalculationsTable = ({ type }: CalculationsTableProps) => {
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalculations();
  }, [type]);

  const fetchCalculations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setError('Brak tokenu autoryzacji');
        return;
      }

      const url = type ? `/api/user/calculations?type=${type}` : '/api/user/calculations';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Błąd podczas pobierania kalkulacji');
      }

      const data = await response.json();
      setCalculations(data.calculations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd');
    } finally {
      setLoading(false);
    }
  };

  const deleteCalculation = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę kalkulację?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setError('Brak tokenu autoryzacji');
        return;
      }

      const response = await fetch(`/api/user/calculations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Błąd podczas usuwania kalkulacji');
      }

      // Odśwież listę
      fetchCalculations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd');
    }
  };

  const getCalculationTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'Zakup nieruchomości';
      case 'rental':
        return 'Opłacalność wynajmu';
      case 'creditScore':
        return 'Zdolność kredytowa';
      case 'valuation':
        return 'Wycena nieruchomości';
      default:
        return type;
    }
  };

  const getCalculationTypeColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'bg-blue-100 text-blue-800';
      case 'rental':
        return 'bg-green-100 text-green-800';
      case 'creditScore':
        return 'bg-purple-100 text-purple-800';
      case 'valuation':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Błąd: {error}</p>
        <button
          onClick={fetchCalculations}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  if (calculations.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Brak zapisanych kalkulacji</h3>
        <p className="mt-1 text-sm text-gray-500">
          Zapisane kalkulacje pojawią się tutaj po wykonaniu obliczeń.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow-sm rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          {type ? `Kalkulacje: ${getCalculationTypeLabel(type)}` : 'Wszystkie kalkulacje'}
        </h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tytuł
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data utworzenia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {calculations.map((calculation) => (
                <tr key={calculation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {calculation.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCalculationTypeColor(calculation.calculation_type)}`}>
                      {getCalculationTypeLabel(calculation.calculation_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(calculation.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/panel/kalkulacje/${calculation.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Zobacz
                      </Link>
                      <button
                        onClick={() => deleteCalculation(calculation.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Usuń
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CalculationsTable; 