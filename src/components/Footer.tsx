'use client';

import Link from 'next/link';
import { useState } from 'react';
import CookieSettings from './CookieSettings';
import NewsletterFooterForm from './NewsletterFooterForm';

const Footer = () => {
  const [isCookieSettingsOpen, setIsCookieSettingsOpen] = useState(false);
  return (
    <footer className="bg-gray-100 mt-12 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Główna zawartość stopki */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* O projekcie */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Kalkulatory Nieruchomości</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Profesjonalne narzędzia do analizy finansowej inwestycji w nieruchomości. 
              Sprawdź opłacalność zakupu, wynajmu i przeanalizuj swoją zdolność kredytową.
            </p>
          </div>

          {/* Kalkulatory */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Kalkulatory</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/kalkulator-wyceny" className="text-gray-700 hover:text-blue-700 transition-colors text-sm">
                  Wycena Mieszkania
                </Link>
              </li>
              <li>
                <Link href="/kalkulator-zakupu-nieruchomosci" className="text-gray-700 hover:text-blue-700 transition-colors text-sm">
                  Zakup Nieruchomości
                </Link>
              </li>
              <li>
                <Link href="/kalkulator-wynajmu" className="text-gray-700 hover:text-blue-700 transition-colors text-sm">
                  Opłacalność Wynajmu
                </Link>
              </li>
              <li>
                <Link href="/kalkulator-zdolnosci-kredytowej" className="text-gray-700 hover:text-blue-700 transition-colors text-sm">
                  Zdolność Kredytowa
                </Link>
              </li>
              <li>
                <Link href="/kalkulator-flipera" className="text-gray-700 hover:text-blue-700 transition-colors text-sm">
                  Kalkulator Flipera
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Newsletter</h3>
            <p className="text-gray-700 text-sm mb-3">
              Otrzymuj najnowsze analizy rynku i porady ekspertów
            </p>
            <NewsletterFooterForm />
          </div>

          {/* Wsparcie */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Wsparcie</h3>
            <div className="space-y-3">
              <p className="text-gray-700 text-sm">
                Podoba Ci się projekt? Możesz go wesprzeć!
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href="https://suppi.pl/kalkulatorynieruchomosci" 
                  target="_blank" 
                  rel="noopener noreferrer"
                   className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                >
                  ☕ Wesprzyj projekt
                </a>
                <a 
                  href="https://www.facebook.com/profile.php?id=61576156535762" 
                  target="_blank" 
                  rel="noopener noreferrer"
                   className="inline-flex items-center justify-center bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                  aria-label="Odwiedź naszą stronę na Facebook"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Dolna część stopki */}
        <div className="border-t border-gray-200 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <p className="text-gray-700 text-sm text-center sm:text-left">
              &copy; 2025 Kalkulatory Nieruchomości. Wszelkie prawa zastrzeżone.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6 text-sm">
              <Link href="/regulamin" className="text-gray-700 hover:text-blue-700 transition-colors">
                Regulamin
              </Link>
              <Link href="/polityka-prywatnosci" className="text-gray-700 hover:text-blue-700 transition-colors">
                Polityka Prywatności
              </Link>
              <Link href="/o-nas" className="text-gray-700 hover:text-blue-700 transition-colors">
                O&nbsp;nas
              </Link>
              <Link href="/kontakt" className="text-gray-700 hover:text-blue-700 transition-colors">
                Kontakt
              </Link>
              <button 
                onClick={() => setIsCookieSettingsOpen(true)}
                className="text-gray-700 hover:text-blue-700 transition-colors"
              >
                Ustawienia Cookies
              </button>
            </div>
          </div>
        </div>
        
        <CookieSettings 
          isOpen={isCookieSettingsOpen}
          onClose={() => setIsCookieSettingsOpen(false)}
        />
      </div>
    </footer>
  );
};

export default Footer; 