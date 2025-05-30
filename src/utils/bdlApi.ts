import { PropertyPrice } from '../types.js';

/**
 * Wyszukuje unitId po nazwie miasta lub powiatu.
 * @param cityName Nazwa miasta lub powiatu
 * @returns unitId lub null jeśli nie znaleziono
 */
export async function fetchUnitIdByName(cityName: string): Promise<string | null> {
  try {
    // Używamy nowego API Route Handlera
    const res = await fetch(`/api/bdl/find-unit-id?unitName=${encodeURIComponent(cityName)}`);
    if (!res.ok) {
      // Można dodać bardziej szczegółową obsługę błędów na podstawie statusu odpowiedzi
      console.error(`Error fetching unit ID: ${res.status} ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    return data.unitId || null; // Zakładamy, że API zwraca { unitId: "..." } lub { error: "..." }
  } catch (error) {
    console.error('Network error or JSON parsing error while fetching unit ID:', error);
    return null;
  }
}

/**
 * Pobiera dane o cenach nieruchomości za metr kwadratowy dla danej nazwy miasta/powiatu i zakresu lat
 * z API Banku Danych Lokalnych GUS poprzez dedykowane API Routes w Next.js
 * 
 * @param unitId Identyfikator jednostki terytorialnej
 * @param years Tablica lat, dla których mają zostać pobrane dane
 * @param variableId Identyfikator zmiennej cen (np. P3788, P3786)
 * @param marketType Typ rynku (opcjonalny, używany np. dla P3786)
 * @returns Tablica obiektów zawierających dane o cenach
 */
export async function fetchPropertyPrices(
  unitId: string, 
  years: number[], 
  variableId: string,
  marketType?: 'primary' | 'secondary' // Dodano marketType jako opcjonalny
): Promise<PropertyPrice[]> {
  try {
    if (!unitId) {
      throw new Error('Nie znaleziono jednostki o podanej nazwie (unitId is missing).');
    }

    // Przekazujemy wszystkie wybrane lata jako string rozdzielony przecinkami
    const yearsParam = years.join(',');
    
    let apiUrl = `/api/bdl/property-prices?unitId=${unitId}&years=${yearsParam}&variableId=${variableId}`;
    if (marketType) {
      apiUrl += `&marketType=${marketType}`;
    }
    
    const dataResponse = await fetch(apiUrl);

    if (!dataResponse.ok) {
      const errorText = await dataResponse.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Nie udało się pobrać danych o cenach nieruchomości: ${dataResponse.status} ${dataResponse.statusText}. Details: ${errorText}`);
    }

    const priceData = await dataResponse.json();

    // Sprawdzenie, czy priceData jest tablicą i ma elementy (zgodnie z przykładową odpowiedzią z Route Handler)
    if (!Array.isArray(priceData) || priceData.length === 0) {
        console.warn('No price data returned from API or data is not an array for', {unitId, yearsParam, variableId, marketType});
        return [];
    }
    
    // Przekształć dane z API na format PropertyPrice[]
    // Zakładamy, że API zwraca bezpośrednio tablicę obiektów pasujących do struktury (lub zbliżonej)
    // { name: string, year: number, quarter: string | null, price: number }
    const prices: PropertyPrice[] = priceData.map((item: any) => ({
      city: item.name, // Lub inna nazwa jednostki, jeśli API ją zwraca
      price: parseFloat(item.price),
      year: parseInt(item.year, 10),
      quarter: item.quarter || null,
    }));
    return prices;

  } catch (error: any) {
    console.error('Error in fetchPropertyPrices:', error);
    // Zamiast rzucać nowy Error, który ukrywa oryginalny błąd, można rzucić error bezpośrednio
    // lub stworzyć bardziej szczegółowy komunikat błędu.
    throw new Error(error.message || 'Brak danych dla wybranej jednostki, lat lub wystąpił inny błąd.');
  }
}

/**
 * Pobiera dostępne lata dla danych o cenach nieruchomości z API GUS BDL dla danego wskaźnika
 * @param variableId Identyfikator zmiennej (np. P3788, P3794)
 * @returns Tablica dostępnych lat
 */
export async function fetchAvailableYears(variableId: string): Promise<number[]> {
  try {
    const response = await fetch(`/api/bdl/available-years?variableId=${variableId}`);

    if (!response.ok) {
      // const errorText = await response.text(); // Można odczytać dla debugowania
      throw new Error('Nie udało się pobrać dostępnych lat');
    }

    const yearsData = await response.json();
    // Zakładamy, że API zwraca bezpośrednio tablicę numerów lat
    if (Array.isArray(yearsData) && yearsData.every(year => typeof year === 'number')) {
      return yearsData.sort((a, b) => b - a); // Sortuj malejąco
    }
    console.warn('Invalid data format for available years:', yearsData);
    return [];
  } catch (error) {
    console.error('Error fetching available years:', error);
    return []; // Zwróć pustą tablicę w przypadku błędu
  }
}

/**
 * Pobiera dane o średniej cenie za 1 m² lokali mieszkalnych sprzedanych w ramach transakcji rynkowych (P3788)
 * lub cen 1 m2 powierzchni użytkowej lokali mieszkalnych (P3786)
 * @param unitId Identyfikator jednostki terytorialnej
 * @param years Tablica lat, dla których mają zostać pobrane dane
 * @param variableId Identyfikator zmiennej 'P3788' lub 'P3786'
 * @param marketType Typ rynku: 'primary' (pierwotny) lub 'secondary' (wtórny)
 * @returns Tablica obiektów zawierających dane o cenach
 */
export async function fetchPricesByMarketType(
    unitId: string, 
    years: number[], 
    variableId: 'P3788' | 'P3786', // Sprecyzowano typy
    marketType: 'primary' | 'secondary'
): Promise<PropertyPrice[]> {
  if (!unitId) {
    throw new Error('unitId jest wymagany');
  }
  // Przekazujemy variableId i marketType bezpośrednio do fetchPropertyPrices
  return fetchPropertyPrices(unitId, years, variableId, marketType);
}

// Funkcja fetchP3788Prices staje się aliasem dla fetchPricesByMarketType z odpowiednim variableId
// Dla zachowania kompatybilności, jeśli była używana bezpośrednio.
// Jednakże, komponent `ceny-nieruchomosci` wydaje się wybierać `variableId` dynamicznie.
// Rozważmy, czy ta konkretna funkcja jest nadal potrzebna, czy logika wyboru `variableId`
// powinna być wyłącznie w komponencie.
// Na razie zostawiam, ale oznaczam jako potencjalnie do usunięcia/refaktoryzacji.

/**
 * @deprecated Zamiast tej funkcji użyj fetchPricesByMarketType z odpowiednim variableId.
 * Pobiera dane o średniej cenie za 1 m² lokali mieszkalnych sprzedanych w ramach transakcji rynkowych (P3788)
 * @param cityName Nazwa powiatu (np. "powiat warszawski") - UWAGA: teraz oczekujemy unitId
 * @param years Tablica lat, dla których mają zostać pobrane dane
 * @param marketType Typ rynku: 'primary' (pierwotny) lub 'secondary' (wtórny)
 * @returns Tablica obiektów zawierających dane o cenach
 */
export async function fetchP3788Prices(unitId: string, years: number[], marketType: 'primary' | 'secondary'): Promise<PropertyPrice[]> {
  console.warn("fetchP3788Prices jest przestarzała, użyj fetchPricesByMarketType('P3788', ...)")
  // Ta funkcja była specyficzna dla zmiennej P3788 (lub jej numerycznych odpowiedników dla rynku pierwotnego/wtórnego)
  // Nowa fetchPropertyPrices jest bardziej generyczna.
  // Trzeba będzie zdecydować, czy chcemy zachować tę specjalizowaną funkcję,
  // czy przenieść logikę wyboru variableId na podstawie marketType do komponentu.
  // Na razie przekazujemy 'P3788' jako variableId, co może nie być w pełni poprawne,
  // jeśli P3788 to ogólny wskaźnik, a rynki są rozróżniane przez inne ID.
  // Biorąc pod uwagę, że `fetchPropertyPrices` przyjmuje teraz `variableId`,
  // a `PropertyPricesPage` ma wybór `variableId`, ta funkcja wydaje się redundantna.
  // Komponent powinien bezpośrednio wywoływać `fetchPropertyPrices` z odpowiednim `variableId` i `marketType`.
  return fetchPricesByMarketType(unitId, years, 'P3788', marketType);
}

/**
 * @deprecated Ta funkcja była generycznym wrapperem dla starego /api/bdlApi.
 * Nowe, dedykowane API Routes powinny być używane bezpośrednio.
 * Wywołuje funkcję Netlify bdlApi z obsługą błędów i typowaniem
 */
export type BdlApiResponse = { results?: any[]; error?: string; [key: string]: any };

export async function fetchBdlApi(data: Record<string, any>): Promise<BdlApiResponse | null> {
  console.warn("fetchBdlApi jest przestarzała i nie powinna być używana z nowymi API Routes.");
  // Ta funkcja jest teraz przestarzała, ponieważ mamy dedykowane API routes.
  // Próba jej użycia z nowymi GET routes nie zadziała zgodnie z oczekiwaniami.
  try {
    // Przykładowa próba adaptacji, ale to nie jest dobre rozwiązanie:
    const endpoint = data.endpoint || '';
    const params = new URLSearchParams(data.params || {}).toString();
    const response = await fetch(`/api/bdl/${endpoint.toLowerCase()}?${params}`);

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Wystąpił błąd serwera przy użyciu fetchBdlApi');
    }

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Nie udało się połączyć z API przez fetchBdlApi';
    console.error("Błąd w przestarzałej funkcji fetchBdlApi:", message, data);
    return { error: message }; // Zwróć obiekt błędu zgodny z BdlApiResponse
  }
}

/**
 * @deprecated Ta funkcja była używana z fetchBdlApi.
 * Waliduje odpowiedź z API GUS BDL
 */
export function isValidBdlApiResponse(data: any): data is BdlApiResponse {
  console.warn("isValidBdlApiResponse jest przestarzała.");
  return data && (Array.isArray(data.results) || data.unitId || Array.isArray(data)); // Dostosowanie do możliwych odpowiedzi z nowych API
}

// Przykład użycia (do komponentu React, nie do utila):
//
// const unitId = await fetchUnitIdByName('powiat warszawski');
// if (unitId) {
//   const prices = await fetchPropertyPrices(unitId, [2022, 2023], 'P3788', 'primary');
//   // ... обработка цен ...
// }
// const years = await fetchAvailableYears('P3788');
// // ... обработка годов ... 