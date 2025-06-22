// Funkcje SEO skopiowane dla Vercel compatibility
import type { Metadata } from 'next'

// Default meta skopiowane z ./lib/seo/defaultMeta.ts
const defaultMeta: Metadata = {
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

interface DynamicMetaParams {
  city?: string
  area?: string
  rooms?: string
  year?: string
  district?: string
  type: 'valuation' | 'credit' | 'rental' | 'purchase'
}

export function generateDynamicMetadata(params: DynamicMetaParams): Metadata {
  const { city, area, rooms, year, district, type } = params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  
  // Generuj dynamiczny tytuł na podstawie parametrów
  let title = ''
  let description = ''
  let url = ''
  
  switch (type) {
    case 'valuation':
      title = generateValuationTitle({ city, area, rooms, year, district })
      description = generateValuationDescription({ city, area, rooms, year, district })
      url = `${baseUrl}/kalkulator-wyceny`
      break
    case 'credit':
      title = 'Kalkulator Zdolności Kredytowej - Sprawdź Swoją Zdolność'
      description = 'Oblicz maksymalną kwotę kredytu hipotecznego i miesięczną ratę. Profesjonalny kalkulator zdolności kredytowej.'
      url = `${baseUrl}/kalkulator-zdolnosci-kredytowej`
      break
    case 'rental':
      title = 'Kalkulator Wynajmu - Rentowność Inwestycji'
      description = 'Sprawdź rentowność wynajmu mieszkania. Oblicz ROI, przepływy pieniężne i okres zwrotu inwestycji.'
      url = `${baseUrl}/kalkulator-wynajmu`
      break
    case 'purchase':
      title = 'Kalkulator Kosztów Zakupu Nieruchomości'
      description = 'Oblicz wszystkie koszty zakupu mieszkania: podatek, notariusz, kredyt, ubezpieczenie.'
      url = `${baseUrl}/kalkulator-zakupu-nieruchomosci`
      break
  }

  // Dodaj parametry do URL jeśli są dostępne
  if (city || area || rooms || year) {
    const urlParams = new URLSearchParams()
    if (city) urlParams.set('miasto', city)
    if (area) urlParams.set('metraz', area)
    if (rooms) urlParams.set('pokoje', rooms)
    if (year) urlParams.set('rok', year)
    if (district) urlParams.set('dzielnica', district)
    
    url += `?${urlParams.toString()}`
  }

  return {
    ...defaultMeta,
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      ...defaultMeta.openGraph,
      title,
      description,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    other: {
      'application-name': 'Analityka Nieruchomości',
      'msapplication-TileColor': '#2563EB',
    }
  }
}

function generateValuationTitle({ city, area, rooms, year, district }: Omit<DynamicMetaParams, 'type'>): string {
  let title = 'Kalkulator Wyceny Mieszkania'
  
  if (city) {
    title += ` - ${city}`
    if (district) {
      title += ` ${district}`
    }
  }
  
  if (area) {
    title += ` ${area}m²`
  }
  
  if (rooms) {
    title += ` ${rooms} pokoje`
  }
  
  if (year) {
    title += ` ${year}r`
  }
  
  title += ' | AI Wycena'
  
  return title
}

function generateValuationDescription({ city, area, rooms, year, district }: Omit<DynamicMetaParams, 'type'>): string {
  let description = 'Oszacuj wartość rynkową mieszkania za pomocą sztucznej inteligencji. '
  
  if (city || area || rooms) {
    description += 'Wycena '
    
    if (area && rooms) {
      description += `mieszkania ${area}m² ${rooms} pokojowe `
    } else if (area) {
      description += `mieszkania ${area}m² `
    } else if (rooms) {
      description += `mieszkania ${rooms} pokojowe `
    }
    
    if (city) {
      description += `w ${city}`
      if (district) {
        description += ` ${district}`
      }
    }
    
    if (year) {
      description += ` z ${year} roku`
    }
    
    description += '. '
  }
  
  description += 'Model Random Forest MAPE 15.56%. Sprawdź też zdolność kredytową i rentowność wynajmu.'
  
  return description
} 