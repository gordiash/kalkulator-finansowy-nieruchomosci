'use client';

import { useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  Save, 
  Globe, 
  Mail,
  Shield,
  Database,
  Bell,
  Palette,
  Key,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Kalkulatory Nieruchomości',
    siteUrl: 'https://www.kalkulatorynieruchomosci.pl',
    contactEmail: 'kontakt@kalkulatorynieruchomosci.pl',
    googleAnalyticsId: 'G-XXXXXXXX',
    facebookPixelId: 'XXXXXXXX',
    hotjarId: 'XXXXXXXX',
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    theme: 'light'
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Tutaj dodaj logikę zapisywania ustawień
      console.log('Zapisywanie ustawień:', settings);
      // Symulacja opóźnienia
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Błąd podczas zapisywania:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ustawienia</h1>
            <p className="text-gray-600 mt-2">Zarządzaj konfiguracją serwisu</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button variant="outline" className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-2" />
              Przywróć domyślne
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ustawienia ogólne */}
          <div className="space-y-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Ustawienia Ogólne
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="siteName" className="text-sm font-medium text-gray-700 mb-2 block">
                    Nazwa serwisu
                  </Label>
                  <Input
                    id="siteName"
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="siteUrl" className="text-sm font-medium text-gray-700 mb-2 block">
                    URL serwisu
                  </Label>
                  <Input
                    id="siteUrl"
                    type="url"
                    value={settings.siteUrl}
                    onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="contactEmail" className="text-sm font-medium text-gray-700 mb-2 block">
                    Email kontaktowy
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="theme" className="text-sm font-medium text-gray-700 mb-2 block">
                    Motyw
                  </Label>
                  <select
                    id="theme"
                    value={settings.theme}
                    onChange={(e) => handleInputChange('theme', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="light">Jasny</option>
                    <option value="dark">Ciemny</option>
                    <option value="auto">Automatyczny</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Ustawienia bezpieczeństwa */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Bezpieczeństwo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Tryb konserwacji</h3>
                    <p className="text-xs text-gray-500">Tymczasowo wyłącz dostęp do serwisu</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Rejestracja użytkowników</h3>
                    <p className="text-xs text-gray-500">Pozwól nowym użytkownikom się rejestrować</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowRegistration}
                      onChange={(e) => handleInputChange('allowRegistration', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ustawienia integracji */}
          <div className="space-y-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  Integracje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="googleAnalyticsId" className="text-sm font-medium text-gray-700 mb-2 block">
                    Google Analytics ID
                  </Label>
                  <Input
                    id="googleAnalyticsId"
                    type="text"
                    placeholder="G-XXXXXXXX"
                    value={settings.googleAnalyticsId}
                    onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="facebookPixelId" className="text-sm font-medium text-gray-700 mb-2 block">
                    Facebook Pixel ID
                  </Label>
                  <Input
                    id="facebookPixelId"
                    type="text"
                    placeholder="XXXXXXXX"
                    value={settings.facebookPixelId}
                    onChange={(e) => handleInputChange('facebookPixelId', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="hotjarId" className="text-sm font-medium text-gray-700 mb-2 block">
                    Hotjar ID
                  </Label>
                  <Input
                    id="hotjarId"
                    type="text"
                    placeholder="XXXXXXXX"
                    value={settings.hotjarId}
                    onChange={(e) => handleInputChange('hotjarId', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ustawienia powiadomień */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Powiadomienia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Powiadomienia email</h3>
                    <p className="text-xs text-gray-500">Otrzymuj powiadomienia o nowych użytkownikach</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Status systemu */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Status Systemu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Baza danych</span>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">API</span>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-600">Działające</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Cache</span>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-600">Aktywny</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">SSL</span>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-600">Ważny</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 