import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, AuthenticatedRequest, getCurrentUser } from '@/lib/authMiddleware';

const getProfile = async (request: AuthenticatedRequest) => {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    // Pobranie danych użytkownika z bazy
    const user = await prisma.users.findUnique({
      where: { id: BigInt(currentUser.userId) },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Użytkownik nie znaleziony' }, { status: 404 });
    }

    // Konwertuj BigInt na Number dla JSON
    const userResponse = {
      ...user,
      id: Number(user.id),
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Błąd podczas pobierania profilu:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
};

const updateProfile = async (request: AuthenticatedRequest) => {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    const { name } = await request.json();

    // Walidacja danych
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Imię jest wymagane' },
        { status: 400 }
      );
    }

    // Aktualizacja danych użytkownika
    const updatedUser = await prisma.users.update({
      where: { id: BigInt(currentUser.userId) },
      data: {
        name: name.trim(),
        updated_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Konwertuj BigInt na Number dla JSON
    const userResponse = {
      ...updatedUser,
      id: Number(updatedUser.id),
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Błąd podczas aktualizacji profilu:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
};

export const GET = withAuth(getProfile);
export const PUT = withAuth(updateProfile); 