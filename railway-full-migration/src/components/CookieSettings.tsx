'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCookieConsent } from '@/hooks/useCookieConsent';

interface CookieSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const CookieSettings: React.FC<CookieSettingsProps> = ({ isOpen, onClose }) => {
  const { consent, updateConsent, revokeConsent } = useCookieConsent();
  const [settings, setSettings] = useState({
    necessary: true,
    analytics: consent?.analytics || false,
    marketing: consent?.marketing || false,
  });

  const handleSettingChange = (type: 'analytics' | 'marketing') => {
    setSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const saveSettings = () => {
    updateConsent(settings);
    onClose();
  };

  const acceptAll = () => {
    updateConsent({
      necessary: true,
      analytics: true,
      marketing: true,
    });
    onClose();
  };

  const acceptNecessaryOnly = () => {
    updateConsent({
      necessary: true,
      analytics: false,
      marketing: false,
    });
    onClose();
  };

  const handleRevokeConsent = () => {
    revokeConsent();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Ustawienia cookies
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-sm text-gray-700 mb-6">
            Zarządzaj swoimi preferencjami dotyczącymi cookies. Zmiany zostaną zastosowane natychmiast 
            po zapisaniu ustawień.
          </p>

          <div className="space-y-4 mb-6">
            {/* Necessary Cookies */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">Cookies niezbędne</h3>
                  <p className="text-sm text-gray-600">Zawsze aktywne</p>
                </div>
                <div className="w-8 h-4 bg-green-500 rounded-full flex items-center justify-end px-1">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <p className="text-xs text-gray-600">
                Te pliki cookies są niezbędne do podstawowego funkcjonowania strony internetowej. 
                Zapewniają bezpieczeństwo, dostępność i podstawowe funkcje nawigacji.
              </p>
            </div>

            {/* Analytics Cookies */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">Cookies analityczne</h3>
                  <p className="text-sm text-gray-600">
                    Obecnie: {settings.analytics ? 'Włączone' : 'Wyłączone'}
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('analytics')}
                  className={`w-8 h-4 rounded-full flex items-center px-1 transition-colors ${
                    settings.analytics 
                      ? 'bg-blue-600 justify-end' 
                      : 'bg-gray-300 justify-start'
                  }`}
                >
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </button>
              </div>
              <p className="text-xs text-gray-600">
                Pozwalają nam analizować sposób korzystania ze strony, co pomaga nam ją ulepszać. 
                Wykorzystujemy Google Analytics do gromadzenia anonimowych statystyk ruchu.
              </p>
            </div>

            {/* Marketing Cookies */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">Cookies marketingowe</h3>
                  <p className="text-sm text-gray-600">
                    Obecnie: {settings.marketing ? 'Włączone' : 'Wyłączone'}
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('marketing')}
                  className={`w-8 h-4 rounded-full flex items-center px-1 transition-colors ${
                    settings.marketing 
                      ? 'bg-blue-600 justify-end' 
                      : 'bg-gray-300 justify-start'
                  }`}
                >
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </button>
              </div>
              <p className="text-xs text-gray-600">
                Służą do personalizacji reklam i śledzenia skuteczności kampanii reklamowych. 
                Mogą być wykorzystywane przez Facebook Pixel i inne narzędzia marketingowe.
              </p>
            </div>
          </div>

          {consent && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Ostatnia aktualizacja zgody:</strong> {' '}
                {new Date(consent.timestamp).toLocaleDateString('pl-PL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}

          <div className="text-center text-xs text-gray-500 mb-6">
            <Link href="/polityka-prywatnosci" className="text-blue-600 hover:text-blue-800 underline">
              Przeczytaj naszą Politykę Prywatności
            </Link>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={acceptNecessaryOnly}
                variant="outline"
                className="flex-1 text-sm"
              >
                Tylko niezbędne
              </Button>
              <Button 
                onClick={acceptAll}
                variant="outline"
                className="flex-1 text-sm"
              >
                Akceptuj wszystkie
              </Button>
            </div>
            
            <Button 
              onClick={saveSettings}
              className="w-full text-sm bg-blue-600 hover:bg-blue-700"
            >
              Zapisz wybrane ustawienia
            </Button>

            {consent && (
              <Button 
                onClick={handleRevokeConsent}
                variant="outline"
                className="w-full text-sm text-red-700 border-red-700 hover:bg-red-100"
              >
                Cofnij zgodę na wszystkie cookies
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieSettings; 