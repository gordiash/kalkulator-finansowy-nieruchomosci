import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/jwt';
import { rateLimitMiddleware } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    // Rate limiting - 3 próby na godzinę dla rejestracji
    const rateLimitResult = rateLimitMiddleware(3, 3600000)(request as any);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    const body = await request.json();
    const { email, password, name, timestamp, userAgent, screenResolution, timezone } = body;

    // Sprawdź nagłówki zabezpieczeń
    const requestedWith = request.headers.get('X-Requested-With');
    const requestTimestamp = request.headers.get('X-Timestamp');
    
    if (!requestedWith || requestedWith !== 'XMLHttpRequest') {
      return NextResponse.json(
        { error: 'Nieprawidłowe żądanie' },
        { status: 400 }
      );
    }

    // Sprawdź timestamp
    if (requestTimestamp) {
      const timestampDiff = Date.now() - parseInt(requestTimestamp);
      if (timestampDiff > 300000) { // 5 minut
        return NextResponse.json(
          { error: 'Żądanie wygasło' },
          { status: 400 }
        );
      }
    }

    // Sprawdź User-Agent
    if (!userAgent || userAgent.length < 10) {
      return NextResponse.json(
        { error: 'Nieprawidłowy User-Agent' },
        { status: 400 }
      );
    }

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
    const token = generateToken({
      userId: user.id.toString(),
      email: user.email
    });

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