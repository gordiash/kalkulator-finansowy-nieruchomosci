import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, AuthenticatedRequest, getCurrentUser } from '@/lib/authMiddleware';

const getCalculation = async (request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    const resolvedParams = await params;
    const calculationId = BigInt(resolvedParams.id);
    
    // Pobierz kalkulację użytkownika
    const calculation = await prisma.property_calculations.findFirst({
      where: {
        id: calculationId,
        user_id: BigInt(currentUser.userId),
      },
      select: {
        id: true,
        title: true,
        calculation_type: true,
        input_json: true,
        result_json: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!calculation) {
      return NextResponse.json({ error: 'Kalkulacja nie znaleziona' }, { status: 404 });
    }

    // Konwertuj BigInt na string i sparsuj JSON
    const processedCalculation = {
      id: calculation.id.toString(),
      title: calculation.title,
      calculation_type: calculation.calculation_type,
      input_json: calculation.input_json ? JSON.parse(calculation.input_json) : null,
      result_json: calculation.result_json ? JSON.parse(calculation.result_json) : null,
      created_at: calculation.created_at,
      updated_at: calculation.updated_at,
    };

    return NextResponse.json(processedCalculation);
  } catch (error) {
    console.error('Błąd podczas pobierania kalkulacji:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
};

const deleteCalculation = async (request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    const resolvedParams = await params;
    const calculationId = BigInt(resolvedParams.id);
    
    // Sprawdź czy kalkulacja istnieje i należy do użytkownika
    const calculation = await prisma.property_calculations.findFirst({
      where: {
        id: calculationId,
        user_id: BigInt(currentUser.userId),
      },
    });

    if (!calculation) {
      return NextResponse.json({ error: 'Kalkulacja nie znaleziona' }, { status: 404 });
    }

    // Usuń kalkulację
    await prisma.property_calculations.delete({
      where: {
        id: calculationId,
      },
    });

    return NextResponse.json({ message: 'Kalkulacja została usunięta' });
  } catch (error) {
    console.error('Błąd podczas usuwania kalkulacji:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
};

export const GET = (request: Request, context: { params: Promise<{ id: string }> }) => 
  withAuth((req: AuthenticatedRequest) => getCalculation(req, context))(request);

export const DELETE = (request: Request, context: { params: Promise<{ id: string }> }) => 
  withAuth((req: AuthenticatedRequest) => deleteCalculation(req, context))(request); 