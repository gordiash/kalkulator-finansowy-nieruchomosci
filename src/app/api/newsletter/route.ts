import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

export async function POST(request: NextRequest) {
  try {
    // Sprawdź czy zmienne środowiskowe są ustawione
    if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN || !AIRTABLE_TABLE_NAME) {
      console.error('Missing Airtable configuration:', {
        baseId: !!AIRTABLE_BASE_ID,
        token: !!AIRTABLE_TOKEN,
        tableName: !!AIRTABLE_TABLE_NAME
      });
      return NextResponse.json(
        { error: 'Konfiguracja serwera jest niepełna. Skontaktuj się z administratorem.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    // Normalizacja emaila – usuń spacje i zamień na małe litery
    const rawEmail: string = body.email ?? '';
    const normalizedEmail = rawEmail.trim().toLowerCase();
    const { source = 'popup' } = body;

    // Walidacja email
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Podaj prawidłowy adres email' },
        { status: 400 }
      );
    }

    // === SPRAWDZENIE CZY EMAIL JUŻ ISTNIEJE W BAZIE ===
    try {
      const emailFilterFormula = `LOWER({Email}) = "${normalizedEmail}"`;
      const emailFilter = encodeURIComponent(emailFilterFormula);
      const duplicateCheckUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula=${emailFilter}&maxRecords=1`;

      // Debug: wyświetl zapytanie duplicate-check w logach (bez tokena)
      console.log('[Newsletter] Duplicate check URL:', duplicateCheckUrl);

      const checkResponse = await fetch(duplicateCheckUrl, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        },
      });

      if (!checkResponse.ok) {
        const errorText = await checkResponse.text();
        console.error('Błąd podczas sprawdzania duplikatu w Airtable:', errorText);
        return NextResponse.json({ error: 'Błąd konfiguracji serwera. Skontaktuj się z administratorem.' }, { status: 500 });
      } else {
        const checkData = await checkResponse.json();
        console.log('[Newsletter] Duplicate check result count:', checkData.records?.length ?? 0);

        if (checkData.records && checkData.records.length > 0) {
          // Email już istnieje – zwróć 409
          return NextResponse.json(
            { error: 'Ten adres email jest już zapisany w naszym newsletterze' },
            { status: 409 }
          );
        }
      }
    } catch (duplicateError) {
      console.error('Duplicate check error:', duplicateError);
      // Nie blokuj rejestracji jeśli sprawdzenie się nie powiodło – kontynuuj
    }

    // Dodanie do Airtable
    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                'Email': normalizedEmail,
                'Source': source,
                'Created': new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
                'Status': 'Active'
              }
            }
          ]
        })
      }
    );

    if (!airtableResponse.ok) {
      const errorData = await airtableResponse.json();
      console.error('Airtable error:', errorData);
      
      // Różne typy błędów Airtable
      switch (errorData.error?.type) {
        case 'INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND':
          return NextResponse.json(
            { error: 'Błąd konfiguracji serwera. Skontaktuj się z administratorem.' },
            { status: 500 }
          );
        
        case 'UNKNOWN_FIELD_NAME':
          console.error('Airtable field configuration error. Check field names in table.');
          return NextResponse.json(
            { error: 'Błąd konfiguracji bazy danych. Skontaktuj się z administratorem.' },
            { status: 500 }
          );
        
        case 'INVALID_REQUEST_UNKNOWN':
          if (errorData.error?.message && errorData.error.message.includes('duplicate')) {
            return NextResponse.json(
              { error: 'Ten adres email jest już zapisany w naszym newsletterze' },
              { status: 409 }
            );
          }
          break;
      }
      
      return NextResponse.json(
        { error: 'Wystąpił błąd podczas zapisu. Spróbuj ponownie.' },
        { status: 500 }
      );
    }

    const data = await airtableResponse.json();
    
    return NextResponse.json({
      success: true,
      message: 'Dziękujemy za zapisanie się do newslettera!',
      recordId: data.records[0]?.id
    });

  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json(
      { error: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.' },
      { status: 500 }
    );
  }
} 