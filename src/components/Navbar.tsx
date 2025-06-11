'use client';

import Link from 'next/link';
import { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-xl font-bold text-gray-800">
            Kalkulatory Nieruchomości
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/kalkulator-zakupu-nieruchomosci" className="text-gray-600 hover:text-blue-600 transition-colors">
              Zakup Nieruchomości
            </Link>
            <Link href="/kalkulator-wynajmu" className="text-gray-600 hover:text-blue-600 transition-colors">
              Opłacalność Wynajmu
            </Link>
            <Link href="/kalkulator-zdolnosci-kredytowej" className="text-gray-600 hover:text-blue-600 transition-colors">
              Zdolność Kredytowa
            </Link>
            <a 
              href="https://suppi.pl/kalkulatorynieruchomosci" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              ☕ Wesprzyj projekt
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-800 focus:outline-none focus:text-gray-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
              <Link 
                href="/kalkulator-zakupu-nieruchomosci" 
                className="block px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Zakup Nieruchomości
              </Link>
              <Link 
                href="/kalkulator-wynajmu" 
                className="block px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Opłacalność Wynajmu
              </Link>
              <Link 
                href="/kalkulator-zdolnosci-kredytowej" 
                className="block px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Zdolność Kredytowa
              </Link>
              <div className="px-3 py-2">
                <a 
                  href="https://suppi.pl/kalkulatorynieruchomosci" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-center"
                >
                  ☕ Wesprzyj projekt
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 