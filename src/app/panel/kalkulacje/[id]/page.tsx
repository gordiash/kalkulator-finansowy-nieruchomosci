'use client';

import CalculationDetailPage from '@/components/calculation-details/CalculationDetailPage';
import type { Metadata } from 'next';
import { defaultMeta } from '@/lib/seo/defaultMeta';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export const metadata: Metadata = {
  ...defaultMeta,
  title: 'Szczegóły Kalkulacji - Panel Użytkownika | Analityka Nieruchomości',
  description: 'Szczegółowe wyniki kalkulacji nieruchomości. Przeglądaj zapisane wyceny, zdolność kredytową i rentowność wynajmu.',
  keywords: [
    'szczegóły kalkulacji',
    'wyniki kalkulacji',
    'wycena nieruchomości',
    'zdolność kredytowa',
    'rentowność wynajmu',
    'zapisane wyniki',
    'panel użytkownika'
  ],
  alternates: {
    canonical: `${baseUrl}/panel/kalkulacje/[id]`,
  },
  openGraph: {
    ...defaultMeta.openGraph,
    title: 'Szczegóły Kalkulacji - Panel Użytkownika',
    description: 'Szczegółowe wyniki kalkulacji nieruchomości. Przeglądaj zapisane wyceny.',
    url: `${baseUrl}/panel/kalkulacje/[id]`,
  },
};

export default function Page() {
  return <CalculationDetailPage />;
} 