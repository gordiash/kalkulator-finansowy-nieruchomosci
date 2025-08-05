'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Calculation {
  id: string;
  title: string;
  calculation_type: string;
  created_at: string;
}

const getCalculationTypeLabel = (type: string) => {
  switch (type) {
    case 'valuation': return 'Wycena nieruchomości';
    case 'rentability': return 'Opłacalność wynajmu';
    case 'purchase': return 'Kalkulacja zakupu nieruchomości';
    // Dodaj inne typy w przyszłości
    default: return 'Inna kalkulacja';
  }
}

export default function KalkulacjePage() {
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [calculationToDelete, setCalculationToDelete] = useState<Calculation | null>(null);

  useEffect(() => {
    const fetchCalculations = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setError('Musisz być zalogowany, aby zobaczyć tę stronę.');
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/user/calculations', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Nie udało się pobrać zapisanych kalkulacji.');
        }

        const data = await response.json();
        setCalculations(data);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Wystąpił błąd.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalculations();
  }, []);

  const handleDeleteClick = (calc: Calculation, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCalculationToDelete(calc);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!calculationToDelete) return;

    try {
      setDeletingId(calculationToDelete.id);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setError('Brak tokenu autoryzacji');
        return;
      }

      const response = await fetch(`/api/user/calculations/${calculationToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Błąd podczas usuwania kalkulacji');
      }

      // Usuń kalkulację z listy
      setCalculations(prev => prev.filter(calc => calc.id !== calculationToDelete.id));
      
      // Pokaż komunikat sukcesu
      setError(null);
      setSuccessMessage(`Kalkulacja "${calculationToDelete.title}" została pomyślnie usunięta.`);
      
      // Ukryj komunikat sukcesu po 3 sekundach
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas usuwania.');
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setCalculationToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCalculationToDelete(null);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Moje kalkulacje</h1>
        <p className="text-gray-600 mt-2">Przeglądaj i zarządzaj swoimi zapisanymi kalkulacjami.</p>
      </div>

      {isLoading && (
         <div className="text-center py-10">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
           <p className="mt-4 text-gray-600">Ładowanie kalkulacji...</p>
         </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Błąd</p>
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
          <p className="font-bold">Sukces</p>
          <p>{successMessage}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="bg-white shadow-md rounded-2xl overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {calculations.length > 0 ? (
              calculations.map((calc) => (
                <li key={calc.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between p-6">
                    <Link href={`/panel/kalkulacje/${calc.id}`} className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-semibold text-blue-700">{calc.title}</p>
                          <p className="text-sm text-gray-500 mt-1">{getCalculationTypeLabel(calc.calculation_type)}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-sm text-gray-500">
                             {new Date(calc.created_at).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                           </p>
                           <svg className="h-5 w-5 text-gray-400 inline-block ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                           </svg>
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={(e) => handleDeleteClick(calc, e)}
                      disabled={deletingId === calc.id}
                      className={`ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200 ${
                        deletingId === calc.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Usuń kalkulację"
                    >
                      {deletingId === calc.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li className="p-6 text-center text-gray-500">
                Nie masz jeszcze żadnych zapisanych kalkulacji.
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Modal potwierdzenia usuwania */}
      {showDeleteModal && calculationToDelete && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50"
          onClick={handleDeleteCancel}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Usuń kalkulację</h3>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Czy na pewno chcesz usunąć kalkulację <strong>"{calculationToDelete.title}"</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Tej operacji nie można cofnąć.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                disabled={deletingId === calculationToDelete.id}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
              >
                Anuluj
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId === calculationToDelete.id}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors duration-200 ${
                  deletingId === calculationToDelete.id 
                    ? 'bg-red-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {deletingId === calculationToDelete.id ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Usuwanie...
                  </div>
                ) : (
                  'Usuń'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 