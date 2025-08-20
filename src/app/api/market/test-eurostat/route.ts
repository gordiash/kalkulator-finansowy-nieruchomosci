import { NextResponse } from 'next/server';
import { testEurostatConnection, fetchEurostatCpiHistory, fetchEurostatCpiLatest } from '@/lib/market/eurostat';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const test = searchParams.get('test') || 'connection';
    
    let results: any;
    
    switch (test) {
      case 'connection':
        results = await testEurostatConnection();
        break;
      case 'latest':
        results = await fetchEurostatCpiLatest();
        break;
      case 'history':
        const from = searchParams.get('from') || '2024-01-01';
        const to = searchParams.get('to') || '2024-12-01';
        results = await fetchEurostatCpiHistory(from, to);
        break;
      default:
        results = { error: 'Unknown test type. Available: connection, latest, history' };
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