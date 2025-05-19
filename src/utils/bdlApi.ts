import { PropertyPrice } from '../types';

/**
 * Wyszukuje unitId po nazwie miasta lub powiatu (najpierw level 6, potem 5)
 * @param cityName Nazwa miasta lub powiatu
 * @returns unitId lub null jeśli nie znaleziono
 */
export async function fetchUnitIdByName(cityName: string): Promise<string | null> {
  // Najpierw szukaj na poziomie miasta (level 6)
  let res = await fetch('/api/bdlApi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: 'Units/search',
      params: { name: cityName, level: '6', format: 'json', lang: 'pl', pageSize: '10' },
    }),
  });
  let data = await res.json();
  if (data.results && data.results.length > 0) return data.results[0].id;
  // Jeśli nie znaleziono, szukaj na poziomie powiatu (level 5)
  res = await fetch('/api/bdlApi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: 'Units/search',
      params: { name: cityName, level: '5', format: 'json', lang: 'pl', pageSize: '10' },
    }),
  });
  data = await res.json();
  if (data.results && data.results.length > 0) return data.results[0].id;
  return null;
}

/**
 * Pobiera dane o cenach nieruchomości za metr kwadratowy dla danej nazwy miasta/powiatu i zakresu lat
 * z API Banku Danych Lokalnych GUS poprzez Netlify Functions
 * 
 * @param cityName Nazwa miasta lub powiatu
 * @param years Tablica lat, dla których mają zostać pobrane dane
 * @param variableId Identyfikator zmiennej cen (domyślnie P3794)
 * @returns Tablica obiektów zawierających dane o cenach
 */
export async function fetchPropertyPrices(cityName: string, years: number[], variableId: string = 'P3794'): Promise<PropertyPrice[]> {
  try {
    const unitId = await fetchUnitIdByName(cityName);
    if (!unitId) {
      throw new Error('Nie znaleziono jednostki o podanej nazwie.');
    }
    const endpoint = `data/by-unit/${unitId}`;
    const variableIdForApi = variableId.startsWith('P') ? variableId.slice(1) : variableId;
    const params = {
      'var-id': variableIdForApi,
      year: years.map(y => y.toString()),
      format: 'json',
      lang: 'pl'
    };

    const dataResponse = await fetch('/api/bdlApi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint,
        params,
      }),
    });

    if (!dataResponse.ok) {
      const errorText = await dataResponse.text();
      throw new Error('Nie udało się pobrać danych o cenach nieruchomości: ' + errorText);
    }

    // Logowanie odpowiedzi tekstowej
    const text = await dataResponse.text();
    try {
      const priceData = JSON.parse(text);
      if (!priceData.results || priceData.results.length === 0 || !priceData.results[0].values) {
        return [];
      }
      // Przekształć dane z API na format PropertyPrice[]
      const prices: PropertyPrice[] = priceData.results[0].values.map((item: any) => ({
        city: cityName,
        price: parseFloat(item.val),
        year: item.year,
        quarter: item.quarter || null,
      }));
      return prices;
    } catch (e) {
      console.error('Błąd parsowania JSON z API:', text);
      throw new Error('Niepoprawny JSON z API: ' + text);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Brak danych dla wybranej jednostki lub lat.');
  }
}

/**
 * Pobiera dostępne lata dla danych o cenach nieruchomości z API GUS BDL dla danego wskaźnika
 * @param variableId Identyfikator zmiennej (np. P3788, P3794)
 * @returns Tablica dostępnych lat
 */
export async function fetchAvailableYears(variableId: string): Promise<number[]> {
  try {
    const response = await fetch('/api/bdlApi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: `Subjects/${variableId}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Nie udało się pobrać metadanych wskaźnika');
    }

    const metadata = await response.json();
    if (metadata.years && Array.isArray(metadata.years)) {
      return metadata.years;
    }
    if (metadata.availableYears && Array.isArray(metadata.availableYears)) {
      return metadata.availableYears;
    }
    // fallback
    return [];
  } catch (error) {
    return [];
  }
}

/**
 * Pobiera dane o średniej cenie za 1 m² lokali mieszkalnych sprzedanych w ramach transakcji rynkowych (P3788)
 * @param cityName Nazwa powiatu (np. "powiat warszawski")
 * @param years Tablica lat, dla których mają zostać pobrane dane
 * @param marketType Typ rynku: 'primary' (pierwotny) lub 'secondary' (wtórny)
 * @returns Tablica obiektów zawierających dane o cenach
 */
export async function fetchP3788Prices(cityName: string, years: number[], marketType: 'primary' | 'secondary'): Promise<PropertyPrice[]> {
  let variableId;
  if (marketType === 'primary') {
    variableId = '633667'; // rynek pierwotny
  } else if (marketType === 'secondary') {
    variableId = '633672'; // rynek wtórny
  } else {
    throw new Error('Nieznany typ rynku. Dozwolone wartości: "primary", "secondary".');
  }
  return fetchPropertyPrices(cityName, years, variableId);
}

/**
 * Wywołuje funkcję Netlify bdlApi z obsługą błędów i typowaniem
 */
export type BdlApiResponse = { results?: any[]; error?: string; [key: string]: any };

export async function fetchBdlApi(data: Record<string, any>): Promise<BdlApiResponse | null> {
  try {
    const response = await fetch('/api/bdlApi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      // Obsługa błędów z backendu
      throw new Error(result.error || 'Wystąpił błąd serwera');
    }

    return result;
  } catch (error) {
    // Obsługa błędów sieciowych lub innych
    const message = error instanceof Error ? error.message : 'Nie udało się połączyć z API';
    // W utilu nie wywołujemy alertów, tylko zwracamy null
    // alert(message); // jeśli chcesz, możesz obsłużyć to w komponencie
    return null;
  }
}

/**
 * Waliduje odpowiedź z API GUS BDL
 */
export function isValidBdlApiResponse(data: any): data is BdlApiResponse {
  return data && Array.isArray(data.results);
}

// Przykład użycia (do komponentu React, nie do utila):
//
// const data = await fetchBdlApi({ endpoint: 'Units', params: { name: 'powiat warszawski', level: '4' } });
// if (!data || !isValidBdlApiResponse(data) || !data.results.length) {
//   setError('Brak wyników dla podanych parametrów');
//   setResults([]);
// } else {
//   setError(null);
//   setResults(data.results);
// } 