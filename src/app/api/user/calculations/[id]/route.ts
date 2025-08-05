import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, AuthenticatedRequest, getCurrentUser } from '@/lib/authMiddleware';

interface RouteParams {
  params: {
    id: string;
  };
}

// Handler do pobierania szczegółów jednej kalkulacji
const getCalculationById = async (request: AuthenticatedRequest, { params }: RouteParams) => {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    const { id } = params;
    let calculationId: bigint;
    try {
      calculationId = BigInt(id);
    } catch (error) {
      console.error(`Błąd konwersji ID kalkulacji na BigInt: ${id}`, error);
      return NextResponse.json({ error: 'Nieprawidłowy identyfikator kalkulacji' }, { status: 400 });
    }

    const calculation = await prisma.property_calculations.findUnique({
      where: { id: calculationId },
    });

    // Sprawdź, czy kalkulacja istnieje
    if (!calculation) {
      return NextResponse.json({ error: 'Nie znaleziono kalkulacji' }, { status: 404 });
    }

    console.log('Pobrana kalkulacja z bazy:', {
      id: calculation.id,
      title: calculation.title,
      calculation_type: calculation.calculation_type,
      input_json_length: calculation.input_json?.length || 0,
      result_json_length: calculation.result_json?.length || 0,
      input_json_preview: calculation.input_json?.substring(0, 100),
      result_json_preview: calculation.result_json?.substring(0, 100),
    });

    // Sprawdź, czy kalkulacja należy do zalogowanego użytkownika
    let currentUserId: bigint;
    try {
      currentUserId = BigInt(currentUser.userId);
    } catch (error) {
      console.error(`Błąd konwersji ID użytkownika na BigInt: ${currentUser.userId}`, error);
      return NextResponse.json({ error: 'Błąd autoryzacji użytkownika' }, { status: 500 });
    }

    if (calculation.user_id !== currentUserId) {
      return NextResponse.json({ error: 'Brak dostępu do kalkulacji' }, { status: 403 });
    }

    // Zwróć pełne dane kalkulacji, parsując JSON
    let parsedInputJson = {};
    let parsedResultJson = {};

    try {
      console.log(`Próbuję parsować input_json: ${calculation.input_json}`);
      if (calculation.input_json && calculation.input_json.trim() !== '') {
        parsedInputJson = JSON.parse(calculation.input_json);
        console.log(`Pomyślnie sparsowano input_json:`, parsedInputJson);
      } else {
        console.log(`input_json jest pusty lub null`);
        parsedInputJson = {};
      }
    } catch (error) {
      console.error(`Błąd parsowania input_json dla kalkulacji ${id}:`, error);
      console.error(`Zawartość input_json: ${calculation.input_json}`);
      // Ustawiamy pusty obiekt jako fallback
      parsedInputJson = {};
      console.log(`Ustawiono pusty obiekt dla input_json`);
    }

    try {
      console.log(`Próbuję parsować result_json: ${calculation.result_json}`);
      if (calculation.result_json && calculation.result_json.trim() !== '') {
        parsedResultJson = JSON.parse(calculation.result_json);
        console.log(`Pomyślnie sparsowano result_json:`, parsedResultJson);
      } else {
        console.log(`result_json jest pusty lub null`);
        parsedResultJson = {};
      }
    } catch (error) {
      console.error(`Błąd parsowania result_json dla kalkulacji ${id}:`, error);
      console.error(`Zawartość result_json: ${calculation.result_json}`);
      // Ustawiamy pusty obiekt jako fallback
      parsedResultJson = {};
      console.log(`Ustawiono pusty obiekt dla result_json`);
    }

    // Konwersja BigInt na string z obsługą błędów
    let calculationIdStr: string;
    let userIdStr: string;
    
    try {
      calculationIdStr = calculation.id.toString();
    } catch (error) {
      console.error(`Błąd konwersji ID kalkulacji na string: ${calculation.id}`, error);
      calculationIdStr = 'error-converting-id';
    }
    
    try {
      userIdStr = calculation.user_id.toString();
    } catch (error) {
      console.error(`Błąd konwersji user_id na string: ${calculation.user_id}`, error);
      userIdStr = 'error-converting-user-id';
    }

    // Konwertujemy BigInt na string i parsujemy JSON
    const response = {
      id: calculationIdStr,
      user_id: userIdStr,
      title: calculation.title,
      created_at: calculation.created_at,
      updated_at: calculation.updated_at,
      calculation_type: calculation.calculation_type,
      input_json: parsedInputJson,
      result_json: parsedResultJson,
      // Dodajemy surowe dane dla debugowania
      raw_input_json: calculation.input_json,
      raw_result_json: calculation.result_json,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error(`Błąd podczas pobierania kalkulacji ${params.id}:`, error);
    
    // Dodajemy więcej szczegółów do logowania błędów
    if (error instanceof Error) {
      console.error(`Typ błędu: ${error.constructor.name}`);
      console.error(`Wiadomość: ${error.message}`);
      console.error(`Stack trace: ${error.stack}`);
    } else {
      console.error(`Nieznany typ błędu:`, error);
    }
    
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
};

// Handler do usuwania kalkulacji
const deleteCalculation = async (request: AuthenticatedRequest, { params }: RouteParams) => {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    const { id } = params;
    let calculationId: bigint;
    try {
      calculationId = BigInt(id);
    } catch (error) {
      console.error(`Błąd konwersji ID kalkulacji na BigInt: ${id}`, error);
      return NextResponse.json({ error: 'Nieprawidłowy identyfikator kalkulacji' }, { status: 400 });
    }

    // Sprawdź, czy kalkulacja istnieje i należy do użytkownika
    const calculation = await prisma.property_calculations.findUnique({
      where: { id: calculationId },
    });

    if (!calculation) {
      return NextResponse.json({ error: 'Nie znaleziono kalkulacji' }, { status: 404 });
    }

    let currentUserId: bigint;
    try {
      currentUserId = BigInt(currentUser.userId);
    } catch (error) {
      console.error(`Błąd konwersji ID użytkownika na BigInt: ${currentUser.userId}`, error);
      return NextResponse.json({ error: 'Błąd autoryzacji użytkownika' }, { status: 500 });
    }

    if (calculation.user_id !== currentUserId) {
      return NextResponse.json({ error: 'Brak dostępu do kalkulacji' }, { status: 403 });
    }

    // Usuń kalkulację
    await prisma.property_calculations.delete({
      where: { id: calculationId },
    });

    return NextResponse.json({ message: 'Kalkulacja została usunięta' });

  } catch (error) {
    console.error(`Błąd podczas usuwania kalkulacji ${params.id}:`, error);
    
    if (error instanceof Error) {
      console.error(`Typ błędu: ${error.constructor.name}`);
      console.error(`Wiadomość: ${error.message}`);
      console.error(`Stack trace: ${error.stack}`);
    } else {
      console.error(`Nieznany typ błędu:`, error);
    }
    
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
};

export const GET = withAuth(getCalculationById);
export const DELETE = withAuth(deleteCalculation);