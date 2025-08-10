import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { hashPassword, verifyPassword } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    const token = auth && auth.toLowerCase().startsWith('bearer ')
      ? auth.slice(7)
      : (req.cookies.get('session')?.value ?? null);
    if (!token) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    const session = await prisma.sessions.findFirst({ where: { token, expires_at: { gt: new Date() } } });
    if (!session) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });

    const { currentPassword, newPassword } = await req.json();

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

    const user = await prisma.users.findUnique({ where: { id: BigInt(session.user_id) } });
    if (!user) return NextResponse.json({ error: 'Użytkownik nie istnieje' }, { status: 404 });
    const ok = await verifyPassword(currentPassword, user.password_hash);
    if (!ok) return NextResponse.json({ error: 'Nieprawidłowe aktualne hasło' }, { status: 401 });
    const password_hash = await hashPassword(newPassword);
    await prisma.users.update({ where: { id: BigInt(user.id) }, data: { password_hash } });

    return NextResponse.json({ message: 'Hasło zostało pomyślnie zmienione' });
  } catch (error) {
    console.error('Błąd podczas zmiany hasła:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
} 