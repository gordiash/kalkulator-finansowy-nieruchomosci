import { NextResponse } from 'next/server';
import { fetchNBPInflationData, fetchNBPInflationHistory, fetchNBPCoreInflationHistory } from '@/lib/market/nbp';
import { rateLimitMiddleware } from '@/lib/rateLimit';

export const revalidate = 3600; // 1h

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const type = searchParams.get('type');
		const months = searchParams.get('months');
		
		// Sprawdź rate limiting
		const limited = rateLimitMiddleware(60, 60_000)(request as any);
		if (limited) return limited;

		let data: any;

		switch (type) {
			case 'current':
				// Pobierz aktualne dane o inflacji
				data = await fetchNBPInflationData();
				break;
			case 'cpi_history':
				// Pobierz historię inflacji CPI
				const cpiMonths = months ? parseInt(months) : 24;
				data = await fetchNBPInflationHistory(cpiMonths);
				break;
			case 'core_history':
				// Pobierz historię inflacji bazowej
				const coreMonths = months ? parseInt(months) : 24;
				data = await fetchNBPCoreInflationHistory(coreMonths);
				break;
			default:
				// Domyślnie zwróć aktualne dane
				data = await fetchNBPInflationData();
		}

		if (!data) {
			return NextResponse.json(
				{ error: { code: 'NO_DATA', message: 'Brak danych o inflacji' } },
				{ status: 404 }
			);
		}

		return NextResponse.json({ data }, { status: 200 });
	} catch (error) {
		console.error('Błąd podczas pobierania danych o inflacji:', error);
		return NextResponse.json(
			{ error: { code: 'INTERNAL_ERROR', message: 'Nie udało się pobrać danych o inflacji' } },
			{ status: 500 }
		);
	}
}
