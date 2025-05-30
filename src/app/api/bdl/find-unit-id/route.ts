import { NextResponse } from 'next/server';

// Endpoint API do wyszukiwania identyfikatora jednostki w bazie BDL
// na podstawie jej nazwy. Zwraca identyfikator jednostki lub błąd.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const unitName = searchParams.get('unitName');

  if (!unitName) {
    return NextResponse.json({ error: 'Missing required query parameter: unitName' }, { status: 400 });
  }

  console.log(`API Route: Finding unit ID for unitName: ${unitName}`);

  try {
    const bdlApiUrl = `https://bdl.stat.gov.pl/api/v1/units/search?name=${encodeURIComponent(unitName)}&format=json`;
    console.log(`API Route: Calling BDL API: ${bdlApiUrl}`);

    const response = await fetch(bdlApiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Route: BDL API request failed with status ${response.status}: ${errorText}`);
      return NextResponse.json({ error: `BDL API request failed: ${response.statusText}`, details: errorText }, { status: response.status });
    }

    const data = await response.json();
    console.log('API Route: BDL API response data:', data);

    // Spodziewana struktura odpowiedzi to obiekt z kluczem "results" będącym tablicą jednostek,
    // lub bezpośrednio tablica jednostek. Każda jednostka powinna mieć pole "id".
    let foundUnitId: string | null = null;

    if (data && data.results && Array.isArray(data.results) && data.results.length > 0) {
      // Preferowane jest dokładne dopasowanie nazwy, ignorując wielkość liter
      const lowerUnitName = unitName.toLowerCase();
      const exactMatch = data.results.find((unit: any) => unit.name && unit.name.toLowerCase() === lowerUnitName);
      if (exactMatch && exactMatch.id) {
        foundUnitId = exactMatch.id;
        console.log(`API Route: Found exact match unit ID: ${foundUnitId} for unit: ${exactMatch.name}`);
      } else if (data.results[0] && data.results[0].id) {
        // Jeśli nie ma dokładnego dopasowania, weź pierwszy wynik
        foundUnitId = data.results[0].id;
        console.log(`API Route: Found unit ID (first result): ${foundUnitId} for unit: ${data.results[0].name}`);
      }
    } else if (Array.isArray(data) && data.length > 0 && data[0] && data[0].id) {
      // Alternatywna struktura: bezpośrednio tablica
      const lowerUnitName = unitName.toLowerCase();
      const exactMatch = data.find((unit: any) => unit.name && unit.name.toLowerCase() === lowerUnitName);
       if (exactMatch && exactMatch.id) {
        foundUnitId = exactMatch.id;
        console.log(`API Route: Found exact match unit ID (direct array): ${foundUnitId} for unit: ${exactMatch.name}`);
      } else {
        foundUnitId = data[0].id;
        console.log(`API Route: Found unit ID (first result, direct array): ${foundUnitId} for unit: ${data[0].name}`);
      }
    }

    if (foundUnitId) {
      return NextResponse.json({ unitId: foundUnitId });
    } else {
      console.log('API Route: Unit ID not found in BDL API response for the given name.');
      return NextResponse.json({ error: 'Unit ID not found for the given name in BDL API' }, { status: 404 });
    }

  } catch (error) {
    console.error('API Route: Error fetching unit ID from BDL API:', error);
    // @ts-ignore
    return NextResponse.json({ error: 'Failed to fetch unit ID from BDL API', details: error.message }, { status: 500 });
  }
} 