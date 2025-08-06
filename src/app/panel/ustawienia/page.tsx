import { Metadata } from 'next';
import ChangePasswordForm from '@/components/ChangePasswordForm';
import NotificationSettings from '@/components/NotificationSettings';
import { defaultMeta } from '@/lib/seo/defaultMeta';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export const metadata: Metadata = {
  ...defaultMeta,
  title: 'Ustawienia Konta - Panel Użytkownika | Analityka Nieruchomości',
  description: 'Zarządzaj ustawieniami konta w panelu kalkulatorów nieruchomości. Zmień hasło, powiadomienia i preferencje bezpieczeństwa.',
  keywords: [
    'ustawienia konta',
    'zmień hasło',
    'powiadomienia',
    'bezpieczeństwo konta',
    'preferencje użytkownika',
    'panel użytkownika'
  ],
  alternates: {
    canonical: `${baseUrl}/panel/ustawienia`,
  },
  openGraph: {
    ...defaultMeta.openGraph,
    title: 'Ustawienia Konta - Panel Użytkownika',
    description: 'Zarządzaj ustawieniami konta w panelu kalkulatorów nieruchomości.',
    url: `${baseUrl}/panel/ustawienia`,
  },
};

export default function UstawieniaPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ustawienia konta</h1>
        <p className="text-gray-600 mt-2">Zarządzaj ustawieniami konta i bezpieczeństwem</p>
      </div>
      
      <div className="space-y-8">
        {/* Sekcja zmiany hasła */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Zmiana hasła</h2>
          <ChangePasswordForm />
        </div>
        
        {/* Sekcja powiadomień i subskrypcji */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Powiadomienia i subskrypcje</h2>
          <NotificationSettings />
        </div>
      </div>
    </div>
  );
} 