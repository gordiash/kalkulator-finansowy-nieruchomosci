import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/jwt';
import { rateLimitMiddleware } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    // Rate limiting - 5 prób na minutę dla logowania
    const rateLimitResult = rateLimitMiddleware(5, 60000)(request as any);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    const body = await request.json();
    const { email, password, timestamp, userAgent } = body;

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

    // Znajdź użytkownika
    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password_hash: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Nieprawidłowy email lub hasło' },
        { status: 401 }
      );
    }

    // Sprawdź hasło
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Nieprawidłowy email lub hasło' },
        { status: 401 }
      );
    }

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
      },
    });
  } catch (error) {
    console.error('Błąd podczas logowania:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
} 