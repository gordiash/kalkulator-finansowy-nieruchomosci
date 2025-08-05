'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  city?: string;
  postal_code?: string;
  preferred_currency?: string;
  income_range?: string;
  investment_experience?: string;
  preferred_property_type?: string;
  preferred_cities?: string;
  max_budget?: number;
  min_area?: number;
  max_area?: number;
  newsletter_subscription?: boolean;
  email_notifications?: boolean;
  language?: string;
  theme?: string;
  company_name?: string;
  nip?: string;
  business_address?: string;
  created_at: string;
  updated_at: string;
}

interface ProfileFormProps {
  className?: string;
}

export default function ProfileForm({ className = '' }: ProfileFormProps) {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    city: '',
    postal_code: '',
    preferred_currency: 'PLN',
    income_range: '',
    investment_experience: '',
    preferred_property_type: '',
    preferred_cities: '',
    max_budget: '',
    min_area: '',
    max_area: '',
    language: 'pl',
    theme: 'light',
    company_name: '',
    nip: '',
    business_address: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Funkcja do pobierania tokenu z localStorage
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  };

  // Pobieranie danych użytkownika
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setError('Brak tokenu autoryzacyjnego');
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Błąd podczas pobierania danych');
        }

        const userData = await response.json();
        setUser(userData);
        setFormData({
          name: userData.name || '',
          phone: userData.phone || '',
          date_of_birth: userData.date_of_birth ? userData.date_of_birth.split('T')[0] : '',
          gender: userData.gender || '',
          city: userData.city || '',
          postal_code: userData.postal_code || '',
          preferred_currency: userData.preferred_currency || 'PLN',
          income_range: userData.income_range || '',
          investment_experience: userData.investment_experience || '',
          preferred_property_type: userData.preferred_property_type || '',
          preferred_cities: userData.preferred_cities || '',
          max_budget: userData.max_budget ? userData.max_budget.toString() : '',
          min_area: userData.min_area ? userData.min_area.toString() : '',
          max_area: userData.max_area ? userData.max_area.toString() : '',
          language: userData.language || 'pl',
          theme: userData.theme || 'light',
          company_name: userData.company_name || '',
          nip: userData.nip || '',
          business_address: userData.business_address || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Wystąpił błąd');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Obsługa zmiany w formularzu
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Wyczyść komunikaty po zmianie
    setError(null);
    setSuccess(null);
  };

  // Obsługa wysłania formularza
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Brak tokenu autoryzacyjnego');
      }

      // Przygotowanie danych do wysłania
      const submitData = {
        ...formData,
        max_budget: formData.max_budget ? parseFloat(formData.max_budget) : null,
        min_area: formData.min_area ? parseFloat(formData.min_area) : null,
        max_area: formData.max_area ? parseFloat(formData.max_area) : null,
      };

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.details && Array.isArray(errorData.details)) {
          // Nowy format błędów walidacji
          throw new Error(`Błędy walidacji:\n${errorData.details.join('\n')}`);
        } else {
          throw new Error(errorData.error || 'Błąd podczas aktualizacji profilu');
        }
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setSuccess('Profil został pomyślnie zaktualizowany');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie danych...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Komunikaty */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-400">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-green-400">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Informacje o koncie */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Informacje o koncie</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data utworzenia:</span>
              <span className="font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('pl-PL') : 'Nieznana'}
              </span>
            </div>
          </div>
        </div>

        {/* Dane osobowe */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Dane osobowe</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Imię i nazwisko *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Wprowadź swoje imię i nazwisko"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Numer telefonu
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+48 123 456 789"
              />
            </div>
            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
                Data urodzenia
              </label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                Płeć
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Wybierz płeć</option>
                <option value="male">Męska</option>
                <option value="female">Żeńska</option>
                <option value="other">Inna</option>
              </select>
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                Miasto zamieszkania
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Warszawa"
              />
            </div>
            <div>
              <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2">
                Kod pocztowy
              </label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="00-000"
              />
            </div>
          </div>
        </div>

        {/* Preferencje finansowe */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Preferencje finansowe</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="preferred_currency" className="block text-sm font-medium text-gray-700 mb-2">
                Preferowana waluta
              </label>
              <select
                id="preferred_currency"
                name="preferred_currency"
                value={formData.preferred_currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PLN">PLN (Złoty)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="USD">USD (Dolar)</option>
              </select>
            </div>
            <div>
              <label htmlFor="income_range" className="block text-sm font-medium text-gray-700 mb-2">
                Zakres dochodów
              </label>
              <select
                id="income_range"
                name="income_range"
                value={formData.income_range}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Wybierz zakres</option>
                <option value="below_3000">Poniżej 3000 zł</option>
                <option value="3000_5000">3000-5000 zł</option>
                <option value="5000_8000">5000-8000 zł</option>
                <option value="8000_12000">8000-12000 zł</option>
                <option value="12000_20000">12000-20000 zł</option>
                <option value="above_20000">Powyżej 20000 zł</option>
              </select>
            </div>
            <div>
              <label htmlFor="investment_experience" className="block text-sm font-medium text-gray-700 mb-2">
                Doświadczenie inwestycyjne
              </label>
              <select
                id="investment_experience"
                name="investment_experience"
                value={formData.investment_experience}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Wybierz poziom</option>
                <option value="beginner">Początkujący</option>
                <option value="intermediate">Średniozaawansowany</option>
                <option value="advanced">Zaawansowany</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preferencje nieruchomości */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Preferencje nieruchomości</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="preferred_property_type" className="block text-sm font-medium text-gray-700 mb-2">
                Preferowany typ nieruchomości
              </label>
              <select
                id="preferred_property_type"
                name="preferred_property_type"
                value={formData.preferred_property_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Wybierz typ</option>
                <option value="apartment">Mieszkanie</option>
                <option value="house">Dom</option>
                <option value="commercial">Lokal komercyjny</option>
                <option value="land">Działka</option>
              </select>
            </div>
            <div>
              <label htmlFor="max_budget" className="block text-sm font-medium text-gray-700 mb-2">
                Maksymalny budżet (zł)
              </label>
              <input
                type="number"
                id="max_budget"
                name="max_budget"
                value={formData.max_budget}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="500000"
                min="0"
                step="1000"
              />
            </div>
            <div>
              <label htmlFor="min_area" className="block text-sm font-medium text-gray-700 mb-2">
                Minimalna powierzchnia (m²)
              </label>
              <input
                type="number"
                id="min_area"
                name="min_area"
                value={formData.min_area}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="30"
                min="0"
                step="1"
              />
            </div>
            <div>
              <label htmlFor="max_area" className="block text-sm font-medium text-gray-700 mb-2">
                Maksymalna powierzchnia (m²)
              </label>
              <input
                type="number"
                id="max_area"
                name="max_area"
                value={formData.max_area}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="120"
                min="0"
                step="1"
              />
            </div>
          </div>
        </div>

        {/* Dane biznesowe */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Dane biznesowe (opcjonalne)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                Nazwa firmy
              </label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nazwa Twojej firmy"
              />
            </div>
            <div>
              <label htmlFor="nip" className="block text-sm font-medium text-gray-700 mb-2">
                NIP
              </label>
              <input
                type="text"
                id="nip"
                name="nip"
                value={formData.nip}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1234567890"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="business_address" className="block text-sm font-medium text-gray-700 mb-2">
                Adres biznesowy
              </label>
              <textarea
                id="business_address"
                name="business_address"
                value={formData.business_address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Pełny adres biznesowy"
              />
            </div>
          </div>
        </div>

        {/* Ustawienia aplikacji */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Ustawienia aplikacji</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                Język interfejsu
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pl">Polski</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
                Motyw
              </label>
              <select
                id="theme"
                name="theme"
                value={formData.theme}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="light">Jasny</option>
                <option value="dark">Ciemny</option>
                <option value="auto">Automatyczny</option>
              </select>
            </div>
          </div>
        </div>

        {/* Przyciski */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Zapisywanie...
              </>
            ) : (
              'Zapisz zmiany'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 