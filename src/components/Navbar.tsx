'use client';

import Link from 'next/link';
import { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300" prefetch={true}>
            🏠 Kalkulatory Nieruchomości
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/kalkulator-zakupu-nieruchomosci" 
              className="relative text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium group"
              prefetch={true}
            >
              <span className="relative z-10">Zakup Nieruchomości</span>
              <div className="absolute inset-0 bg-blue-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 -z-10"></div>
            </Link>
            <Link 
              href="/kalkulator-wynajmu" 
              className="relative text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium group px-3 py-2"
              prefetch={true}
            >
              <span className="relative z-10">Opłacalność Wynajmu</span>
              <div className="absolute inset-0 bg-blue-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 -z-10"></div>
            </Link>
            <Link 
              href="/kalkulator-zdolnosci-kredytowej" 
              className="relative text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium group px-3 py-2"
              prefetch={true}
            >
              <span className="relative z-10">Zdolność Kredytowa</span>
              <div className="absolute inset-0 bg-blue-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 -z-10"></div>
            </Link>
            <Link 
              href="/blog" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 border border-blue-500/20"
              prefetch={true}
            >
              <span className="flex items-center gap-2">
                📝 <span>Blog</span>
              </span>
            </Link>
            <a 
              href="https://suppi.pl/kalkulatorynieruchomosci" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              <span className="flex items-center gap-2">
                ☕ <span>Wesprzyj projekt</span>
              </span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative w-10 h-10 text-gray-600 hover:text-blue-600 focus:outline-none transition-colors duration-300 rounded-lg hover:bg-blue-50"
            >
              <svg className="w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="md:hidden animate-in slide-in-from-top duration-300">
            <div className="px-4 pt-4 pb-6 space-y-3 border-t border-gray-200/50 bg-gradient-to-b from-white to-gray-50/50 backdrop-blur-sm">
              <Link 
                href="/kalkulator-zakupu-nieruchomosci" 
                className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
                prefetch={true}
              >
                🏠 Zakup Nieruchomości
              </Link>
              <Link 
                href="/kalkulator-wynajmu" 
                className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
                prefetch={true}
              >
                📈 Opłacalność Wynajmu
              </Link>
              <Link 
                href="/kalkulator-zdolnosci-kredytowej" 
                className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
                prefetch={true}
              >
                💳 Zdolność Kredytowa
              </Link>
              <div className="pt-2">
                <Link 
                  href="/blog" 
                  className="block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold text-center shadow-lg"
                  onClick={() => setIsMenuOpen(false)}
                  prefetch={true}
                >
                  📝 Blog
                </Link>
              </div>
              <div className="pt-1">
                <a 
                  href="https://suppi.pl/kalkulatorynieruchomosci" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold text-center shadow-lg"
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