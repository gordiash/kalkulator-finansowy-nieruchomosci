import { PropertyPrice } from '../types';

/**
 * Pobiera dane o cenach nieruchomości za metr kwadratowy dla danego miasta i roku
 * z API Banku Danych Lokalnych GUS poprzez Netlify Functions
 * 
 * @param cityName Nazwa miasta
 * @param year Rok, dla którego mają zostać pobrane dane
 * @param marketIndicatorId ID wskaźnika cen nieruchomości (P2425 lub P2426)
 * @returns Tablica obiektów zawierających dane o cenach
 */
export async function fetchPropertyPrices(cityName: string, year: number, marketIndicatorId: string): Promise<PropertyPrice[]> {
  try {
    // 1. Znajdź kod jednostki terytorialnej (miasta)
    const unitResponse = await fetch('/.netlify/functions/bdlApi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: 'Units',
        params: {
          name: cityName,
        },
      }),
    });

    if (!unitResponse.ok) {
      throw new Error('Nie udało się znaleźć podanego miasta');
    }

    const unitData = await unitResponse.json();
    if (!unitData.results || unitData.results.length === 0) {
      throw new Error('Nie znaleziono miasta o podanej nazwie');
    }

    const unitId = unitData.results[0].id;
    const cityNameFromApi = unitData.results[0].name;

    // 2. Pobierz dane o cenach nieruchomości dla znalezionej jednostki
    const dataResponse = await fetch('/.netlify/functions/bdlApi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: 'Data',
        params: {
          'subject-id': marketIndicatorId,
          'unit-id': unitId,
          year: year.toString(),
        },
      }),
    });

    if (!dataResponse.ok) {
      throw new Error('Nie udało się pobrać danych o cenach nieruchomości');
    }

    const priceData = await dataResponse.json();
    
    // 3. Przetwórz dane do formatu wymaganego przez aplikację
    if (!priceData.results || priceData.results.length === 0 || !priceData.results[0].values) {
      return [];
    }

    // Przekształć dane z API na format PropertyPrice[]
    const prices: PropertyPrice[] = priceData.results[0].values.map((item: any) => ({
      city: cityNameFromApi,
      price: parseFloat(item.val),
      year: item.year,
      quarter: item.quarter,
    }));

    return prices;
  } catch (error: any) {
    console.error('Błąd podczas pobierania danych:', error);
    throw error;
  }
}

/**
 * Pobiera dostępne lata dla danych o cenach nieruchomości z API GUS BDL
 * 
 * @returns Tablica dostępnych lat
 */
export async function fetchAvailableYears(): Promise<number[]> {
  try {
    const response = await fetch('/.netlify/functions/bdlApi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: 'Subjects/P2425',
      }),
    });

    if (!response.ok) {
      throw new Error('Nie udało się pobrać metadanych wskaźnika');
    }

    const metadata = await response.json();
    
    if (metadata.availableYears && Array.isArray(metadata.availableYears)) {
      return metadata.availableYears;
    }
    
    // Jeśli API nie zwraca dostępnych lat, używamy ostatnich 5 lat jako domyślne
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  } catch (error) {
    console.error('Błąd podczas pobierania dostępnych lat:', error);
    
    // W przypadku błędu, zwracamy ostatnie 5 lat jako fallback
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }
} 