import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (auth && auth.toLowerCase().startsWith('bearer ')) return auth.slice(7);
  return req.cookies.get('session')?.value ?? null;
}

function toBigInt(value: unknown): bigint {
  return typeof value === 'bigint' ? value : BigInt(String(value));
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const token = getToken(req);
    if (!token) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    const session = await prisma.sessions.findFirst({ where: { token, expires_at: { gt: new Date() } } });
    if (!session) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });

    const calc = await prisma.property_calculations.findFirst({
      where: { id: toBigInt(id), user_id: toBigInt(session.user_id) },
    });
    if (!calc) return NextResponse.json({ error: 'Kalkulacja nie znaleziona' }, { status: 404 });
    const mapped = {
      id: String(calc.id),
      user_id: String(calc.user_id),
      title: calc.title,
      calculation_type: calc.calculation_type,
      input_json: calc.input_json,
      result_json: calc.result_json,
      created_at: calc.created_at,
      updated_at: calc.updated_at,
    };
    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Błąd podczas pobierania kalkulacji:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const token = getToken(req);
    if (!token) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    const session = await prisma.sessions.findFirst({ where: { token, expires_at: { gt: new Date() } } });
    if (!session) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });

    await prisma.property_calculations.delete({ where: { id: BigInt(id) } });
    return NextResponse.json({ message: 'Kalkulacja została pomyślnie usunięta' });
  } catch (error) {
    console.error('Błąd podczas usuwania kalkulacji:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
}