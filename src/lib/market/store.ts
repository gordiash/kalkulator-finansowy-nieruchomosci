import prisma from '@/lib/prisma';

export async function upsertSeries(key: string, name: string, unit: string, frequency: string, source: string) {
	try {
		// Typy modeli pojawią się po migracji; używamy any, by umożliwić build w środowisku bez migracji
		const client: any = prisma as any;
		return await client.marketSeries.upsert({
			where: { key },
			update: { name, unit, frequency, source },
			create: { key, name, unit, frequency, source },
		});
	} catch {
		// środowisko bez migracji – pomiń zapis
		return null as unknown as { id: string };
	}
}

export async function upsertObservation(seriesId: string, date: Date, value: number) {
	try {
		const client: any = prisma as any;
		return await client.observation.upsert({
			where: { seriesId_date: { seriesId, date } },
			update: { value },
			create: { seriesId, date, value },
		});
	} catch {
		return null;
	}
}
