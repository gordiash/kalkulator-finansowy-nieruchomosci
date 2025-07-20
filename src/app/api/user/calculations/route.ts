import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, AuthenticatedRequest, getCurrentUser } from '@/lib/authMiddleware';

const getCalculations = async (request: AuthenticatedRequest) => {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    // Pobierz parametry paginacji z URL
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const type = url.searchParams.get('type'); // filtruj po typie kalkulatora
    const skip = (page - 1) * limit;

    // Walidacja parametrów
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Nieprawidłowe parametry paginacji' },
        { status: 400 }
      );
    }

    // Zbuduj warunki where
    const whereConditions: any = {
      user_id: BigInt(currentUser.userId),
    };

    if (type) {
      whereConditions.calculation_type = type;
    }

    // Pobierz kalkulacje użytkownika z paginacją
    const [calculations, totalCount] = await Promise.all([
      prisma.property_calculations.findMany({
        where: whereConditions,
        select: {
          id: true,
          title: true,
          calculation_type: true,
          input_json: true,
          result_json: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.property_calculations.count({
        where: whereConditions,
      }),
    ]);

    // Konwertuj BigInt na string i sparsuj JSON
    const processedCalculations = calculations.map(calculation => ({
      id: calculation.id.toString(),
      title: calculation.title,
      calculation_type: calculation.calculation_type,
      input_json: calculation.input_json ? JSON.parse(calculation.input_json) : null,
      result_json: calculation.result_json ? JSON.parse(calculation.result_json) : null,
      created_at: calculation.created_at,
      updated_at: calculation.updated_at,
    }));

    // Oblicz metadane paginacji
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      calculations: processedCalculations,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error) {
    console.error('Błąd podczas pobierania historii kalkulacji:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
};

const createCalculation = async (request: AuthenticatedRequest) => {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    const { title, calculation_type, input_json, result_json } = await request.json();

    // Walidacja danych wejściowych
    if (!calculation_type || !input_json || !result_json) {
      return NextResponse.json(
        { error: 'Typ kalkulacji, parametry wejściowe i wynik są wymagane' },
        { status: 400 }
      );
    }

    // Walidacja typu kalkulacji
    const validTypes = ['purchase', 'rental', 'creditScore', 'valuation'];
    if (!validTypes.includes(calculation_type)) {
      return NextResponse.json(
        { error: 'Nieprawidłowy typ kalkulacji' },
        { status: 400 }
      );
    }

    // Zapisz nową kalkulację
    const calculation = await prisma.property_calculations.create({
      data: {
        user_id: BigInt(currentUser.userId),
        title: title || `Kalkulacja ${calculation_type}`,
        calculation_type,
        input_json: JSON.stringify(input_json),
        result_json: JSON.stringify(result_json),
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

    // Konwertuj BigInt na string i sparsuj JSON
    const processedCalculation = {
      id: calculation.id.toString(),
      title: calculation.title,
      calculation_type: calculation.calculation_type,
      input_json: JSON.parse(calculation.input_json || '{}'),
      result_json: JSON.parse(calculation.result_json || '{}'),
      created_at: calculation.created_at,
      updated_at: calculation.updated_at,
    };

    return NextResponse.json(processedCalculation, { status: 201 });
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