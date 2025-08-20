export type NBPRate = {
	key: string;
	name: string;
	unit: string;
	value: number;
	date: string;
	source: 'nbp';
};

export type NBPInflationData = {
	date: string;
	cpi_yoy: number;
	core_inflation: number;
	source: 'nbp';
};

const NBP_BASE_URL = process.env.NBP_BASE_URL ?? 'https://api.nbp.pl';

async function safeJson<T>(res: Response): Promise<T> {
	const text = await res.text();
	return JSON.parse(text) as T;
}

export async function fetchNBPCurrencyRates(): Promise<NBPRate[]> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 10_000);
	try {
		const res = await fetch(`${NBP_BASE_URL}/api/exchangerates/tables/A/?format=json`, {
			method: 'GET',
			signal: controller.signal,
			headers: { 'Accept': 'application/json' }
		});
		if (!res.ok) throw new Error(`NBP error ${res.status}`);
		const data = await safeJson<any[]>(res);
		const table = data?.[0];
		const effectiveDate: string = table?.effectiveDate ?? new Date().toISOString().slice(0, 10);
		const rates: NBPRate[] = (table?.rates ?? [])
			.filter((r: any) => r?.code === 'EUR' || r?.code === 'USD')
			.map((r: any) => ({
				key: `nbp_fx_${r.code.toLowerCase()}`,
				name: `Kurs ${r.code}`,
				unit: 'PLN',
				value: Number(r.mid),
				date: effectiveDate,
				source: 'nbp' as const
			}));
		return rates;
	} finally {
		clearTimeout(timeoutId);
	}
}

export type Point = { date: string; value: number };

function formatDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// NBP ogranicza zakres jednego zapytania do 93 dni – dzielimy na porcje
export async function fetchNBPFxHistory(code: 'EUR' | 'USD', from: string, to: string): Promise<Point[]> {
  const start = new Date(from);
  const end = new Date(to);
  const out: Point[] = [];
  const oneDayMs = 24 * 60 * 60 * 1000;
  const maxDays = 93;
  for (let cursor = new Date(start); cursor <= end; ) {
    const chunkStart = new Date(cursor);
    const chunkEnd = new Date(Math.min(end.getTime(), cursor.getTime() + (maxDays - 1) * oneDayMs));
    const url = `${NBP_BASE_URL}/api/exchangerates/rates/a/${code.toLowerCase()}/${formatDateLocal(chunkStart)}/${formatDateLocal(chunkEnd)}/?format=json`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (res.ok) {
      const json = await safeJson<any>(res);
      const rates = json?.rates ?? [];
      for (const r of rates) out.push({ date: r.effectiveDate, value: Number(r.mid) });
    }
    cursor = new Date(chunkEnd.getTime() + oneDayMs);
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

// Syntetyczna historia stopy referencyjnej NBP bazująca na datach decyzji RPP (ostatnie lata)
// Źródło: komunikaty RPP – wartości wystarczające do wizualizacji (bez gwarancji pełnej archiwizacji)
const RPP_CHANGES: Array<{ date: string; value: number }> = [
  { date: '2020-03-18', value: 1.00 },
  { date: '2020-04-09', value: 0.50 },
  { date: '2020-05-28', value: 0.10 },
  { date: '2021-10-07', value: 0.50 },
  { date: '2021-11-04', value: 1.25 },
  { date: '2021-12-09', value: 1.75 },
  { date: '2022-01-04', value: 2.25 },
  { date: '2022-02-08', value: 2.75 },
  { date: '2022-03-08', value: 3.50 },
  { date: '2022-04-06', value: 4.50 },
  { date: '2022-05-06', value: 5.25 },
  { date: '2022-06-08', value: 6.00 },
  { date: '2022-07-08', value: 6.50 },
  { date: '2022-09-08', value: 6.75 },
  { date: '2023-10-05', value: 6.00 },
  { date: '2023-11-07', value: 5.75 },
];

export async function getReferenceRateSeries(from: string, to: string): Promise<Point[]> {
  // Generuj dzienną serię skokową wg zmian RPP
  const start = new Date(from);
  const end = new Date(to);
  // znajdź ostatnią wartość przed startem
  // domyślna wartość sprzed października 2021 może być inna; jeśli start > najstarszej zmiany,
  // ustaw aktualną z pierwszego wpisu poniżej startu
  let current = RPP_CHANGES[0]?.value ?? 5.75;
  for (const c of RPP_CHANGES) {
    if (new Date(c.date) <= start) current = c.value; else break;
  }
  const out: Point[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    // jeśli w tym dniu nastąpiła zmiana – zaktualizuj wartość
    const change = RPP_CHANGES.find(x => x.date === formatDateLocal(d));
    if (change) current = change.value;
    out.push({ date: formatDateLocal(d), value: current });
  }
  return out;
}

export async function fetchNBPIndicatorsSnapshot(): Promise<NBPRate[]> {
	const fx = await fetchNBPCurrencyRates().catch(() => [] as NBPRate[]);
	const today = new Date().toISOString().slice(0, 10);
	const placeholders: NBPRate[] = [
		{
			key: 'nbp_reference_rate',
			name: 'Stopa referencyjna NBP',
			unit: '%',
			value: 5.75,
			date: today,
			source: 'nbp'
		},
		{
			key: 'cpi_pl_ror',
			name: 'Inflacja CPI r/r',
			unit: '%',
			value: 3.2,
			date: today,
			source: 'nbp'
		}
	];
	return [...placeholders, ...fx];
}

// Pobieranie danych o inflacji CPI z NBP
export async function fetchNBPInflationData(): Promise<NBPInflationData | null> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 15_000);
	
	try {
		// Pobieranie danych o inflacji CPI
		const cpiUrl = `${NBP_BASE_URL}/api/inflation/cpi/last/12?format=json`;
		const cpiRes = await fetch(cpiUrl, {
			method: 'GET',
			signal: controller.signal,
			headers: { 'Accept': 'application/json' }
		});

		if (!cpiRes.ok) {
			console.warn('Nie udało się pobrać danych CPI z NBP:', cpiRes.status);
			return null;
		}

		const cpiData = await safeJson<any[]>(cpiRes);
		
		// Pobieranie danych o inflacji bazowej
		const coreUrl = `${NBP_BASE_URL}/api/inflation/core/last/12?format=json`;
		const coreRes = await fetch(coreUrl, {
			method: 'GET',
			signal: controller.signal,
			headers: { 'Accept': 'application/json' }
		});

		let coreInflation = 0;
		if (coreRes.ok) {
			const coreData = await safeJson<any[]>(coreRes);
			// Pobierz najnowszą wartość inflacji bazowej
			if (coreData && coreData.length > 0) {
				coreInflation = Number(coreData[0]?.value || 0);
			}
		}

		// Znajdź najnowsze dane CPI
		if (cpiData && cpiData.length > 0) {
			const latestCpi = cpiData[0];
			return {
				date: latestCpi.date || new Date().toISOString().slice(0, 10),
				cpi_yoy: Number(latestCpi.value || 0),
				core_inflation: coreInflation,
				source: 'nbp'
			};
		}

		return null;
	} catch (error) {
		console.error('Błąd podczas pobierania danych o inflacji z NBP:', error);
		return null;
	} finally {
		clearTimeout(timeoutId);
	}
}

// Pobieranie historii inflacji CPI
export async function fetchNBPInflationHistory(months: number = 24): Promise<Array<{ date: string; cpi_yoy: number }>> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 20_000);
	
	try {
		const url = `${NBP_BASE_URL}/api/inflation/cpi/last/${months}?format=json`;
		const res = await fetch(url, {
			method: 'GET',
			signal: controller.signal,
			headers: { 'Accept': 'application/json' }
		});

		if (!res.ok) {
			throw new Error(`NBP API error: ${res.status}`);
		}

		const data = await safeJson<any[]>(res);
		
		if (!data || !Array.isArray(data)) {
			return [];
		}

		return data
			.filter(item => item && item.date && item.value !== undefined)
			.map(item => ({
				date: item.date,
				cpi_yoy: Number(item.value)
			}))
			.filter(item => !isNaN(item.cpi_yoy)) // Filtruj NaN wartości
			.sort((a, b) => a.date.localeCompare(b.date));
	} catch (error) {
		console.error('Błąd podczas pobierania historii inflacji z NBP:', error);
		return [];
	} finally {
		clearTimeout(timeoutId);
	}
}

// Pobieranie historii inflacji bazowej
export async function fetchNBPCoreInflationHistory(months: number = 24): Promise<Array<{ date: string; core_inflation: number }>> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 20_000);
	
	try {
		const url = `${NBP_BASE_URL}/api/inflation/core/last/${months}?format=json`;
		const res = await fetch(url, {
			method: 'GET',
			signal: controller.signal,
			headers: { 'Accept': 'application/json' }
		});

		if (!res.ok) {
			throw new Error(`NBP API error: ${res.status}`);
		}

		const data = await safeJson<any[]>(res);
		
		if (!data || !Array.isArray(data)) {
			return [];
		}

		return data
			.filter(item => item && item.date && item.value !== undefined)
			.map(item => ({
				date: item.date,
				core_inflation: Number(item.value)
			}))
			.filter(item => !isNaN(item.core_inflation)) // Filtruj NaN wartości
			.sort((a, b) => a.date.localeCompare(b.date));
	} catch (error) {
		console.error('Błąd podczas pobierania historii inflacji bazowej z NBP:', error);
		return [];
	} finally {
		clearTimeout(timeoutId);
	}
}
