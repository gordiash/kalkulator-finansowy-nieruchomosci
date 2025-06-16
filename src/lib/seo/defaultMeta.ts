import type { Metadata } from 'next'

export const defaultMeta: Metadata = {
  title: 'Analityka Nieruchomości',
  description:
    'Profesjonalne kalkulatory inwestycyjne, blog ekspercki i narzędzia do analizy rynku nieruchomości.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    title: 'Analityka Nieruchomości',
    description:
      'Profesjonalne kalkulatory inwestycyjne, blog ekspercki i narzędzia do analizy rynku nieruchomości.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
  },
} 