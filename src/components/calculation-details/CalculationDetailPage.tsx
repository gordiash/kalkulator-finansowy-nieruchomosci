'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

import { DataSection } from './DataSection';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorDisplay } from '../ui/ErrorDisplay';

export default function CalculationDetailPage() {
  const [calculation, setCalculation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (!id) return;
    
    const fetchCalculation = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) throw new Error("Brak autoryzacji");

        const response = await fetch(`/api/user/calculations/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Nie udało się pobrać danych kalkulacji');
        }

        const data = await response.json();
        console.log('Pobrane dane kalkulacji:', data);
        
        // Sprawdź czy dane są poprawne
        if (!data.input_json || Object.keys(data.input_json).length === 0) {
          console.warn('Brak danych wejściowych w kalkulacji');
        }
        
        if (!data.result_json || Object.keys(data.result_json).length === 0) {
          console.warn('Brak danych wynikowych w kalkulacji');
        }
        
        setCalculation(data);

      } catch (err) {
        console.error('Błąd podczas pobierania kalkulacji:', err);
        setError(err instanceof Error ? err.message : 'Wystąpił błąd');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalculation();
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner message="Ładowanie szczegółów kalkulacji..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} backLink="/panel/kalkulacje" />;
  }
  
  if (!calculation) {
    return <div>Nie znaleziono kalkulacji.</div>;
  }

  // Sprawdź czy dane są dostępne
  const hasInputData = calculation.input_json && Object.keys(calculation.input_json).length > 0;
  const hasResultData = calculation.result_json && Object.keys(calculation.result_json).length > 0;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/panel/kalkulacje" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Wróć do listy
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">{calculation.title}</h1>
        <p className="text-gray-500 mt-2">
          Szczegóły zapisanej kalkulacji z dnia {new Date(calculation.created_at).toLocaleDateString('pl-PL')}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Typ kalkulacji: {calculation.calculation_type}
        </p>
      </div>

      <div className="space-y-8">
        {hasInputData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3">
              <DataSection 
                title={calculation.calculation_type === 'purchase' ? 'Dane wejściowe' : 'Dane wejściowe'} 
                data={calculation.input_json} 
                calculationType={calculation.calculation_type}
              />
            </div>
          </div>
        )}
        
        {hasResultData && (
          <div className="w-full">
            <DataSection
              title={
                calculation.calculation_type === 'purchase' ? 'Wynik kalkulacji' :
                calculation.calculation_type === 'rentability' ? 'Wynik kalkulacji' :
                calculation.calculation_type === 'credit-score' ? 'Wynik kalkulacji' :
                'Wynik wyceny'
              }
              data={{
                ...calculation.result_json,
                inputData: calculation.input_json // Przekaż dane wejściowe do wyników
              }}
              calculationType={calculation.calculation_type}
            />
          </div>
        )}

        {!hasInputData && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Dane wejściowe</h2>
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Brak zapisanych danych wejściowych</p>
              <p className="text-sm mt-1">Dane mogły zostać uszkodzone lub nie zostały zapisane</p>
            </div>
          </div>
        )}

        {!hasResultData && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {calculation.calculation_type === 'purchase' ? 'Wynik kalkulacji' : 
               calculation.calculation_type === 'credit-score' ? 'Wynik kalkulacji' :
               'Wynik wyceny'}
            </h2>
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p>Brak zapisanych wyników</p>
              <p className="text-sm mt-1">Wyniki mogły zostać uszkodzone lub nie zostały zapisane</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 