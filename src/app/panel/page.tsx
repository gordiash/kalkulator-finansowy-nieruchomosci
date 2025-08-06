'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Metadata } from 'next';
import { defaultMeta } from '@/lib/seo/defaultMeta';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export const metadata: Metadata = {
  ...defaultMeta,
  title: 'Panel Użytkownika - Kalkulatory Nieruchomości | Analityka Nieruchomości',
  description: 'Panel użytkownika kalkulatorów nieruchomości. Zarządzaj profilem, historią kalkulacji i ustawieniami konta.',
  keywords: [
    'panel użytkownika',
    'profil kalkulatory nieruchomości',
    'historia kalkulacji',
    'zapisane wyniki',
    'ustawienia konta',
    'zarządzanie profilem'
  ],
  alternates: {
    canonical: `${baseUrl}/panel`,
  },
  openGraph: {
    ...defaultMeta.openGraph,
    title: 'Panel Użytkownika - Kalkulatory Nieruchomości',
    description: 'Panel użytkownika kalkulatorów nieruchomości. Zarządzaj profilem i historią kalkulacji.',
    url: `${baseUrl}/panel`,
  },
};

export default function PanelPage() {
  const router = useRouter();

  useEffect(() => {
    // Przekieruj na profil jako domyślną stronę panelu
    router.replace('/panel/profil');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Przekierowywanie...</p>
      </div>
    </div>
  );
} 