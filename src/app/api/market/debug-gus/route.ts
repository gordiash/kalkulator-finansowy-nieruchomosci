import { NextResponse } from 'next/server';

const BDL_BASE = 'https://bdl.stat.gov.pl/api/v1';

function getApiKey(): string | undefined {
  return process.env.GUS_BDL_API_KEY;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'all';
    
    const apiKey = getApiKey();
    const headers: Record<string, string> = { 
      'Accept': 'application/json', 
      ...(apiKey ? { 'X-ClientId': apiKey } : {}) 
    };
    
    const results: any = {
      hasApiKey: !!apiKey,
      apiKeyPreview: apiKey ? `${apiKey.substring(0, 8)}...` : null,
      tests: {}
    };
    
    if (action === 'all' || action === 'units') {
      // Sprawdź dostępne jednostki terytorialne na poziomie krajowym
      try {
        const unitsUrl = `${BDL_BASE}/units?level=0&format=json&page-size=10`;
        console.log(`[DEBUG GUS] Fetching units: ${unitsUrl}`);
        
        const res = await fetch(unitsUrl, { headers, signal: AbortSignal.timeout(10000) });
        
        if (res.ok) {
          const json = await res.json();
          results.tests.units = {
            status: 'SUCCESS',
            count: json?.results?.length || 0,
            results: json?.results || []
          };
        } else {
          const errorText = await res.text();
          results.tests.units = {
            status: 'ERROR',
            httpStatus: res.status,
            error: errorText
          };
        }
      } catch (error) {
        results.tests.units = {
          status: 'EXCEPTION',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    
    if (action === 'all' || action === 'variables') {
      // Sprawdź zmienne związane z cenami
      try {
        const variablesUrl = `${BDL_BASE}/variables?subject-id=P2955&format=json&page-size=20`;
        console.log(`[DEBUG GUS] Fetching variables: ${variablesUrl}`);
        
        const res = await fetch(variablesUrl, { headers, signal: AbortSignal.timeout(10000) });
        
        if (res.ok) {
          const json = await res.json();
          results.tests.variables = {
            status: 'SUCCESS',
            count: json?.results?.length || 0,
            results: json?.results || []
          };
        } else {
          const errorText = await res.text();
          results.tests.variables = {
            status: 'ERROR',
            httpStatus: res.status,
            error: errorText
          };
        }
      } catch (error) {
        results.tests.variables = {
          status: 'EXCEPTION',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    
    if (action === 'all' || action === 'subjects') {
      // Sprawdź dostępne tematy
      try {
        const subjectsUrl = `${BDL_BASE}/subjects?format=json&page-size=20`;
        console.log(`[DEBUG GUS] Fetching subjects: ${subjectsUrl}`);
        
        const res = await fetch(subjectsUrl, { headers, signal: AbortSignal.timeout(10000) });
        
        if (res.ok) {
          const json = await res.json();
          results.tests.subjects = {
            status: 'SUCCESS',
            count: json?.results?.length || 0,
            results: json?.results?.filter((s: any) => 
              s?.name?.toLowerCase().includes('cen') || 
              s?.name?.toLowerCase().includes('inflac') ||
              s?.name?.toLowerCase().includes('konsump')
            ) || []
          };
        } else {
          const errorText = await res.text();
          results.tests.subjects = {
            status: 'ERROR',
            httpStatus: res.status,
            error: errorText
          };
        }
      } catch (error) {
        results.tests.subjects = {
          status: 'EXCEPTION',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    
    if (action === 'all' || action === 'test-data') {
      // Sprawdź czy możemy pobrać jakiekolwiek dane dla Polski
      const testVariables = ['42169', '217230', '42170'];
      
      for (const varId of testVariables) {
        try {
          const dataUrl = `${BDL_BASE}/data/by-unit/000000000000?var-id=${varId}&format=json&page-size=5`;
          console.log(`[DEBUG GUS] Testing data for variable ${varId}: ${dataUrl}`);
          
          const res = await fetch(dataUrl, { headers, signal: AbortSignal.timeout(10000) });
          
          if (res.ok) {
            const json = await res.json();
            results.tests[`data_${varId}`] = {
              status: 'SUCCESS',
              totalRecords: json?.totalRecords || 0,
              unitName: json?.unitName || null,
              resultsCount: json?.results?.length || 0,
              sampleResult: json?.results?.[0] || null
            };
          } else {
            const errorText = await res.text();
            results.tests[`data_${varId}`] = {
              status: 'ERROR',
              httpStatus: res.status,
              error: errorText
            };
          }
        } catch (error) {
          results.tests[`data_${varId}`] = {
            status: 'EXCEPTION',
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
    }
    
    return NextResponse.json(results);
    
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}