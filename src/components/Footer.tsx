'use client';

import Link from 'next/link';
import { useState } from 'react';
import CookieSettings from './CookieSettings';
import NewsletterFooterForm from './NewsletterFooterForm';

const Footer = () => {
  const [isCookieSettingsOpen, setIsCookieSettingsOpen] = useState(false);
  return (
    <footer className="bg-gray-100 mt-12 py-8">
      <div className="container mx-auto px-4">
        {/* Główna zawartość stopki */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          {/* O projekcie */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Kalkulatory Nieruchomości</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Profesjonalne narzędzia do analizy finansowej inwestycji w nieruchomości. 
              Sprawdź opłacalność zakupu, wynajmu i przeanalizuj swoją zdolność kredytową.
            </p>
          </div>

          {/* Kalkulatory */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Kalkulatory</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/kalkulator-zakupu-nieruchomosci" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                  Zakup Nieruchomości
                </Link>
              </li>
              <li>
                <Link href="/kalkulator-wynajmu" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                  Opłacalność Wynajmu
                </Link>
              </li>
              <li>
                <Link href="/kalkulator-zdolnosci-kredytowej" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                  Zdolność Kredytowa
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Newsletter</h3>
            <p className="text-gray-600 text-sm mb-3">
              Otrzymuj najnowsze analizy rynku i porady ekspertów
            </p>
            <NewsletterFooterForm />
          </div>

          {/* Wsparcie */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Wsparcie</h3>
            <div className="space-y-3">
              <p className="text-gray-600 text-sm">
                Podoba Ci się projekt? Możesz go wesprzeć!
              </p>
              <a 
                href="https://suppi.pl/kalkulatorynieruchomosci" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
              >
                ☕ Wesprzyj projekt
              </a>
            </div>
          </div>
        </div>

        {/* Dolna część stopki */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm mb-3 md:mb-0">
              &copy; 2025 Kalkulatory Nieruchomości. Wszelkie prawa zastrzeżone.
            </p>
            <div className="flex space-x-6">
              <Link href="/regulamin" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                Regulamin
              </Link>
              <Link href="/polityka-prywatnosci" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                Polityka Prywatności
              </Link>
              <button 
                onClick={() => setIsCookieSettingsOpen(true)}
                className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
              >
                Ustawienia Cookies
              </button>
              <a href="mailto:kontakt@kalkulatorynieruchomosci.pl" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                Kontakt
              </a>
            </div>
          </div>
                  </div>
        </div>
        
        <CookieSettings 
          isOpen={isCookieSettingsOpen}
          onClose={() => setIsCookieSettingsOpen(false)}
        />
      </footer>
    );
  };

export default Footer; 