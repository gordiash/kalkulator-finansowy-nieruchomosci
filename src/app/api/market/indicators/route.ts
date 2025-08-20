import { NextResponse } from 'next/server';
import { fetchMarketIndicatorsSnapshot } from '@/lib/market/snapshot';
import { rateLimitMiddleware } from '@/lib/rateLimit';

export const revalidate = 3600; // 1h

export async function GET() {
	try {
		const data = await fetchMarketIndicatorsSnapshot();
		return NextResponse.json({ data }, { status: 200 });
	} catch (e) {
		return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Nie udało się pobrać wskaźników' } }, { status: 500 });
	}
}
