import { fetchNBPIndicatorsSnapshot, type NBPRate, fetchNBPInflationData, type NBPInflationData } from '@/lib/market/nbp';
import { fetchCpiYoYLatest, type CPIReading } from '@/lib/market/gus';
import { fetchEurostatCpiLatest, type EurostatCpiReading } from '@/lib/market/eurostat';

export type MarketIndicator = NBPRate | CPIReading | NBPInflationData | EurostatCpiReading;

export async function fetchMarketIndicatorsSnapshot(): Promise<MarketIndicator[]> {
  const [nbp, cpi, nbpInflation, eurostatCpi] = await Promise.all([
    fetchNBPIndicatorsSnapshot().catch(() => [] as NBPRate[]),
    fetchCpiYoYLatest().catch(() => null),
    fetchNBPInflationData().catch(() => null),
    fetchEurostatCpiLatest().catch(() => null),
  ]);
  
  const indicators: MarketIndicator[] = [...nbp];
  
  // Dodaj dane CPI z GUS jeśli dostępne
  if (cpi) {
    indicators.push(cpi);
  }
  
  // Dodaj dane o inflacji z NBP jeśli dostępne
  if (nbpInflation) {
    indicators.push(nbpInflation);
  }
  
  // Dodaj dane CPI z Eurostat jeśli dostępne
  if (eurostatCpi) {
    indicators.push(eurostatCpi);
  }
  
  return indicators;
}
