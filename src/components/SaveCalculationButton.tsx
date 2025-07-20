'use client';

import { useState, useEffect } from 'react';

interface SaveCalculationButtonProps {
  calculationType: 'purchase' | 'rental' | 'creditScore' | 'valuation';
  inputData: any;
  resultData: any;
  onSave?: (success: boolean) => void;
  className?: string;
}

const SaveCalculationButton = ({
  calculationType,
  inputData,
  resultData,
  onSave,
  className = ''
}: SaveCalculationButtonProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sprawdź czy użytkownik jest zalogowany
    const checkAuthStatus = () => {
      const token = localStorage.getItem('auth_token');
      setIsLoggedIn(!!token);
      console.log('Auth status checked:', !!token);
    };

    // Sprawdź przy załadowaniu
    checkAuthStatus();

    // Nasłuchuj na zmiany autoryzacji
    const handleAuthChange = () => {
      console.log('Auth change event received');
      checkAuthStatus();
    };

    window.addEventListener('auth-change', handleAuthChange);

    // Cleanup
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const getDefaultTitle = () => {
    const date = new Date().toLocaleDateString('pl-PL');
    switch (calculationType) {
      case 'purchase':
        return `Kalkulator zakupu - ${date}`;
      case 'rental':
        return `Kalkulator wynajmu - ${date}`;
      case 'creditScore':
        return `Kalkulator zdolności kredytowej - ${date}`;
      case 'valuation':
        return `Wycena nieruchomości - ${date}`;
      default:
        return `Kalkulacja - ${date}`;
    }
  };

  const handleSaveClick = () => {
    if (!isLoggedIn) {
      alert('Musisz być zalogowany, aby zapisać kalkulację');
      return;
    }

    setTitle(getDefaultTitle());
    setShowModal(true);
    setError(null);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Tytuł kalkulacji jest wymagany');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Brak tokenu autoryzacji');
      }

      const response = await fetch('/api/user/calculations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          calculation_type: calculationType,
          input_json: inputData,
          result_json: resultData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd podczas zapisywania kalkulacji');
      }

      setShowModal(false);
      setTitle('');
      onSave?.(true);
      
      // Pokaż komunikat sukcesu
      alert('Kalkulacja została zapisana pomyślnie!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd');
      onSave?.(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setTitle('');
    setError(null);
  };

  if (!isLoggedIn) {
    return null;
  }

  const isButtonDisabled = !inputData || !resultData;

  return (
    <>
      <button
        type="button"
        onClick={handleSaveClick}
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        disabled={isButtonDisabled}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        Zapisz kalkulację
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Zapisz kalkulację
              </h3>
              
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Tytuł kalkulacji
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Wprowadź tytuł kalkulacji"
                  maxLength={255}
                />
              </div>

              {error && (
                <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  Anuluj
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  disabled={isLoading || !title.trim()}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Zapisywanie...
                    </>
                  ) : (
                    'Zapisz'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SaveCalculationButton; 