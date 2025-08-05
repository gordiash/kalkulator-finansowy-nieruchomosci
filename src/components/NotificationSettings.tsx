'use client';

import { useState, useEffect } from 'react';

interface NotificationSettingsProps {
  className?: string;
}

interface User {
  newsletter_subscription?: boolean;
  email_notifications?: boolean;
}

// Funkcja do pobierania tokenu z localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

export default function NotificationSettings({ className = '' }: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    newsletter_subscription: true,
    email_notifications: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pobieranie aktualnych ustawień
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        const response = await fetch('/api/user/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData: User = await response.json();
          setSettings({
            newsletter_subscription: userData.newsletter_subscription ?? true,
            email_notifications: userData.email_notifications ?? true,
          });
        }
      } catch (error) {
        console.error('Błąd podczas pobierania ustawień:', error);
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: checked,
    }));
    setError(null);
    setSuccess(null);
  };

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

      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.details && Array.isArray(errorData.details)) {
          throw new Error(`Błędy walidacji:\n${errorData.details.join('\n')}`);
        } else {
          throw new Error(errorData.error || 'Błąd podczas aktualizacji ustawień');
        }
      }

      setSuccess('Ustawienia zostały pomyślnie zaktualizowane');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Komunikaty */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Ustawienia powiadomień */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Powiadomienia i subskrypcje</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="newsletter_subscription" className="text-sm font-medium text-gray-700">
                  Subskrypcja newslettera
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Otrzymuj informacje o nowych funkcjach, poradach i aktualnościach
                </p>
              </div>
              <input
                type="checkbox"
                id="newsletter_subscription"
                name="newsletter_subscription"
                checked={settings.newsletter_subscription}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="email_notifications" className="text-sm font-medium text-gray-700">
                  Powiadomienia email
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Otrzymuj powiadomienia o ważnych wydarzeniach i aktualizacjach
                </p>
              </div>
              <input
                type="checkbox"
                id="email_notifications"
                name="email_notifications"
                checked={settings.email_notifications}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Przycisk zapisz */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Zapisywanie...' : 'Zapisz ustawienia'}
          </button>
        </div>
      </form>
    </div>
  );
} 