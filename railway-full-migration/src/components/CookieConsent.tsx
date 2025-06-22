'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CookieSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const hasConsent = localStorage.getItem('cookieConsent');
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const acceptAll = () => {
    const consentData = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem('cookieConsent', JSON.stringify(consentData));
    setIsVisible(false);
  };

  const acceptNecessaryOnly = () => {
    const consentData = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem('cookieConsent', JSON.stringify(consentData));
    setIsVisible(false);
  };

  const saveCustomSettings = () => {
    const consentData = {
      ...settings,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem('cookieConsent', JSON.stringify(consentData));
    setIsVisible(false);
  };

  const handleSettingChange = (type: keyof CookieSettings) => {
    if (type === 'necessary') return; // Can't disable necessary cookies
    setSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 shadow-lg">
      <Card className="w-full rounded-none border-x-0 border-b-0">
        <CardContent className="p-4 sm:p-6">
          {!showDetails ? (
            // Basic consent view
            <div className="container mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start lg:flex-1">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      Używamy plików cookies
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                      Ta strona używa plików cookies w celu zapewnienia najlepszej jakości usług. 
                      Możesz zarządzać swoimi preferencjami lub zaakceptować wszystkie cookies.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
                  <div className="flex items-center text-xs text-gray-500 gap-4 mb-2 sm:mb-0">
                    <Link href="/polityka-prywatnosci" className="text-blue-600 hover:text-blue-800 underline">
                      Polityka Prywatności
                    </Link>
                    <button 
                      onClick={() => setShowDetails(true)}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Ustawienia
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={acceptNecessaryOnly}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      Tylko niezbędne
                    </Button>
                    <Button 
                      onClick={acceptAll}
                      size="sm"
                      className="text-xs bg-blue-600 hover:bg-blue-700"
                    >
                      Akceptuj wszystkie
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Detailed settings view
            <div className="container mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Ustawienia cookies
                </h2>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-gray-700 mb-4">
                Zarządzaj swoimi preferencjami dotyczącymi cookies.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {/* Necessary Cookies */}
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900">Cookies niezbędne</h3>
                    <div className="w-6 h-3 bg-green-500 rounded-full flex items-center justify-end px-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">Zawsze aktywne</p>
                </div>

                {/* Analytics Cookies */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900">Cookies analityczne</h3>
                    <button
                      onClick={() => handleSettingChange('analytics')}
                      className={`w-6 h-3 rounded-full flex items-center px-1 transition-colors ${
                        settings.analytics 
                          ? 'bg-blue-600 justify-end' 
                          : 'bg-gray-300 justify-start'
                      }`}
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">
                    {settings.analytics ? 'Włączone' : 'Wyłączone'}
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900">Cookies marketingowe</h3>
                    <button
                      onClick={() => handleSettingChange('marketing')}
                      className={`w-6 h-3 rounded-full flex items-center px-1 transition-colors ${
                        settings.marketing 
                          ? 'bg-blue-600 justify-end' 
                          : 'bg-gray-300 justify-start'
                      }`}
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">
                    {settings.marketing ? 'Włączone' : 'Wyłączone'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-gray-500">
                  <Link href="/polityka-prywatnosci" className="text-blue-600 hover:text-blue-800 underline">
                    Polityka Prywatności
                  </Link>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={acceptNecessaryOnly}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Tylko niezbędne
                  </Button>
                  <Button 
                    onClick={saveCustomSettings}
                    size="sm"
                    className="text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    Zapisz ustawienia
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieConsent; 