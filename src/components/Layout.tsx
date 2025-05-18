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

  // Klasa dla aktywnego linku w menu
  const activeLinkClass = "text-white bg-blue-600 px-3 py-2 rounded-md font-medium";
  // Klasa dla nieaktywnego linku w menu
  const inactiveLinkClass = "text-blue-100 hover:text-white px-3 py-2 hover:bg-blue-600/50 rounded-md transition duration-200";
  // Klasa dla aktywnego linku w menu mobilnym
  const activeMobileLinkClass = "block text-white bg-blue-600 px-3 py-2 rounded-md font-medium";
  // Klasa dla nieaktywnego linku w menu mobilnym
  const inactiveMobileLinkClass = "block text-blue-100 hover:text-white px-3 py-2 hover:bg-blue-600/50 rounded-md transition duration-200";

  // Struktura menu - ułatwia dodawanie nowych elementów i utrzymanie spójności
  const menuItems = [
    { path: "/", label: "Strona główna" },
    { 
      label: "Kalkulatory",
      children: [
        { path: "/kalkulator-roi", label: "Kalkulator ROI" },
        { path: "/kalkulator-inwestycji", label: "Kalkulator Inwestycji" },
        { path: "/kalkulator-wartosci-najmu", label: "Wartość z Najmu" }
      ]
    },
    { path: "/ceny-nieruchomosci", label: "Ceny Nieruchomości" },
    { path: "/o-nas", label: "O nas" }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gradient-to-r from-indigo-800 to-blue-700 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-white font-bold text-xl md:text-2xl hover:text-blue-100 transition-colors duration-200">
              Kalkulator Finansowy Nieruchomości
            </Link>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-white focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Zamknij menu" : "Otwórz menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {menuItems.map((item, index) => 
                item.children ? (
                  <div key={index} className="relative group">
                    <button className={`${inactiveLinkClass} flex items-center`}>
                      {item.label}
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left">
                      {item.children.map((subItem, subIndex) => (
                        <NavLink 
                          key={subIndex}
                          to={subItem.path}
                          className={({ isActive }) => 
                            `block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-800 ${isActive ? 'bg-indigo-50 text-indigo-800 font-medium' : ''}`
                          }
                        >
                          {subItem.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ) : (
                  <NavLink 
                    key={index}
                    to={item.path} 
                    className={({ isActive }) => 
                      isActive ? activeLinkClass : inactiveLinkClass
                    }
                  >
                    {item.label}
                  </NavLink>
                )
              )}
              <button 
                onClick={() => setShowDonationModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md ml-2 transition duration-200"
              >
                Wesprzyj projekt
              </button>
            </nav>
          </div>
          
          {/* Mobile Navigation */}
          <div className={`mt-4 pb-2 md:hidden transform transition-all duration-300 ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <nav className="space-y-1">
              {menuItems.map((item, index) => 
                item.children ? (
                  <div key={index} className="space-y-1">
                    <div className="text-white font-medium px-3 py-2">
                      {item.label}
                    </div>
                    <div className="pl-4 space-y-1 border-l-2 border-blue-500 ml-3">
                      {item.children.map((subItem, subIndex) => (
                        <NavLink 
                          key={subIndex}
                          to={subItem.path}
                          className={({ isActive }) => 
                            isActive ? activeMobileLinkClass : inactiveMobileLinkClass
                          }
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {subItem.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ) : (
                  <NavLink 
                    key={index}
                    to={item.path} 
                    className={({ isActive }) => 
                      isActive ? activeMobileLinkClass : inactiveMobileLinkClass
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                )
              )}
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowDonationModal(true);
                }}
                className="w-full text-left bg-blue-500 text-white px-3 py-2 rounded-md mt-2 hover:bg-blue-600 transition duration-200"
              >
                Wesprzyj projekt
              </button>
            </nav>
          </div>
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
            <div className="flex flex-wrap justify-center space-x-4">
              <Link to="/o-nas" className="text-sm hover:text-white transition duration-200">O nas</Link>
              <Link to="/polityka-prywatnosci" className="text-sm hover:text-white transition duration-200">Polityka prywatności</Link>
              <Link to="/regulamin" className="text-sm hover:text-white transition duration-200">Regulamin</Link>
              <button 
                onClick={() => setShowDonationModal(true)}
                className="text-sm hover:text-white transition duration-200"
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