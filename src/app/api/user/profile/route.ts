import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7);
  }
  const cookie = req.cookies.get('session')?.value;
  return cookie ?? null;
}

function mapUser(u: any) {
  if (!u) return null;
  return {
    id: String(u.id),
    name: u.name ?? null,
    email: u.email,
    phone: u.phone ?? null,
    date_of_birth: u.date_of_birth ?? null,
    gender: u.gender ?? null,
    city: u.city ?? null,
    postal_code: u.postal_code ?? null,
    preferred_currency: u.preferred_currency ?? 'PLN',
    income_range: u.income_range ?? null,
    investment_experience: u.investment_experience ?? null,
    preferred_property_type: u.preferred_property_type ?? null,
    preferred_cities: u.preferred_cities ?? null,
    max_budget: u.max_budget ?? null,
    min_area: u.min_area ?? null,
    max_area: u.max_area ?? null,
    language: u.language ?? 'pl',
    theme: u.theme ?? 'light',
    company_name: u.company_name ?? null,
    nip: u.nip ?? null,
    business_address: u.business_address ?? null,
    created_at: u.created_at,
    updated_at: u.updated_at,
  };
}

export async function GET(req: NextRequest) {
  try {
    const token = getToken(req);
    if (!token) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }
    const session = await prisma.sessions.findFirst({
      where: { token, expires_at: { gt: new Date() } },
    });
    if (!session) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }
    const user = await prisma.users.findUnique({ where: { id: BigInt(session.user_id) } });
    if (!user) {
      return NextResponse.json({ error: 'Użytkownik nie istnieje' }, { status: 404 });
    }
    return NextResponse.json(mapUser(user));
  } catch (error) {
    console.error('Błąd podczas pobierania profilu:', error);
    return NextResponse.json({ error: 'Wewnętrzny błąd serwera' }, { status: 500 });
  }
}

const updateSchema = z.object({
  name: z.string().max(255).optional(),
  phone: z.string().max(20).optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  postal_code: z.string().max(10).optional(),
  preferred_currency: z.string().max(3).optional(),
  income_range: z.string().max(50).optional(),
  investment_experience: z.string().max(50).optional(),
  preferred_property_type: z.string().max(50).optional(),
  preferred_cities: z.string().optional(),
  max_budget: z.number().nullable().optional(),
  min_area: z.number().nullable().optional(),
  max_area: z.number().nullable().optional(),
  language: z.string().max(5).optional(),
  theme: z.string().max(10).optional(),
  company_name: z.string().max(255).optional(),
  nip: z.string().max(20).optional(),
  business_address: z.string().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const token = getToken(req);
    if (!token) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    const session = await prisma.sessions.findFirst({ where: { token, expires_at: { gt: new Date() } } });
    if (!session) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });

    const body = await req.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Nieprawidłowe dane' }, { status: 400 });
    }

    const data = parsed.data as Record<string, unknown>;
    // Konwersje pól daty
    if (data.date_of_birth && typeof data.date_of_birth === 'string') {
      data.date_of_birth = new Date(data.date_of_birth as string);
    }

    const updated = await prisma.users.update({
      where: { id: BigInt(session.user_id) },
      data: data as any,
    });

    return NextResponse.json(mapUser(updated));
  } catch (error) {
    console.error('Błąd podczas aktualizacji profilu:', error);
    return NextResponse.json({ error: 'Wewnętrzny błąd serwera' }, { status: 500 });
  }
}