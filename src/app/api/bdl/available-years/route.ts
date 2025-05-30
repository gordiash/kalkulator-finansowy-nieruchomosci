import { NextResponse } from 'next/server';

// Ta funkcja będzie musiała zostać dostosowana do rzeczywistej logiki pobierania danych.
// Na potrzeby tego przykładu, zwracamy przykładowe dane.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const variableId = searchParams.get('variableId');

  if (!variableId) {
    return NextResponse.json({ error: 'Missing required query parameter: variableId' }, { status: 400 });
  }

  console.log(`API Route: Fetching available years for variableId: ${variableId}`);

  // Przykładowa logika - ZASTĄP RZECZYWISTĄ IMPLEMENTACJĄ
  // Tutaj powinna znaleźć się logika komunikacji z API GUS BDL
  // aby pobrać dostępne lata dla danego wskaźnika.

  // Symulacja pobierania danych
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return NextResponse.json(years);
} 