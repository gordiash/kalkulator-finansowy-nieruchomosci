import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import DonationModal from './DonationModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showDonationModal, setShowDonationModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 text-gray-800 font-sans flex flex-col">
      {/* Nagłówek nawigacyjny */}
      <nav className="bg-gradient-to-r from-indigo-800 to-blue-700 text-white py-4 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Link to="/" className="text-xl font-bold mb-3 md:mb-0">Kalkulator Finansowy Nieruchomości</Link>
            <div className="flex space-x-4">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  isActive 
                    ? "px-3 py-2 rounded-md bg-indigo-600 text-white" 
                    : "px-3 py-2 rounded-md text-blue-100 hover:bg-indigo-600 hover:text-white transition-colors"
                }
                end
              >
                Strona główna
              </NavLink>
              <NavLink 
                to="/roi" 
                className={({ isActive }) => 
                  isActive 
                    ? "px-3 py-2 rounded-md bg-indigo-600 text-white" 
                    : "px-3 py-2 rounded-md text-blue-100 hover:bg-indigo-600 hover:text-white transition-colors"
                }
              >
                Kalkulator ROI
              </NavLink>
              <NavLink 
                to="/investment" 
                className={({ isActive }) => 
                  isActive 
                    ? "px-3 py-2 rounded-md bg-indigo-600 text-white" 
                    : "px-3 py-2 rounded-md text-blue-100 hover:bg-indigo-600 hover:text-white transition-colors"
                }
              >
                Kalkulator Inwestycji
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
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Kalkulator Finansowy Nieruchomości</h3>
              <p className="text-gray-400">Profesjonalne narzędzie do analizy inwestycji w nieruchomości.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Przydatne linki</h3>
              <ul className="space-y-2">
                <li><Link to="/roi" className="text-gray-400 hover:text-white">Kalkulator ROI</Link></li>
                <li><Link to="/investment" className="text-gray-400 hover:text-white">Kalkulator Inwestycji</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
              <p className="text-gray-400">Masz pytania? Skontaktuj się z nami.</p>
              <button 
                onClick={() => setShowDonationModal(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition-colors duration-300"
              >
                Wesprzyj projekt
              </button>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Kalkulator Finansowy Nieruchomości. Wszelkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>

      {/* Modal donacji */}
      {showDonationModal && (
        <DonationModal onClose={() => setShowDonationModal(false)} />
      )}
    </div>
  );
};

export default Layout; 