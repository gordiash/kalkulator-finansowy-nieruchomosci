import { Metadata } from 'next';
import ProfileForm from '@/components/ProfileForm';
import { defaultMeta } from '@/lib/seo/defaultMeta';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export const metadata: Metadata = {
  ...defaultMeta,
  title: 'Profil Użytkownika - Panel Kalkulatory Nieruchomości | Analityka Nieruchomości',
  description: 'Zarządzaj swoimi danymi osobowymi w panelu kalkulatorów nieruchomości. Edytuj profil, zmień hasło i ustawienia konta.',
  keywords: [
    'profil użytkownika',
    'dane osobowe',
    'edytuj profil',
    'zmień hasło',
    'ustawienia konta',
    'panel kalkulatory nieruchomości'
  ],
  alternates: {
    canonical: `${baseUrl}/panel/profil`,
  },
  openGraph: {
    ...defaultMeta.openGraph,
    title: 'Profil Użytkownika - Panel Kalkulatory Nieruchomości',
    description: 'Zarządzaj swoimi danymi osobowymi w panelu kalkulatorów nieruchomości.',
    url: `${baseUrl}/panel/profil`,
  },
};

export default function ProfilPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Profil użytkownika</h1>
        <p className="text-gray-600 mt-2">Zarządzaj swoimi danymi osobowymi</p>
      </div>
      
      <ProfileForm />
    </div>
  );
} 