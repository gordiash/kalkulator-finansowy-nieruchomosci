'use client';

import { useState, useEffect } from 'react';

interface SaveCalculationButtonProps {
  calculationData: any; // dane wejściowe kalkulacji
  resultData: any;      // wyniki kalkulacji
  calculationType: string; // np. 'valuation', 'rentability'
  className?: string;
}

export default function SaveCalculationButton({
  calculationData,
  resultData,
  calculationType,
  className = '',
}: SaveCalculationButtonProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Sprawdź stan zalogowania po stronie klienta
    const token = localStorage.getItem('auth_token');
    setIsLoggedIn(!!token);

    const handleAuthChange = () => {
      const token = localStorage.getItem('auth_token');
      setIsLoggedIn(!!token);
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleSave = async () => {
    if (!title) {
      setError('Tytuł jest wymagany, aby zapisać kalkulację.');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/user/calculations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          calculationType,
          input_json: calculationData,
          result_json: resultData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Nie udało się zapisać kalkulacji');
      }
      
      setSuccess(`Kalkulacja "${title}" została pomyślnie zapisana!`);
      setTitle(''); // Wyczyść pole po zapisie

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Komponent jest renderowany tylko jeśli użytkownik jest zalogowany
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-gray-200 rounded-2xl p-4 sm:p-6 mt-6 sm:mt-8 shadow-sm ${className}`}>
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Zapisz swoją kalkulację</h3>
      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
        {resultData 
          ? 'Nadaj tytuł i zapisz wyniki na swoim koncie, aby wrócić do nich później.'
          : 'Po wykonaniu obliczeń, będziesz mógł zapisać tę kalkulację na swoim koncie.'
        }
      </p>
      
      <div className="space-y-3 sm:space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError(null);
            if (success) setSuccess(null);
          }}
          placeholder="np. Moja pierwsza wycena, Mieszkanie w Warszawie"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition"
          disabled={isSaving}
        />
        <button
          onClick={handleSave}
          disabled={isSaving || !title || !resultData}
          className="w-full sm:w-auto bg-blue-600 text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 text-sm sm:text-base rounded-xl hover:bg-blue-700 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center shadow-lg"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
              Zapisywanie...
            </>
          ) : (
            'Zapisz w panelu'
          )}
        </button>
      </div>

      {error && <p className="text-red-500 text-xs sm:text-sm mt-2 sm:mt-3">{error}</p>}
      {success && <p className="text-green-600 text-xs sm:text-sm mt-2 sm:mt-3">{success}</p>}
    </div>
  );
} 