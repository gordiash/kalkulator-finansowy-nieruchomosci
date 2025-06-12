import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Przekierowanie na backend PHP na porcie 8000
    const phpResponse = await fetch('http://localhost:8000/api/calculate.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!phpResponse.ok) {
      throw new Error(`Backend PHP zwrócił błąd: ${phpResponse.status}`);
    }

    const result = await phpResponse.json();
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Błąd proxy do PHP backendu:', error);
    return NextResponse.json(
      { error: 'Błąd połączenia z backendem' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 