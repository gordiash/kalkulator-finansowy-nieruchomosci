import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import DonationModal from './DonationModal';
import CookieConsent from './CookieConsent';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gradient-to-r from-indigo-800 to-blue-700 shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-white font-bold text-xl md:text-2xl hover:text-blue-100 transition-colors duration-200">
              Kalkulator Finansowy Nieruchomości
            </Link>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-white focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-4">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  isActive ? "text-white bg-blue-600 px-3 py-2 rounded-md" : "text-blue-100 hover:text-white px-3 py-2"
                }
              >
                Strona główna
              </NavLink>
              <NavLink 
                to="/kalkulator-roi" 
                className={({ isActive }) => 
                  isActive ? "text-white bg-blue-600 px-3 py-2 rounded-md" : "text-blue-100 hover:text-white px-3 py-2"
                }
              >
                Kalkulator ROI
              </NavLink>
              <NavLink 
                to="/kalkulator-inwestycji" 
                className={({ isActive }) => 
                  isActive ? "text-white bg-blue-600 px-3 py-2 rounded-md" : "text-blue-100 hover:text-white px-3 py-2"
                }
              >
                Kalkulator Inwestycji
              </NavLink>
              <NavLink 
                to="/kalkulator-wartosci-najmu" 
                className={({ isActive }) => 
                  isActive ? "text-white bg-blue-600 px-3 py-2 rounded-md" : "text-blue-100 hover:text-white px-3 py-2"
                }
              >
                Wartość z Najmu
              </NavLink>
              <button 
                onClick={() => setShowDonationModal(true)}
                className="text-blue-100 hover:text-white px-3 py-2 hover:bg-blue-600 rounded-md"
              >
                Wesprzyj projekt
              </button>
            </nav>
          </div>
          
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="mt-4 pb-4 space-y-2 md:hidden">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  isActive ? "block text-white bg-blue-600 px-3 py-2 rounded-md" : "block text-blue-100 hover:text-white px-3 py-2 hover:bg-blue-600 rounded-md"
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Strona główna
              </NavLink>
              <NavLink 
                to="/kalkulator-roi" 
                className={({ isActive }) => 
                  isActive ? "block text-white bg-blue-600 px-3 py-2 rounded-md" : "block text-blue-100 hover:text-white px-3 py-2 hover:bg-blue-600 rounded-md"
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Kalkulator ROI
              </NavLink>
              <NavLink 
                to="/kalkulator-inwestycji" 
                className={({ isActive }) => 
                  isActive ? "block text-white bg-blue-600 px-3 py-2 rounded-md" : "block text-blue-100 hover:text-white px-3 py-2 hover:bg-blue-600 rounded-md"
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Kalkulator Inwestycji
              </NavLink>
              <NavLink 
                to="/kalkulator-wartosci-najmu" 
                className={({ isActive }) => 
                  isActive ? "block text-white bg-blue-600 px-3 py-2 rounded-md" : "block text-blue-100 hover:text-white px-3 py-2 hover:bg-blue-600 rounded-md"
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Wartość z Najmu
              </NavLink>
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowDonationModal(true);
                }}
                className="block text-blue-100 hover:text-white px-3 py-2 hover:bg-blue-600 rounded-md w-full text-left"
              >
                Wesprzyj projekt
              </button>
            </nav>
          )}
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-gray-800 text-gray-300 py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">&copy; {new Date().getFullYear()} Kalkulator Finansowy Nieruchomości. Wszystkie prawa zastrzeżone.</p>
            </div>
            <div className="flex space-x-4">
              <Link to="/polityka-prywatnosci" className="text-sm hover:text-white">Polityka prywatności</Link>
              <Link to="/regulamin" className="text-sm hover:text-white">Regulamin</Link>
              <Link to="/o-nas" className="text-sm hover:text-white">O nas</Link>
              <button 
                onClick={() => setShowDonationModal(true)}
                className="text-sm hover:text-white"
              >
                Wesprzyj projekt
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Donation Modal */}
      {showDonationModal && (
        <DonationModal onClose={() => setShowDonationModal(false)} />
      )}

      {/* Cookie Consent */}
      <CookieConsent />
    </div>
  );
};

export default Layout; 