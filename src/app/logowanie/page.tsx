'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginPageContent() {
  const [isLogin, setIsLogin] = useState(true);
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setIsLogin(false);
    }
  }, [searchParams]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    // Honeypot fields - ukryte pola dla botów
    website: '',
    phone: '',
    // Timestamp dla rate limiting
    timestamp: Date.now().toString()
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lastAttempt, setLastAttempt] = useState(0);
  
  const router = useRouter();

  // Rate limiting - maksymalnie 5 prób na minutę
  const checkRateLimit = () => {
    const now = Date.now();
    const timeDiff = now - lastAttempt;
    
    if (attempts >= 5 && timeDiff < 60000) {
      const remainingTime = Math.ceil((60000 - timeDiff) / 1000);
      throw new Error(`Zbyt wiele prób. Spróbuj ponownie za ${remainingTime} sekund.`);
    }
    
    if (timeDiff > 60000) {
      setAttempts(0);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Timestamp': Date.now().toString()
      },
      body: JSON.stringify({ 
        email, 
        password,
        timestamp: formData.timestamp,
        userAgent: navigator.userAgent
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Błąd logowania');
    }

    const { token } = await response.json();
    localStorage.setItem('auth_token', token);
    
    // Powiadom inne komponenty o zmianie autoryzacji
    window.dispatchEvent(new Event('auth-change'));
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Timestamp': Date.now().toString()
      },
      body: JSON.stringify({ 
        email, 
        password, 
        name,
        timestamp: formData.timestamp,
        userAgent: navigator.userAgent,
        // Dodatkowe dane dla weryfikacji
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Błąd rejestracji');
    }

    const { token } = await response.json();
    localStorage.setItem('auth_token', token);
    
    // Powiadom inne komponenty o zmianie autoryzacji
    window.dispatchEvent(new Event('auth-change'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Sprawdź rate limiting
      checkRateLimit();
      
      // Sprawdź honeypot fields - jeśli wypełnione, to bot
      if (formData.website || formData.phone) {
        throw new Error('Wykryto automatyczne wypełnianie formularza');
      }
      
      // Sprawdź timestamp - jeśli za stary, to bot
      const timestamp = parseInt(formData.timestamp);
      const now = Date.now();
      if (now - timestamp > 300000) { // 5 minut
        throw new Error('Formularz wygasł. Odśwież stronę.');
      }

      // Walidacja
      if (!formData.email || !formData.password) {
        setErrors({ general: 'Email i hasło są wymagane' });
        return;
      }

      if (!isLogin) {
        if (!formData.name) {
          setErrors({ name: 'Imię jest wymagane' });
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setErrors({ confirmPassword: 'Hasła nie są identyczne' });
          return;
        }
        if (formData.password.length < 6) {
          setErrors({ password: 'Hasło musi mieć co najmniej 6 znaków' });
          return;
        }
      }

      if (isLogin) {
        await handleLogin(formData.email, formData.password);
      } else {
        await handleRegister(formData.email, formData.password, formData.name);
      }

      // Przekieruj do panelu po zalogowaniu
      router.push('/panel');
      
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Wystąpił błąd' });
      setAttempts(prev => prev + 1);
      setLastAttempt(Date.now());
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Wyczyść błąd dla tego pola
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLogin ? 'Zaloguj się' : 'Zarejestruj się'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? (
            <>
              Lub{' '}
              <button
                onClick={() => setIsLogin(false)}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                utwórz nowe konto
              </button>
            </>
          ) : (
            <>
              Lub{' '}
              <button
                onClick={() => setIsLogin(true)}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                zaloguj się do istniejącego konta
              </button>
            </>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.general}
              </div>
            )}

            {/* Honeypot fields - ukryte pola dla botów */}
            <div className="hidden">
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                tabIndex={-1}
                autoComplete="off"
                style={{ position: 'absolute', left: '-9999px' }}
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                tabIndex={-1}
                autoComplete="off"
                style={{ position: 'absolute', left: '-9999px' }}
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Imię
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adres email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Hasło
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Potwierdź hasło
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Przetwarzanie...' : (isLogin ? 'Zaloguj się' : 'Zarejestruj się')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Lub</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Wróć do strony głównej
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
} 