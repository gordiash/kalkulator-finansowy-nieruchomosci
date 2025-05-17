import React, { useState } from 'react';

interface SubscriptionPopupProps {
  onSubscribe: (email: string) => void;
  onClose: () => void;
}

const SubscriptionPopup: React.FC<SubscriptionPopupProps> = ({ onSubscribe, onClose }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Funkcja walidująca adres email za pomocą wyrażenia regularnego
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Usuwanie zbędnych znaków białych
    const sanitizedEmail = email.trim();
    
    // Walidacja adresu email
    if (!sanitizedEmail) {
      setError('Proszę podać adres email');
      return;
    }
    
    if (!validateEmail(sanitizedEmail)) {
      setError('Proszę podać poprawny adres email');
      return;
    }
    
    setError(null);
    onSubscribe(sanitizedEmail);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4 py-6">
      <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md relative animate-fadeIn mx-auto">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-2 touch-manipulation"
          aria-label="Zamknij"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h3 className="text-lg sm:text-xl font-semibold text-indigo-900 mb-2 mt-1">
          Zapisz się na newsletter
        </h3>
        
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          Otrzymuj najnowsze informacje o kalkulatorze i porady dotyczące nieruchomości.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="popupEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Adres email
            </label>
            <input
              type="email"
              id="popupEmail"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              className={`w-full p-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base`}
              required
              autoComplete="email"
              placeholder="Twój adres email"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
          
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-3 px-4 rounded-md transition-colors text-base"
          >
            Subskrybuj
          </button>
        </form>
        
        {/* Sekcja wsparcia - zawsze pod formularzem subskrypcji */}
        <div className="mt-6 text-center">
          <p className="mb-4 text-sm sm:text-base text-gray-700">
            Wesprzyj działanie naszej witryny! Twoje wsparcie pozwoli nam dalej rozwijać projekt
            i dostarczać wartościowe narzędzia.
          </p>
          <a 
            href="https://suppi.pl/smallcode" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block"
          >
            <img width="165" src="https://suppi.pl/api/widget/button.svg?fill=6457FD&textColor=ffffff" alt="Wesprzyj naszą stronę"/>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPopup; 