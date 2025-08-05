import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, AuthenticatedRequest, getCurrentUser } from '@/lib/authMiddleware';

// Handler do pobierania listy kalkulacji użytkownika
const getCalculations = async (request: AuthenticatedRequest) => {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    const calculations = await prisma.property_calculations.findMany({
      where: { user_id: BigInt(currentUser.userId) },
      orderBy: { created_at: 'desc' },
    });

    // Konwertuj BigInt na string dla bezpiecznej serializacji
    const response = calculations.map(calc => ({
      ...calc,
      id: calc.id.toString(),
      user_id: calc.user_id.toString(),
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Błąd podczas pobierania kalkulacji:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
};

// Handler do zapisywania nowej kalkulacji
const createCalculation = async (request: AuthenticatedRequest) => {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    const body = await request.json();
    const { title, calculationType, input_json, result_json } = body;

    if (!title || !calculationType || !input_json || !result_json) {
      return NextResponse.json({ error: 'Brak wszystkich wymaganych danych' }, { status: 400 });
    }

    const newCalculation = await prisma.property_calculations.create({
      data: {
        user_id: BigInt(currentUser.userId),
        title,
        calculation_type: calculationType,
        input_json: JSON.stringify(input_json),
        result_json: JSON.stringify(result_json),
      }
    });

    return NextResponse.json({ 
        message: 'Kalkulacja zapisana pomyślnie', 
        calculationId: newCalculation.id.toString()
    }, { status: 201 });

  } catch (error) {
    console.error('Błąd podczas zapisywania kalkulacji:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
};

export const GET = withAuth(getCalculations);
export const POST = withAuth(createCalculation); 