import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import DonationModal from './DonationModal';
import CookieConsent from './CookieConsent';
import LogoSVG from '../assets/images/LogoSVG';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showDonationModal, setShowDonationModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-lightblue to-white text-gray-800 font-sans flex flex-col">
      {/* Nagłówek nawigacyjny */}
      <nav className="bg-gradient-to-r from-brand-darkblue to-brand-blue text-white py-4 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Link to="/" className="flex items-center mb-3 md:mb-0">
              
              <span className="text-xl font-bold">Kalkulator Finansowy Nieruchomości</span>
            </Link>
            <div className="flex space-x-4">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  isActive 
                    ? "px-3 py-2 rounded-md bg-brand-green text-white" 
                    : "px-3 py-2 rounded-md text-blue-100 hover:bg-brand-green hover:text-white transition-colors"
                }
                end
              >
                Strona główna
              </NavLink>
              <NavLink 
                to="/roi" 
                className={({ isActive }) => 
                  isActive 
                    ? "px-3 py-2 rounded-md bg-brand-green text-white" 
                    : "px-3 py-2 rounded-md text-blue-100 hover:bg-brand-green hover:text-white transition-colors"
                }
              >
                Kalkulator ROI
              </NavLink>
              <NavLink 
                to="/investment" 
                className={({ isActive }) => 
                  isActive 
                    ? "px-3 py-2 rounded-md bg-brand-green text-white" 
                    : "px-3 py-2 rounded-md text-blue-100 hover:bg-brand-green hover:text-white transition-colors"
                }
              >
                Kalkulator Inwestycji
              </NavLink>
              <NavLink 
                to="/rental-value" 
                className={({ isActive }) => 
                  isActive 
                    ? "px-3 py-2 rounded-md bg-brand-green text-white" 
                    : "px-3 py-2 rounded-md text-blue-100 hover:bg-brand-green hover:text-white transition-colors"
                }
              >
                Wartość z Najmu
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* Główna zawartość */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Stopka */}
      <footer className="bg-brand-darkblue text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Kalkulator Finansowy Nieruchomości</h3>
              <p className="text-blue-200">Profesjonalne narzędzie do analizy inwestycji w nieruchomości.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Przydatne linki</h3>
              <ul className="space-y-2">
                <li><Link to="/roi" className="text-blue-200 hover:text-white">Kalkulator ROI</Link></li>
                <li><Link to="/investment" className="text-blue-200 hover:text-white">Kalkulator Inwestycji</Link></li>
                <li><Link to="/rental-value" className="text-blue-200 hover:text-white">Wartość z Najmu</Link></li>
                <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-blue-200 hover:text-white bg-transparent border-0 p-0 cursor-pointer">Wróć na górę</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
              <p className="text-blue-200">Masz pytania? Skontaktuj się z nami.</p>
              
              {/* Ikony mediów społecznościowych */}
              <div className="flex space-x-4 mt-3 mb-4">
                <a 
                  href="https://facebook.com/kalkulatornieruchomosci" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-brand-green transition-colors"
                  aria-label="Facebook"
                >
                  <svg 
                    className="w-6 h-6" 
                    fill="currentColor" 
                    viewBox="0 0 24 24" 
                    aria-hidden="true"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </a>
                <a 
                  href="https://linkedin.com/company/kalkulatornieruchomosci" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-brand-green transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg 
                    className="w-6 h-6" 
                    fill="currentColor" 
                    viewBox="0 0 24 24" 
                    aria-hidden="true"
                  >
                    <path 
                      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                    />
                  </svg>
                </a>
              </div>
              
              <button 
                onClick={() => setShowDonationModal(true)}
                className="px-4 py-2 bg-brand-green text-white rounded hover:bg-brand-darkgreen transition-colors duration-300"
              >
                Wesprzyj projekt
              </button>
            </div>
          </div>
          <div className="border-t border-blue-900 mt-8 pt-8 text-center text-blue-200">
            <p>&copy; {new Date().getFullYear()} Kalkulator Finansowy Nieruchomości. Wszelkie prawa zastrzeżone.</p>
            <p className="mt-2 text-sm">
              <Link to="/polityka-prywatnosci" className="text-blue-200 hover:text-white">Polityka prywatności</Link>
            </p>
          </div>
        </div>
      </footer>

      {/* Modal donacji */}
      {showDonationModal && (
        <DonationModal onClose={() => setShowDonationModal(false)} />
      )}
      
      {/* Informacja o cookies */}
      <CookieConsent />
    </div>
  );
};

export default Layout; 