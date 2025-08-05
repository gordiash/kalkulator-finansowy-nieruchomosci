import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
  };
}

// Middleware do autoryzacji
export function withAuth(handler: (request: AuthenticatedRequest, context?: any) => Promise<NextResponse>) {
  return async (request: AuthenticatedRequest, context?: any) => {
    try {
      const token = request.headers.get('authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return NextResponse.json({ error: 'Brak tokenu autoryzacyjnego' }, { status: 401 });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Nieprawidłowy token' }, { status: 401 });
      }

      request.user = {
        userId: decoded.userId,
        email: decoded.email,
      };

      return handler(request, context);
    } catch (error) {
      console.error('Błąd autoryzacji:', error);
      return NextResponse.json({ error: 'Błąd autoryzacji' }, { status: 401 });
    }
  };
}

// Funkcja do pobierania aktualnego użytkownika
export function getCurrentUser(request: AuthenticatedRequest) {
  return request.user;
} 