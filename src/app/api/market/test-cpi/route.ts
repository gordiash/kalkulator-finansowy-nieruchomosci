import { NextResponse } from 'next/server';
import { 
  testGusBdlConnection, 
  testGusBdlVariables, 
  fetchMonthlyCpiDataAlternative, 
  searchGusBdlForCpiVariables,
  testCpiDataCombinations,
  testVariable64513
} from '@/lib/market/gus';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const test = searchParams.get('test') || 'connection';
    
    let results: any;
    
    switch (test) {
      case 'connection':
        results = await testGusBdlConnection();
        break;
      case 'variables':
        results = await testGusBdlVariables();
        break;
      case 'search':
        results = await searchGusBdlForCpiVariables();
        break;
      case 'combinations':
        const from = searchParams.get('from') || '2024-01-01';
        const to = searchParams.get('to') || '2024-12-01';
        results = await testCpiDataCombinations(from, to);
        break;
      case '64513':
        const test64513From = searchParams.get('from') || '2024-08-17';
        const test64513To = searchParams.get('to') || '2025-08-17';
        results = await testVariable64513(test64513From, test64513To);
        break;
      case 'data':
        const dataFrom = searchParams.get('from') || '2023-01-01';
        const dataTo = searchParams.get('to') || '2024-12-01';
        results = await fetchMonthlyCpiDataAlternative(dataFrom, dataTo);
        break;
      default:
        results = { error: 'Unknown test type. Available: connection, variables, search, combinations, 64513, data' };
    }
    
    return NextResponse.json({ 
      success: true,
      test,
      data: results 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}