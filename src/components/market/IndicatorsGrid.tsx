import IndicatorCard from "./IndicatorCard";
import { fetchMarketIndicatorsSnapshot } from "@/lib/market/snapshot";
import type { MarketIndicator } from "@/lib/market/snapshot";

export default async function IndicatorsGrid() {
	const data = await fetchMarketIndicatorsSnapshot().catch(() => []);
	
	// Użyj Map do zapewnienia unikalności kluczy
	const indicatorsMap = new Map<string, {
		key: string;
		label: string;
		value: string;
		note: string;
		accent: "blue" | "green" | "yellow" | "purple" | "red" | "orange";
	}>();

	// Dodaj standardowe wskaźniki NBP
	data.forEach((item: MarketIndicator, idx: number) => {
		if ('key' in item && 'name' in item && 'value' in item) {
			// Standardowy wskaźnik NBP
			const key = item.key || `indicator_${idx}`;
			if (!indicatorsMap.has(key)) {
				indicatorsMap.set(key, {
					key,
					label: item.name,
					value: `${item.value}${item.unit === '%' ? '%' : item.unit === 'PLN' ? ' zł' : ''}`,
					note: item.date,
					accent: idx === 0 ? 'blue' : idx === 1 ? 'green' : idx === 2 ? 'yellow' : 'purple'
				});
			}
		} else if ('cpi_yoy' in item && 'source' in item && (item as any).source === 'nbp') {
			// Dane o inflacji z NBP
			const nbpItem = item as any;
			const key = 'nbp_inflation_cpi';
			if (!indicatorsMap.has(key)) {
				indicatorsMap.set(key, {
					key,
					label: 'Inflacja CPI (NBP)',
					value: `${nbpItem.cpi_yoy.toFixed(1)}%`,
					note: `Data: ${nbpItem.date}`,
					accent: 'red' as const
				});
			}
			
			if (nbpItem.core_inflation > 0) {
				const coreKey = 'nbp_inflation_core';
				if (!indicatorsMap.has(coreKey)) {
					indicatorsMap.set(coreKey, {
						key: coreKey,
						label: 'Inflacja bazowa (NBP)',
						value: `${nbpItem.core_inflation.toFixed(1)}%`,
						note: `Data: ${nbpItem.date}`,
						accent: 'orange' as const
					});
				}
			}
		} else if ('cpi_yoy' in item && 'source' in item && (item as any).source === 'gus') {
			// Dane CPI z GUS
			const gusItem = item as any;
			const key = 'gus_inflation_cpi';
			if (!indicatorsMap.has(key)) {
				indicatorsMap.set(key, {
					key,
					label: 'Inflacja CPI (GUS)',
					value: `${gusItem.cpi_yoy.toFixed(1)}%`,
					note: `Data: ${gusItem.date}`,
					accent: 'red' as const
				});
			}
		} else if ('source' in item && (item as any).source === 'eurostat') {
			// Dane CPI z Eurostat
			const eurostatItem = item as any;
			const key = 'eurostat_inflation_cpi';
			if (!indicatorsMap.has(key)) {
				indicatorsMap.set(key, {
					key,
					label: 'Inflacja CPI (Eurostat)',
					value: `${eurostatItem.value.toFixed(1)}%`,
					note: `Data: ${eurostatItem.date}`,
					accent: 'purple' as const
				});
			}
		}
	});

	// Konwertuj Map na Array i ogranicz do maksymalnie 6 wskaźników
	const items = Array.from(indicatorsMap.values()).slice(0, 6);

	return (
		<section className="py-16 bg-slate-800/30">
			<div className="container mx-auto px-4">
				<h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-10">Wskaźniki rynku nieruchomości</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
					{items.map((item, idx) => (
						<IndicatorCard
							key={item.key}
							label={item.label}
							value={item.value}
							note={item.note}
							accent={item.accent}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
