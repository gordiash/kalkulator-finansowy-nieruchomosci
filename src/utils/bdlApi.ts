import { PropertyPrice } from '../types';

/**
 * Pobiera dane o cenach nieruchomości za metr kwadratowy dla danego miasta i roku
 * z API Banku Danych Lokalnych GUS
 * 
 * @param cityName Nazwa miasta
 * @param year Rok, dla którego mają zostać pobrane dane
 * @returns Tablica obiektów zawierających dane o cenach
 */
export async function fetchPropertyPrices(cityName: string, year: number): Promise<PropertyPrice[]> {
  const API_KEY = process.env.REACT_APP_GUS_BDL_API_KEY;
  if (!API_KEY) {
    throw new Error('Brak klucza API GUS BDL');
  }

  // 1. Znajdź kod jednostki terytorialnej (miasta)
  const unitResponse = await fetch(
    `https://bdl.stat.gov.pl/api/v1/Units?name=${encodeURIComponent(cityName)}`,
    {
      headers: {
        'X-ClientId': API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );

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
  // ID wskaźnika P2425 odpowiada cenom transakcyjnym za m² mieszkania na rynku pierwotnym
  // W rzeczywistej implementacji należałoby zweryfikować, czy to jest poprawne ID
  const dataResponse = await fetch(
    `https://bdl.stat.gov.pl/api/v1/Data?subject-id=P2425&unit-id=${unitId}&year=${year}`,
    {
      headers: {
        'X-ClientId': API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );

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
}

/**
 * Pobiera dostępne lata dla danych o cenach nieruchomości z API GUS BDL
 * 
 * @returns Tablica dostępnych lat
 */
export async function fetchAvailableYears(): Promise<number[]> {
  const API_KEY = process.env.REACT_APP_GUS_BDL_API_KEY;
  if (!API_KEY) {
    throw new Error('Brak klucza API GUS BDL');
  }

  try {
    // Zapytanie o metadane dla wskaźnika cen nieruchomości (P2425)
    const metadataResponse = await fetch(
      'https://bdl.stat.gov.pl/api/v1/Subjects/P2425',
      {
        headers: {
          'X-ClientId': API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!metadataResponse.ok) {
      throw new Error('Nie udało się pobrać metadanych wskaźnika');
    }

    const metadata = await metadataResponse.json();
    
    // Przykładowa implementacja - w rzeczywistości należy dostosować
    // do faktycznej struktury odpowiedzi z API GUS BDL
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