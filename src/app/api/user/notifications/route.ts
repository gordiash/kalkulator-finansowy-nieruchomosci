import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, AuthenticatedRequest, getCurrentUser } from '@/lib/authMiddleware';

// Pobieranie ustawień powiadomień
const getNotificationSettings = async (request: AuthenticatedRequest) => {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { id: BigInt(currentUser.userId) },
      select: {
        newsletter_subscription: true,
        email_notifications: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Użytkownik nie znaleziony' }, { status: 404 });
    }

    return NextResponse.json({
      newsletter_subscription: user.newsletter_subscription ?? true,
      email_notifications: user.email_notifications ?? true,
    });
  } catch (error) {
    console.error('Błąd podczas pobierania ustawień powiadomień:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
};

// Aktualizacja ustawień powiadomień
const updateNotificationSettings = async (request: AuthenticatedRequest) => {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    const { newsletter_subscription, email_notifications } = await request.json();

    // Walidacja ustawień powiadomień
    const validationErrors: string[] = [];

    // 1. Walidacja newsletter_subscription
    if (newsletter_subscription !== undefined && typeof newsletter_subscription !== 'boolean') {
      validationErrors.push('Nieprawidłowa wartość dla subskrypcji newslettera');
    }

    // 2. Walidacja email_notifications
    if (email_notifications !== undefined && typeof email_notifications !== 'boolean') {
      validationErrors.push('Nieprawidłowa wartość dla powiadomień email');
    }

    // Jeśli są błędy walidacji, zwróć je wszystkie
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Błędy walidacji ustawień powiadomień',
          details: validationErrors 
        },
        { status: 400 }
      );
    }

    // Przygotowanie danych do aktualizacji
    const updateData: any = {
      updated_at: new Date(),
    };

    if (newsletter_subscription !== undefined) {
      updateData.newsletter_subscription = newsletter_subscription;
    }

    if (email_notifications !== undefined) {
      updateData.email_notifications = email_notifications;
    }

    // Aktualizacja danych użytkownika
    const updatedUser = await prisma.users.update({
      where: { id: BigInt(currentUser.userId) },
      data: updateData,
      select: {
        newsletter_subscription: true,
        email_notifications: true,
      },
    });

    return NextResponse.json({
      newsletter_subscription: updatedUser.newsletter_subscription ?? true,
      email_notifications: updatedUser.email_notifications ?? true,
    });
  } catch (error) {
    console.error('Błąd podczas aktualizacji ustawień powiadomień:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
};

export const GET = withAuth(getNotificationSettings);
export const PUT = withAuth(updateNotificationSettings); 