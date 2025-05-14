import React, { useState, useEffect } from 'react';
import { secureStorage } from '../utils/localStorageUtils';

const CookieConsent: React.FC = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Sprawdzamy, czy użytkownik już wcześniej zaakceptował cookies
    const hasAcceptedCookies = secureStorage.getItem<boolean>('cookiesAccepted', false);
    
    // Jeśli nie zaakceptował, pokazujemy informację
    if (!hasAcceptedCookies) {
      // Opóźniamy wyświetlenie informacji o 1 sekundę
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    secureStorage.setItem('cookiesAccepted', true);
    secureStorage.setupAutoExpiry('cookiesAccepted', 365 * 24 * 60 * 60 * 1000); // Wygasa po roku
    setShowConsent(false);
  };

  const handleReject = () => {
    // Tutaj można by zaimplementować usuwanie ciasteczek
    // lub dodać kod dla obsługi zgody na nieistotne cookies
    secureStorage.setItem('cookiesAccepted', false);
    setShowConsent(false);
  };

  if (!showConsent) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-brand-darkblue text-white p-4 z-50 shadow-lg">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex-1 mb-4 md:mb-0 md:mr-4">
            <h3 className="text-lg font-semibold mb-1">Ta strona używa plików cookies</h3>
            <p className="text-sm text-blue-200">
              Używamy cookies, aby zapewnić najlepsze doświadczenia na naszej stronie internetowej. 
              Cookies są używane do przechowywania preferencji użytkownika, analityki oraz poprawy funkcjonalności strony.
              Niektóre cookies są niezbędne do działania strony, inne pomagają nam ją ulepszać.
            </p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handleAccept}
              className="px-4 py-2 bg-brand-green text-white rounded hover:bg-brand-darkgreen transition-colors"
              aria-label="Zaakceptuj cookies"
            >
              Akceptuję
            </button>
            <button 
              onClick={handleReject}
              className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-700 transition-colors"
              aria-label="Odrzuć nieistotne cookies"
            >
              Tylko niezbędne
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent; 