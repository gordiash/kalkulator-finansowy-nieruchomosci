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

    const type = new URL(req.url).searchParams.get('type') ?? undefined;
    const list = await prisma.property_calculations.findMany({
      where: { user_id: BigInt(session.user_id), calculation_type: type ?? undefined },
      orderBy: { created_at: 'desc' },
    });
    const mapped = list.map((c) => ({
      id: String(c.id),
      user_id: String(c.user_id),
      title: c.title,
      calculation_type: c.calculation_type,
      input_json: c.input_json,
      result_json: c.result_json,
      created_at: c.created_at,
      updated_at: c.updated_at,
    }));
    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Błąd podczas pobierania kalkulacji:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getToken(req);
    if (!token) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    const session = await prisma.sessions.findFirst({ where: { token, expires_at: { gt: new Date() } } });
    if (!session) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });

    const body = await req.json();
    const created = await prisma.property_calculations.create({
      data: {
        user_id: BigInt(session.user_id),
        title: body.title ?? null,
        calculation_type: body.calculationType ?? null,
        input_json: JSON.stringify(body.input_json ?? body.input ?? {}),
        result_json: JSON.stringify(body.result_json ?? body.result ?? {}),
      },
    });

    const mapped = {
      id: String(created.id),
      user_id: String(created.user_id),
      title: created.title,
      calculation_type: created.calculation_type,
      input_json: created.input_json,
      result_json: created.result_json,
      created_at: created.created_at,
      updated_at: created.updated_at,
    };

    return NextResponse.json({ message: 'Kalkulacja została pomyślnie zapisana', calculation: mapped });
  } catch (error) {
    console.error('Błąd podczas zapisywania kalkulacji:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
} 