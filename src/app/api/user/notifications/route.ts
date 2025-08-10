import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (auth && auth.toLowerCase().startsWith('bearer ')) return auth.slice(7);
  return req.cookies.get('session')?.value ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const token = getToken(req);
    if (!token) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    const session = await prisma.sessions.findFirst({ where: { token, expires_at: { gt: new Date() } } });
    if (!session) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });

    const user = await prisma.users.findUnique({ where: { id: BigInt(session.user_id) } });
    if (!user) return NextResponse.json({ error: 'Użytkownik nie istnieje' }, { status: 404 });

    return NextResponse.json({
      newsletter_subscription: user.newsletter_subscription ?? false,
      email_notifications: user.email_notifications ?? true,
    });
  } catch (error) {
    console.error('Błąd podczas pobierania ustawień powiadomień:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = getToken(req);
    if (!token) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    const session = await prisma.sessions.findFirst({ where: { token, expires_at: { gt: new Date() } } });
    if (!session) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });

    const { newsletter_subscription = false, email_notifications = true } = await req.json();
    const updated = await prisma.users.update({
      where: { id: BigInt(session.user_id) },
      data: { newsletter_subscription, email_notifications },
    });

    return NextResponse.json({
      message: 'Ustawienia powiadomień zostały pomyślnie zaktualizowane',
      newsletter_subscription: updated.newsletter_subscription ?? false,
      email_notifications: updated.email_notifications ?? true,
    });
  } catch (error) {
    console.error('Błąd podczas aktualizacji ustawień powiadomień:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
} 