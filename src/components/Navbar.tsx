'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      setIsLoggedIn(!!token);
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    checkAuth();
    handleScroll();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('auth-change', checkAuth);
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-slate-900/98 backdrop-blur-xl shadow-2xl border-b border-slate-700/50' 
        : 'bg-gradient-to-r from-slate-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-md'
    }`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-lg sm:text-xl lg:text-2xl font-black text-white hover:text-blue-400 transition-all duration-300 flex items-center space-x-2" 
            prefetch={true}
          >
            <Image
              src="/icon-192.png"
              alt="Kalkulatory Nieruchomości – logo"
              width={32}
              height={32}
              priority
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg shadow-sm"
            />
            <span className="hidden sm:inline">Kalkulatory Nieruchomości</span>
            <span className="sm:hidden">KN</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Dropdown Kalkulatory */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-slate-300 hover:text-blue-400 transition-all duration-300 font-medium px-4 py-2 rounded-xl hover:bg-slate-800/50 hover:shadow-md hover:scale-105"
              >
                <span>Kalkulatory</span>
                <svg className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Enhanced Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-3 w-80 bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 py-4 z-50">
                  {/* Main Feature */}
                  <div className="px-6 py-3 border-b border-slate-700/50">
                    <Link 
                      href="/kalkulator-wyceny" 
                      className="flex items-center space-x-3 hover:bg-slate-700/50 rounded-lg p-2 transition-all duration-300 hover:scale-105"
                      onClick={() => setIsDropdownOpen(false)}
                      prefetch={true}
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">💰</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Wycena AI</h3>
                        <p className="text-sm text-slate-400">Dokładność 0.79% MAPE</p>
                      </div>
                    </Link>
                  </div>
                  
                  {/* Category: Kalkulacje finansowe */}
                  <div className="px-6 py-2">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Analiza inwestycji</p>
                    <Link 
                      href="/kalkulator-zakupu-nieruchomosci" 
                      className="flex items-center space-x-3 px-3 py-2 text-slate-300 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-all duration-300 hover:shadow-sm hover:scale-105"
                      onClick={() => setIsDropdownOpen(false)}
                      prefetch={true}
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-xs">🏠</span>
                      </div>
                      <div>
                        <span className="font-medium">Zakup Nieruchomości</span>
                        <p className="text-xs text-slate-400">Analiza opłacalności zakupu</p>
                      </div>
                    </Link>
                    <Link 
                      href="/kalkulator-wynajmu" 
                      className="flex items-center space-x-3 px-3 py-2 text-slate-300 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-all duration-300 hover:shadow-sm hover:scale-105"
                      onClick={() => setIsDropdownOpen(false)}
                      prefetch={true}
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-xs">📊</span>
                      </div>
                      <div>
                        <span className="font-medium">Rentowność Wynajmu</span>
                        <p className="text-xs text-slate-400">Analiza ROI i cash flow</p>
                      </div>
                    </Link>
                    <Link 
                      href="/kalkulator-flipera" 
                      className="flex items-center space-x-3 px-3 py-2 text-slate-300 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-all duration-300 hover:shadow-sm hover:scale-105"
                      onClick={() => setIsDropdownOpen(false)}
                      prefetch={true}
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-xs">🔄</span>
                      </div>
                      <div>
                        <span className="font-medium">Kalkulator Flipera</span>
                        <p className="text-xs text-slate-400">Analiza opłacalności flipa</p>
                      </div>
                    </Link>
                    <Link 
                      href="/kalkulator-zdolnosci-kredytowej" 
                      className="flex items-center space-x-3 px-3 py-2 text-slate-300 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-all duration-300 hover:shadow-sm hover:scale-105"
                      onClick={() => setIsDropdownOpen(false)}
                      prefetch={true}
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-xs">💳</span>
                      </div>
                      <div>
                        <span className="font-medium">Zdolność Kredytowa</span>
                        <p className="text-xs text-slate-400">Sprawdź swoją zdolność</p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Other Navigation Links */}
            <Link 
              href="/blog" 
              className="text-slate-300 hover:text-blue-400 transition-all duration-300 font-medium px-4 py-2 rounded-xl hover:bg-slate-800/50 hover:shadow-md hover:scale-105"
              prefetch={true}
            >
              Blog
            </Link>
            
            <a 
              href="https://suppi.pl/kalkulatorynieruchomosci" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-blue-400 transition-all duration-300 font-medium px-4 py-2 rounded-xl hover:bg-slate-800/50 hover:shadow-md hover:scale-105"
            >
              Wesprzyj projekt
            </a>

            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/panel/kalkulacje" 
                  className="text-slate-300 hover:text-blue-400 transition-all duration-300 font-medium px-4 py-2 rounded-xl hover:bg-slate-800/50 hover:shadow-md hover:scale-105 flex items-center space-x-2"
                  prefetch={true}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Panel</span>
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem('auth_token');
                    setIsLoggedIn(false);
                    window.dispatchEvent(new Event('auth-change'));
                    router.push('/');
                  }}
                  className="text-slate-300 hover:text-red-400 transition-all duration-300 font-medium px-4 py-2 rounded-xl hover:bg-red-900/20 hover:shadow-md hover:scale-105"
                >
                  Wyloguj
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/logowanie" 
                  className="text-slate-300 hover:text-blue-400 transition-all duration-300 font-medium px-4 py-2 rounded-xl hover:bg-slate-800/50 hover:shadow-md hover:scale-105"
                  prefetch={true}
                >
                  Zaloguj się
                </Link>
                <Link 
                  href="/rejestracja" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-6 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform hover:-translate-y-0.5"
                  prefetch={true}
                >
                  Zarejestruj się
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="relative w-10 h-10 sm:w-12 sm:h-12 text-slate-300 hover:text-blue-400 focus:outline-none transition-all duration-300 rounded-xl hover:bg-slate-800/50 hover:shadow-md hover:scale-105 flex items-center justify-center" 
              aria-label="Toggle menu"
            >
              <div className="relative w-5 h-5 sm:w-6 sm:h-6">
                <span className={`absolute top-0 left-0 w-5 h-0.5 sm:w-6 sm:h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`absolute top-2 left-0 w-5 h-0.5 sm:w-6 sm:h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`absolute top-4 left-0 w-5 h-0.5 sm:w-6 sm:h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100 visible' : 'max-h-0 opacity-0 invisible'} z-50`}>
          <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-4 sm:pb-6 space-y-3 sm:space-y-4 border-t border-slate-700/50 bg-gradient-to-b from-slate-900/95 to-blue-900/95 backdrop-blur-xl rounded-b-3xl shadow-2xl relative z-50">
            <div className="space-y-2">
              <div className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wide">Kalkulatory</div>
              <Link 
                href="/kalkulator-wyceny" 
                className="flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-xl transition-all duration-300 font-medium hover:shadow-md hover:scale-105"
                onClick={() => setIsMenuOpen(false)}
                prefetch={true}
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm">💰</span>
                </div>
                <div>
                  <span className="text-sm sm:text-base">Wycena AI</span>
                  <p className="text-xs text-slate-400">Dokładność 0.79% MAPE</p>
                </div>
              </Link>
              <Link 
                href="/kalkulator-zakupu-nieruchomosci" 
                className="flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-xl transition-all duration-300 font-medium hover:shadow-md hover:scale-105"
                onClick={() => setIsMenuOpen(false)}
                prefetch={true}
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm">🏠</span>
                </div>
                <div>
                  <span className="text-sm sm:text-base">Zakup Nieruchomości</span>
                  <p className="text-xs text-slate-400">Analiza opłacalności zakupu</p>
                </div>
              </Link>
              <Link 
                href="/kalkulator-wynajmu" 
                className="flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-xl transition-all duration-300 font-medium hover:shadow-md hover:scale-105"
                onClick={() => setIsMenuOpen(false)}
                prefetch={true}
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm">📊</span>
                </div>
                <div>
                  <span className="text-sm sm:text-base">Rentowność Wynajmu</span>
                  <p className="text-xs text-slate-400">Analiza ROI i cash flow</p>
                </div>
              </Link>
              <Link 
                href="/kalkulator-flipera" 
                className="flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-xl transition-all duration-300 font-medium hover:shadow-md hover:scale-105"
                onClick={() => setIsMenuOpen(false)}
                prefetch={true}
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm">🔄</span>
                </div>
                <div>
                  <span className="text-sm sm:text-base">Kalkulator Flipera</span>
                  <p className="text-xs text-slate-400">Analiza opłacalności flipa</p>
                </div>
              </Link>
              <Link 
                href="/kalkulator-zdolnosci-kredytowej" 
                className="flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-xl transition-all duration-300 font-medium hover:shadow-md hover:scale-105"
                onClick={() => setIsMenuOpen(false)}
                prefetch={true}
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm">💳</span>
                </div>
                <div>
                  <span className="text-sm sm:text-base">Zdolność Kredytowa</span>
                  <p className="text-xs text-slate-400">Sprawdź swoją zdolność</p>
                </div>
              </Link>
            </div>
            
            <div className="space-y-2 pt-3 sm:pt-4 border-t border-slate-700/50">
              <Link 
                href="/blog" 
                className="block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-xl transition-all duration-300 font-medium hover:shadow-md hover:scale-105"
                onClick={() => setIsMenuOpen(false)}
                prefetch={true}
              >
                Blog
              </Link>
              <a 
                href="https://suppi.pl/kalkulatorynieruchomosci" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-xl transition-all duration-300 font-medium hover:shadow-md hover:scale-105"
                onClick={() => setIsMenuOpen(false)}
              >
                Wesprzyj projekt
              </a>
              {isLoggedIn ? (
                <>
                  <Link 
                    href="/panel/kalkulacje" 
                    className="block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-xl transition-all duration-300 font-medium hover:shadow-md hover:scale-105 flex items-center space-x-3"
                    onClick={() => setIsMenuOpen(false)}
                    prefetch={true}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Panel</span>
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem('auth_token');
                      setIsLoggedIn(false);
                      window.dispatchEvent(new Event('auth-change'));
                      router.push('/');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-slate-300 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-all duration-300 font-medium hover:shadow-md hover:scale-105"
                  >
                    Wyloguj
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/logowanie" 
                    className="block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-xl transition-all duration-300 font-medium hover:shadow-md hover:scale-105"
                    onClick={() => setIsMenuOpen(false)}
                    prefetch={true}
                  >
                    Zaloguj się
                  </Link>
                  <Link 
                    href="/rejestracja" 
                    className="block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 font-medium text-center hover:shadow-xl hover:scale-105"
                    onClick={() => setIsMenuOpen(false)}
                    prefetch={true}
                  >
                    Zarejestruj się
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 