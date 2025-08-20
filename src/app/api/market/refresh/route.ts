import { NextResponse } from 'next/server';
import { fetchNBPIndicatorsSnapshot } from '@/lib/market/nbp';
import { fetchCpiYoYLatest } from '@/lib/market/gus';
import { upsertObservation, upsertSeries } from '@/lib/market/store';

export async function POST() {
	try {
		const snapshot = await fetchNBPIndicatorsSnapshot();
		const cpi = await fetchCpiYoYLatest();
		const all = [...snapshot, ...(cpi ? [cpi] : [])];

		for (const item of all) {
			const series = await upsertSeries(item.key, item.name, item.unit, item.unit === '%' ? 'monthly' : 'daily', item.source);
			if ((series as any)?.id) {
				await upsertObservation((series as any).id, new Date(item.date), item.value);
			}
		}

		return NextResponse.json({ ok: true, count: all.length });
	} catch (e) {
		return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Refresh failed' } }, { status: 500 });
	}
}
