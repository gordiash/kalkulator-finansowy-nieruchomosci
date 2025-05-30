'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Do sprawdzania aktywnej ścieżki
// import DonationModal from './DonationModal'; // Zakładam, że ten komponent istnieje lub zostanie utworzony

// Przykładowa prosta implementacja DonationModal, jeśli nie istnieje
const DonationModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl">
      <h2 className="text-xl font-semibold mb-4">Wesprzyj projekt</h2>
      <p className="mb-4">Dziękujemy za chęć wsparcia! Możesz to zrobić poprzez...</p>
      <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Zamknij
      </button>
    </div>
  </div>
);


const MainNavigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const pathname = usePathname(); // Hook do pobrania aktualnej ścieżki

  // Definicje klas dla linków (można przenieść do stałych, jeśli preferowane)
  const getLinkClass = (path: string, isMobile?: boolean) => {
    const isActive = pathname === path;
    if (isMobile) {
      return isActive 
        ? "block text-white bg-blue-600 px-3 py-2 rounded-md font-medium"
        : "block text-blue-100 hover:text-white px-3 py-2 hover:bg-blue-600/50 rounded-md transition duration-200";
    }
    return isActive
      ? "text-white bg-blue-600 px-3 py-2 rounded-md font-medium"
      : "text-blue-100 hover:text-white px-3 py-2 hover:bg-blue-600/50 rounded-md transition duration-200";
  };

  const getSubLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-800 ${isActive ? 'bg-indigo-50 text-indigo-800 font-medium' : ''}`;
  };

  const menuItems = [
    { path: "/", label: "Strona główna" },
    { 
      label: "Kalkulatory",
      // Sprawdzenie, czy któraś ze ścieżek podrzędnych jest aktywna, aby podświetlić główny element menu
      isActiveDetector: () => ["/kalkulator-roi", "/kalkulator-inwestycji", "/kalkulator-wartosci-najmu"].some(p => pathname === p),
      children: [
        { path: "/kalkulator-roi", label: "Kalkulator ROI" },
        { path: "/kalkulator-inwestycji", label: "Kalkulator Inwestycji" },
        { path: "/kalkulator-wartosci-najmu", label: "Wartość z Najmu" }
      ]
    },
    { path: "/ceny-nieruchomosci", label: "Ceny Nieruchomości" },
    { path: "/o-nas", label: "O nas" }
  ];

  // Zamykanie menu mobilnego po kliknięciu w link
  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [pathname, isMenuOpen]); // Dodano isMenuOpen do dependency array, aby uniknąć warningu i potencjalnych problemów

  return (
    <header className="bg-gradient-to-r from-indigo-800 to-blue-700 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-white font-bold text-xl md:text-2xl hover:text-blue-100 transition-colors duration-200">
            Kalkulator Finansowy Nieruchomości
          </Link>
          
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

          <nav className="hidden md:flex items-center space-x-1">
            {menuItems.map((item, index) => 
              item.children ? (
                <div key={index} className="relative group">
                  <button className={`text-blue-100 hover:text-white px-3 py-2 hover:bg-blue-600/50 rounded-md transition duration-200 flex items-center ${item.isActiveDetector && item.isActiveDetector() ? 'text-white bg-blue-600' : ''}`}>
                    {item.label}
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-20">
                    {item.children.map((subItem, subIndex) => (
                      <Link 
                        key={subIndex}
                        href={subItem.path}
                        className={getSubLinkClass(subItem.path)}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link 
                  key={index}
                  href={item.path} 
                  className={getLinkClass(item.path)}
                >
                  {item.label}
                </Link>
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
        
        <div className={`mt-4 pb-2 md:hidden transform transition-all duration-300 ${isMenuOpen ? 'max-h-[calc(100vh-100px)] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <nav className="space-y-1">
            {menuItems.map((item, index) => 
              item.children ? (
                <div key={index} className="space-y-1">
                  <div className={`font-medium px-3 py-2 ${item.isActiveDetector && item.isActiveDetector() ? 'text-white' : 'text-blue-200'}`}>
                    {item.label}
                  </div>
                  <div className="pl-4 space-y-1 border-l-2 border-blue-500 ml-3">
                    {item.children.map((subItem, subIndex) => (
                      <Link 
                        key={subIndex}
                        href={subItem.path}
                        className={getLinkClass(subItem.path, true)}
                        onClick={() => setIsMenuOpen(false)} // Zamykanie menu po kliknięciu
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link 
                  key={index}
                  href={item.path} 
                  className={getLinkClass(item.path, true)}
                  onClick={() => setIsMenuOpen(false)} // Zamykanie menu po kliknięciu
                >
                  {item.label}
                </Link>
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
      {showDonationModal && (
        <DonationModal onClose={() => setShowDonationModal(false)} />
      )}
    </header>
  );
};

export default MainNavigation; 