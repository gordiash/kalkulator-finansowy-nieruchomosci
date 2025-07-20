import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, AuthenticatedRequest, getCurrentUser } from '@/lib/authMiddleware';
import { comparePassword, hashPassword } from '@/lib/jwt';

const changePassword = async (request: AuthenticatedRequest) => {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    // Walidacja danych wejściowych
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Aktualne hasło i nowe hasło są wymagane' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Nowe hasło musi mieć co najmniej 6 znaków' },
        { status: 400 }
      );
    }

    // Pobierz aktualny hash hasła użytkownika
    const user = await prisma.users.findUnique({
      where: { id: BigInt(currentUser.userId) },
      select: {
        id: true,
        password_hash: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Użytkownik nie znaleziony' }, { status: 404 });
    }

    // Sprawdź czy aktualne hasło jest poprawne
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Aktualne hasło jest nieprawidłowe' },
        { status: 400 }
      );
    }

    // Hashuj nowe hasło
    const hashedNewPassword = await hashPassword(newPassword);

    // Aktualizuj hasło w bazie danych
    await prisma.users.update({
      where: { id: BigInt(currentUser.userId) },
      data: {
        password_hash: hashedNewPassword,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ message: 'Hasło zostało pomyślnie zmienione' });
  } catch (error) {
    console.error('Błąd podczas zmiany hasła:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
};

export const POST = withAuth(changePassword); 