import type { Metadata } from 'next'
import { defaultMeta } from './defaultMeta'

interface DynamicMetaParams {
  city?: string
  area?: string
  rooms?: string
  year?: string
  district?: string
  type: 'valuation' | 'credit' | 'rental' | 'purchase' | 'fliper'
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
    case 'fliper':
      title = 'Kalkulator Flipera Nieruchomości - ROI, Zysk Netto, Koszty Remontu'
      description = 'Profesjonalny kalkulator flipera nieruchomości. Oblicz ROI, zysk netto, koszty remontu, podatki i opłacalność flipa. Analiza inwestycji w nieruchomości z kalkulacją wszystkich kosztów.'
      url = `${baseUrl}/kalkulator-flipera`
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

/**
 * Generuje strukturowane dane Schema.org dla wyceny nieruchomości
 */
export function generateValuationSchema(params: DynamicMetaParams & { price?: number }) {
  const { city, area, rooms, year, district, price } = params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstate',
    name: generateValuationTitle({ city, area, rooms, year, district }),
    description: generateValuationDescription({ city, area, rooms, year, district }),
    url: `${baseUrl}/kalkulator-wyceny`,
    applicationCategory: 'FinancialApplication',
    operatingSystem: 'Web',
    ...(price && {
      offers: {
        '@type': 'Offer',
        price: price.toString(),
        priceCurrency: 'PLN',
        availability: 'https://schema.org/InStock',
      }
    }),
    ...(city && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: city,
        addressCountry: 'PL',
        ...(district && { addressRegion: district })
      }
    }),
    ...(area && {
      floorSize: {
        '@type': 'QuantitativeValue',
        value: area,
        unitCode: 'MTK'
      }
    }),
    ...(rooms && {
      numberOfRooms: parseInt(rooms)
    }),
    ...(year && {
      yearBuilt: parseInt(year)
    })
  }
  
  return schema
} 