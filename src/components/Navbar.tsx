'use client';
import Link from 'next/link';
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
        ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-gray-200/30' 
        : 'bg-gradient-to-r from-pink-50/90 via-purple-50/90 to-indigo-50/90 backdrop-blur-md'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-5">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-2xl font-black text-gray-800 hover:text-purple-600 transition-all duration-300 flex items-center space-x-2" 
            prefetch={true}
          >
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🏠</span>
            </div>
            <span>Kalkulatory Nieruchomości</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Dropdown Kalkulatory */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium px-4 py-2 rounded-xl hover:bg-purple-100 hover:shadow-md hover:scale-105"
              >
                <span>Kalkulatory</span>
                <svg className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Enhanced Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200/50 py-4 z-50 backdrop-blur-xl">
                  {/* Main Feature */}
                  <div className="px-6 py-3 border-b border-gray-100">
                    <Link 
                      href="/kalkulator-wyceny" 
                      className="flex items-center space-x-3 hover:bg-purple-50 rounded-lg p-2 transition-all duration-300 hover:scale-105"
                      onClick={() => setIsDropdownOpen(false)}
                      prefetch={true}
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">💰</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Kalkulator wyceny</h3>
                        <p className="text-sm text-gray-500">Profesjonalna wycena nieruchomości</p>
                      </div>
                    </Link>
                  </div>
                  
                  {/* Category: Kalkulacje finansowe */}
                  <div className="px-6 py-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Kalkulacje finansowe</p>
                    <Link 
                      href="/kalkulator-zakupu-nieruchomosci" 
                      className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-all duration-300 hover:shadow-sm hover:scale-105"
                      onClick={() => setIsDropdownOpen(false)}
                      prefetch={true}
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-xs">🏠</span>
                      </div>
                      <div>
                        <span className="font-medium">Zakup Nieruchomości</span>
                        <p className="text-xs text-gray-500">Analiza opłacalności zakupu</p>
                      </div>
                    </Link>
                    <Link 
                      href="/kalkulator-wynajmu" 
                      className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-all duration-300 hover:shadow-sm hover:scale-105"
                      onClick={() => setIsDropdownOpen(false)}
                      prefetch={true}
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-xs">📊</span>
                      </div>
                      <div>
                        <span className="font-medium">Opłacalność Wynajmu</span>
                        <p className="text-xs text-gray-500">Analiza rentowności wynajmu</p>
                      </div>
                    </Link>
                    <Link 
                      href="/kalkulator-zdolnosci-kredytowej" 
                      className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-all duration-300 hover:shadow-sm hover:scale-105"
                      onClick={() => setIsDropdownOpen(false)}
                      prefetch={true}
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-xs">💳</span>
                      </div>
                      <div>
                        <span className="font-medium">Zdolność Kredytowa</span>
                        <p className="text-xs text-gray-500">Sprawdź swoją zdolność kredytową</p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Other Navigation Links */}
            <Link 
              href="/blog" 
              className="text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium px-4 py-2 rounded-xl hover:bg-purple-100 hover:shadow-md hover:scale-105"
              prefetch={true}
            >
              Blog
            </Link>
            
            <a 
              href="https://suppi.pl/kalkulatorynieruchomosci" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium px-4 py-2 rounded-xl hover:bg-purple-100 hover:shadow-md hover:scale-105"
            >
              Wesprzyj projekt
            </a>

            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/panel" 
                  className="text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium px-4 py-2 rounded-xl hover:bg-purple-100 hover:shadow-md hover:scale-105 flex items-center space-x-2"
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
                  className="text-gray-700 hover:text-red-600 transition-all duration-300 font-medium px-4 py-2 rounded-xl hover:bg-red-100 hover:shadow-md hover:scale-105"
                >
                  Wyloguj
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/logowanie" 
                  className="text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium px-4 py-2 rounded-xl hover:bg-purple-100 hover:shadow-md hover:scale-105"
                  prefetch={true}
                >
                  Zaloguj się
                </Link>
                <Link 
                  href="/rejestracja" 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium px-6 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform hover:-translate-y-0.5"
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
              className="relative w-12 h-12 text-gray-600 hover:text-purple-600 focus:outline-none transition-all duration-300 rounded-xl hover:bg-purple-100 hover:shadow-md hover:scale-105 flex items-center justify-center" 
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <span className={`absolute top-0 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`absolute top-2 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`absolute top-4 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}>
          <div className="px-4 pt-4 pb-6 space-y-4 border-t border-gray-200/50 bg-gradient-to-b from-white/95 to-purple-50/95 backdrop-blur-xl rounded-b-3xl shadow-2xl">
            <div className="space-y-2">
              <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">Kalkulatory</div>
              <Link 
                href="/kalkulator-wyceny" 
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-100 rounded-xl transition-all duration-300 font-medium hover:shadow-md hover:scale-105"
                onClick={() => setIsMenuOpen(false)}
                prefetch={true}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">💰</span>
                </div>
                <div>
                  <span>Kalkulator wyceny</span>
                  <p className="text-xs text-gray-500">Profesjonalna wycena nieruchomości</p>
                </div>
              </Link>
              <Link 
                href="/kalkulator-zakupu-nieruchomosci" 
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-100 rounded-xl transition-all duration-300 font-medium hover:shadow-md hover:scale-105"
                onClick={() => setIsMenuOpen(false)}
                prefetch={true}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🏠</span>
                </div>
                <div>
                  <span>Zakup Nieruchomości</span>
                  <p className="text-xs text-gray-500">Analiza opłacalności zakupu</p>
                </div>
              </Link>
              <Link 
                href="/kalkulator-wynajmu" 
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-100 rounded-xl transition-all duration-300 font-medium hover:shadow-md hover:scale-105"
                onClick={() => setIsMenuOpen(false)}
                prefetch={true}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📊</span>
                </div>
                <div>
                  <span>Opłacalność Wynajmu</span>
                  <p className="text-xs text-gray-500">Analiza rentowności wynajmu</p>
                </div>
              </Link>
              <Link 
                href="/kalkulator-zdolnosci-kredytowej" 
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-100 rounded-xl transition-all duration-300 font-medium hover:shadow-md hover:scale-105"
                onClick={() => setIsMenuOpen(false)}
                prefetch={true}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">💳</span>
                </div>
                <div>
                  <span>Zdolność Kredytowa</span>
                  <p className="text-xs text-gray-500">Sprawdź swoją zdolność kredytową</p>
                </div>
              </Link>
            </div>
            
            <div className="space-y-2 pt-4 border-t border-gray-200/50">
              <Link 
                href="/blog" 
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-100 rounded-xl transition-all duration-300 font-medium hover:shadow-md hover:scale-105"
                onClick={() => setIsMenuOpen(false)}
                prefetch={true}
              >
                Blog
              </Link>
              <a 
                href="https://suppi.pl/kalkulatorynieruchomosci" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-100 rounded-xl transition-all duration-300 font-medium hover:shadow-md hover:scale-105"
                onClick={() => setIsMenuOpen(false)}
              >
                Wesprzyj projekt
              </a>
              {isLoggedIn ? (
                <>
                  <Link 
                    href="/panel" 
                    className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-100 rounded-xl transition-all duration-300 font-medium hover:shadow-md hover:scale-105 flex items-center space-x-3"
                    onClick={() => setIsMenuOpen(false)}
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
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all duration-300 font-medium hover:shadow-md hover:scale-105"
                  >
                    Wyloguj
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/logowanie" 
                    className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-100 rounded-xl transition-all duration-300 font-medium hover:shadow-md hover:scale-105"
                    onClick={() => setIsMenuOpen(false)}
                    prefetch={true}
                  >
                    Zaloguj się
                  </Link>
                  <Link 
                    href="/rejestracja" 
                    className="block px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 font-medium text-center hover:shadow-xl hover:scale-105"
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