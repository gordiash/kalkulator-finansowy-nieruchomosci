import { NextResponse } from 'next/server';

// Definicja mapowania ogólnych ID zmiennych i typu rynku na specyficzne ID GUS BDL
const BDL_VARIABLE_MAP: Record<string, Record<string, string>> = {
  P3786: { // Średnia cena lokali mieszkalnych sprzedanych w ramach transakcji rynkowych
    primary: '633667',
    secondary: '633672',
  },
  P3788: { // Mediana cen lokali mieszkalnych sprzedanych w ramach transakcji rynkowych
    primary: '633697',
    secondary: '633702',
  },
};

// Ta funkcja będzie musiała zostać dostosowana do rzeczywistej logiki pobierania danych,
// np. przez odpytanie zewnętrznego API GUS BDL.
// Na potrzeby tego przykładu, zwracamy przykładowe dane lub błąd.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  console.log('API Route property-prices: Received searchParams:', searchParams.toString());

  const unitId = searchParams.get('unitId');
  const yearsString = searchParams.get('years');
  const clientVariableId = searchParams.get('variableId') as 'P3786' | 'P3788' | null; // Ograniczenie do oczekiwanych
  const marketType = searchParams.get('marketType') as ('primary' | 'secondary' | null);

  if (!unitId || !yearsString || !clientVariableId) {
    return NextResponse.json({ error: 'V3 - Missing required query parameters: unitId, years, variableId' }, { status: 400 });
  }

  // Walidacja czy clientVariableId jest jednym z obsługiwanych
  if (clientVariableId !== 'P3786' && clientVariableId !== 'P3788') {
    return NextResponse.json({ error: `Unsupported variableId: ${clientVariableId}. Supported are P3786 and P3788.` }, { status: 400 });
  }
  
  // Dla obu P3786 i P3788 marketType jest teraz wymagany
  if (!marketType) {
    return NextResponse.json({ error: `Missing required query parameter: marketType for variableId ${clientVariableId}` }, { status: 400 });
  }

  const actualBdlApiVariableId = BDL_VARIABLE_MAP[clientVariableId]?.[marketType] || null;
  
  if (!actualBdlApiVariableId) {
    // Ten błąd nie powinien wystąpić jeśli powyższa walidacja marketType jest poprawna, ale dla pewności
    return NextResponse.json({ error: `Invalid marketType '${marketType}' for variableId ${clientVariableId}` }, { status: 400 });
  }

  const years = yearsString.split(',').map(year => parseInt(year.trim())).filter(year => !isNaN(year));
  if (years.length === 0) {
    return NextResponse.json({ error: 'Invalid format for years parameter. Expected comma-separated numbers.' }, { status: 400 });
  }

  console.log(`API Route: Fetching property prices for unitId: ${unitId}, years: ${years.join(',')}, clientVariableId: ${clientVariableId}, marketType: ${marketType}, actualBdlApiVariableId: ${actualBdlApiVariableId}`);

  let allPrices: any[] = [];
  const pageSize = 50; // Ustawiamy większy rozmiar strony

  // Nowa logika pobierania danych z BDL API - jedno zapytanie dla wszystkich lat
  try {
    const yearParams = years.map(y => `year=${y}`).join('&');
    let currentPageUrl: string | null = `https://bdl.stat.gov.pl/api/v1/data/by-variable/${actualBdlApiVariableId}?unitId=${unitId}&${yearParams}&format=json&page-size=${pageSize}`;
    let targetUnitDataProcessed = false; // Flaga wskazująca, czy dane dla docelowej jednostki zostały znalezione i przetworzone

    while (currentPageUrl && !targetUnitDataProcessed) {
      console.log(`API Route: Calling BDL API, page: ${currentPageUrl}`);
      
      const response: Response = await fetch(currentPageUrl, {
        headers: {
          'Accept': 'application/json',
          // Możesz dodać 'X-ClientId': 'TWOJ_KLUCZ_API' jeśli go posiadasz
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Route: BDL API request for ${currentPageUrl} failed with status ${response.status}: ${errorText}`);
        currentPageUrl = null; // Przerwij paginację dla tego roku w przypadku błędu strony
        continue;
      }

      const bdlData: any = await response.json();
      console.log(`API Route: BDL API response for ${currentPageUrl}:`, bdlData);

      if (bdlData && bdlData.results && Array.isArray(bdlData.results)) {
        for (const result of bdlData.results) { 
          if (result && result.values && Array.isArray(result.values) && (result.id === unitId || result.unitId === unitId)) {
            result.values.forEach((value: any) => { 
              allPrices.push({
                id: `${unitId}-${actualBdlApiVariableId}-${value.year}-${value.q || 'annual'}-${allPrices.length}`,
                name: result.name || unitId,
                year: parseInt(value.year, 10),
                quarter: value.q || null,
                price: parseFloat(value.val),
                unitMeasureName: result.measureUnitName || bdlData.measureUnitName || (clientVariableId === 'P3786' || clientVariableId === 'P3788' ? 'zł (transakcja)' : 'zł/m2'),
                bdlVariable: actualBdlApiVariableId,
              });
            });
            targetUnitDataProcessed = true; // Znaleziono i przetworzono dane dla docelowej jednostki
            break; 
          }
        }
      }

      if (targetUnitDataProcessed || !bdlData.links?.next) {
        currentPageUrl = null; // Zakończ paginację
      } else {
        currentPageUrl = bdlData.links.next;
      }
    }

    if (allPrices.length === 0) {
      // Jeśli nie ma danych po odpytaniu API dla wszystkich lat
      // Można zwrócić pustą tablicę lub informację o braku danych
      return NextResponse.json([], { status: 200 }); // Zwracamy pustą tablicę, frontend obsłuży
    }

    return NextResponse.json(allPrices);

  } catch (error) {
    console.error('API Route: Error fetching or processing data from BDL API:', error);
    // @ts-ignore
    return NextResponse.json({ error: 'Failed to fetch or process data from BDL API', details: error.message }, { status: 500 });
  }

  // Stara logika generowania danych testowych została usunięta
  // if (clientVariableId === 'P3786') { // Średnia cena transakcyjna - kwartalne
  // ...
  // } else if (clientVariableId === 'P3788') { // Mediana cen transakcyjnych - roczne
  // ...
  // }

  // Ten fragment nie powinien być osiągalny
  // return NextResponse.json({ error: 'Internal server error: Should not reach here.' }, { status: 500 });
} 