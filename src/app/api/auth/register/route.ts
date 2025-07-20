import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Walidacja danych wejściowych
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email i hasło są wymagane' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Hasło musi mieć co najmniej 6 znaków' },
        { status: 400 }
      );
    }

    // Sprawdź czy użytkownik już istnieje
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Użytkownik o tym adresie email już istnieje' },
        { status: 409 }
      );
    }

    // Hashuj hasło
    const hashedPassword = await hashPassword(password);

    // Utwórz nowego użytkownika
    const user = await prisma.users.create({
      data: {
        email,
        password_hash: hashedPassword,
        name: name || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        created_at: true,
      },
    });

    // Wygeneruj token JWT
    const token = generateToken(user.id.toString(), user.email);

    // Zwróć token i dane użytkownika (konwertuj BigInt na Number)
    return NextResponse.json({
      token,
      user: {
        id: Number(user.id),
        email: user.email,
        name: user.name,
        created_at: user.created_at,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Błąd podczas rejestracji:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
} 