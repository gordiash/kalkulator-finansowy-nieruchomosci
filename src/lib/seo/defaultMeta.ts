import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

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
    url: baseUrl,
    images: [{ url: `${baseUrl}/icon-512.png`, width: 512, height: 512, alt: 'Analityka Nieruchomości' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Analityka Nieruchomości',
    description:
      'Profesjonalne kalkulatory inwestycyjne, blog ekspercki i narzędzia do analizy rynku nieruchomości.',
    images: [`${baseUrl}/icon-512.png`],
  },
}