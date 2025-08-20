// Eurostat API client for CPI data
export type EurostatCpiPoint = { 
  date: string; 
  value: number; 
};

export type EurostatCpiReading = {
  key: 'cpi_pl_ror_eurostat';
  name: string;
  unit: '%';
  value: number;
  date: string; // YYYY-MM
  source: 'eurostat';
};

const EUROSTAT_BASE = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data';

// Pobieranie najnowszych danych CPI dla Polski z Eurostatu
export async function fetchEurostatCpiLatest(): Promise<EurostatCpiReading | null> {
  try {
    console.log('[EUROSTAT CPI] Fetching latest CPI data for Poland...');
    
    // HICP - Harmonised Index of Consumer Prices, annual rate of change
    // Dataset: prc_hicp_manr (Monthly data)
    // Country: PL (Poland)
    // Unit: RCH_A (Rate of change - annual)
    // COICOP: CP00 (All-items HICP)
    const url = `${EUROSTAT_BASE}/prc_hicp_manr?format=json&geo=PL&unit=RCH_A&coicop=CP00&lastTimePeriod=12`;
    
    console.log(`[EUROSTAT CPI] URL: ${url}`);
    
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'KalkulatoryNieruchomosci/1.0'
      },
      signal: AbortSignal.timeout(15000)
    });
    
    console.log(`[EUROSTAT CPI] Response: ${res.status} ${res.statusText}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[EUROSTAT CPI] API Error: ${errorText}`);
      return null;
    }
    
    const json = await res.json();
    console.log(`[EUROSTAT CPI] Response structure:`, Object.keys(json));
    
    // Eurostat JSON structure: { version, label, href, source, updated, value: { "0": value1, "1": value2 }, dimension: { time: { category: { index: {}, label: {} } } } }
    const values = json?.value || {};
    const timeLabels = json?.dimension?.time?.category?.label || {};
    const timeIndex = json?.dimension?.time?.category?.index || {};
    
    console.log(`[EUROSTAT CPI] Values count: ${Object.keys(values).length}`);
    console.log(`[EUROSTAT CPI] Time labels:`, Object.keys(timeLabels).slice(-3));
    
    if (Object.keys(values).length === 0) {
      console.warn('[EUROSTAT CPI] No values found');
      return null;
    }
    
    // Znajdź najnowszą wartość
    const sortedEntries = Object.entries(values)
      .map(([index, value]) => {
        const timeKey = Object.keys(timeIndex).find(key => timeIndex[key] === parseInt(index));
        const timeLabel = timeKey ? timeLabels[timeKey] : null;
        return {
          index: parseInt(index),
          value: Number(value),
          timeKey,
          timeLabel
        };
      })
      .filter(entry => Number.isFinite(entry.value) && entry.timeLabel)
      .sort((a, b) => b.index - a.index); // Sortuj malejąco (najnowsze pierwsze)
    
    console.log(`[EUROSTAT CPI] Sorted entries count: ${sortedEntries.length}`);
    
    if (sortedEntries.length > 0) {
      const latest = sortedEntries[0];
      console.log(`[EUROSTAT CPI] Latest data:`, latest);
      
      // Konwertuj format daty z YYYY-MM do YYYY-MM
      const dateMatch = latest.timeLabel?.match(/(\d{4})-(\d{2})/);
      const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}` : new Date().toISOString().slice(0, 7);
      
      return {
        key: 'cpi_pl_ror_eurostat',
        name: 'Inflacja CPI r/r (Eurostat)',
        unit: '%',
        value: Math.round(latest.value * 10) / 10,
        date,
        source: 'eurostat'
      };
    }
    
    return null;
  } catch (error) {
    console.error('[EUROSTAT CPI] Exception:', error);
    return null;
  }
}

// Pobieranie historycznych danych CPI dla Polski z Eurostatu
export async function fetchEurostatCpiHistory(from: string, to: string): Promise<EurostatCpiPoint[]> {
  try {
    console.log(`[EUROSTAT CPI] Fetching history from ${from} to ${to}`);
    
    // Oblicz ile miesięcy potrzebujemy
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const monthsDiff = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + (toDate.getMonth() - fromDate.getMonth()) + 1;
    const periodsToFetch = Math.min(Math.max(monthsDiff, 12), 120); // Min 12, max 120 miesięcy
    
    console.log(`[EUROSTAT CPI] Fetching ${periodsToFetch} periods`);
    
    // HICP - Harmonised Index of Consumer Prices, annual rate of change
    // Dataset: prc_hicp_manr (Monthly data)
    // Country: PL (Poland)
    // Unit: RCH_A (Rate of change - annual)
    // COICOP: CP00 (All-items HICP)
    const url = `${EUROSTAT_BASE}/prc_hicp_manr?format=json&geo=PL&unit=RCH_A&coicop=CP00&lastTimePeriod=${periodsToFetch}`;
    
    console.log(`[EUROSTAT CPI] URL: ${url}`);
    
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'KalkulatoryNieruchomosci/1.0'
      },
      signal: AbortSignal.timeout(20000)
    });
    
    console.log(`[EUROSTAT CPI] Response: ${res.status} ${res.statusText}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[EUROSTAT CPI] API Error: ${errorText}`);
      return [];
    }
    
    const json = await res.json();
    console.log(`[EUROSTAT CPI] Response structure:`, Object.keys(json));
    
    // Parsuj dane Eurostat
    const values = json?.value || {};
    const timeLabels = json?.dimension?.time?.category?.label || {};
    const timeIndex = json?.dimension?.time?.category?.index || {};
    
    console.log(`[EUROSTAT CPI] Values count: ${Object.keys(values).length}`);
    console.log(`[EUROSTAT CPI] Time range:`, Object.keys(timeLabels).slice(0, 3), '...', Object.keys(timeLabels).slice(-3));
    
    if (Object.keys(values).length === 0) {
      console.warn('[EUROSTAT CPI] No values found');
      return [];
    }
    
    // Konwertuj dane do formatu CpiPoint
    const allData: EurostatCpiPoint[] = [];
    
    Object.entries(values).forEach(([index, value]) => {
      const timeKey = Object.keys(timeIndex).find(key => timeIndex[key] === parseInt(index));
      const timeLabel = timeKey ? timeLabels[timeKey] : null;
      
      if (timeLabel && Number.isFinite(Number(value))) {
        // Konwertuj format daty z YYYY-MM do YYYY-MM-01
        const dateMatch = timeLabel.match(/(\d{4})-(\d{2})/);
        if (dateMatch) {
          const date = `${dateMatch[1]}-${dateMatch[2]}-01`;
          const dataPoint = new Date(dateMatch[1], parseInt(dateMatch[2]) - 1, 1);
          
          // Sprawdź czy data jest w żądanym zakresie
          if (dataPoint >= fromDate && dataPoint <= toDate) {
            allData.push({
              date,
              value: Math.round(Number(value) * 10) / 10
            });
          }
        }
      }
    });
    
    // Sortuj chronologicznie
    allData.sort((a, b) => a.date.localeCompare(b.date));
    
    console.log(`[EUROSTAT CPI] Final result: ${allData.length} data points`);
    if (allData.length > 0) {
      console.log(`[EUROSTAT CPI] Date range: ${allData[0].date} to ${allData[allData.length - 1].date}`);
      console.log(`[EUROSTAT CPI] Sample data:`, allData.slice(0, 3));
    }
    
    return allData;
    
  } catch (error) {
    console.error('[EUROSTAT CPI] Exception:', error);
    return [];
  }
}

// Funkcja testowa dla Eurostat API
export async function testEurostatConnection(): Promise<any> {
  console.log('[EUROSTAT TEST] Testing Eurostat API connection...');
  
  const results: any = {
    tests: {}
  };
  
  // Test 1: Podstawowe połączenie - sprawdź dostępne datasety
  try {
    const url = `${EUROSTAT_BASE}/prc_hicp_manr?format=json&geo=PL&unit=RCH_A&coicop=CP00&lastTimePeriod=1`;
    console.log(`[EUROSTAT TEST] Test 1 - Basic connection: ${url}`);
    
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'KalkulatoryNieruchomosci/1.0'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    console.log(`[EUROSTAT TEST] Test 1 Response: ${res.status} ${res.statusText}`);
    
    if (res.ok) {
      const json = await res.json();
      results.tests.connection = {
        status: 'SUCCESS',
        responseStructure: Object.keys(json),
        valuesCount: Object.keys(json?.value || {}).length,
        timeLabelsCount: Object.keys(json?.dimension?.time?.category?.label || {}).length,
        sampleTimeLabel: Object.keys(json?.dimension?.time?.category?.label || {})[0],
        sampleValue: Object.values(json?.value || {})[0]
      };
    } else {
      const errorText = await res.text();
      results.tests.connection = {
        status: 'HTTP_ERROR',
        httpStatus: res.status,
        errorBody: errorText
      };
    }
  } catch (error) {
    results.tests.connection = {
      status: 'EXCEPTION',
      error: error instanceof Error ? error.message : String(error)
    };
  }
  
  // Test 2: Test najnowszych danych
  try {
    console.log('[EUROSTAT TEST] Test 2 - Latest data...');
    const latest = await fetchEurostatCpiLatest();
    results.tests.latestData = {
      status: latest ? 'SUCCESS' : 'NO_DATA',
      data: latest
    };
  } catch (error) {
    results.tests.latestData = {
      status: 'EXCEPTION',
      error: error instanceof Error ? error.message : String(error)
    };
  }
  
  // Test 3: Test danych historycznych
  try {
    console.log('[EUROSTAT TEST] Test 3 - Historical data...');
    const history = await fetchEurostatCpiHistory('2024-01-01', '2024-12-01');
    results.tests.historicalData = {
      status: history.length > 0 ? 'SUCCESS' : 'NO_DATA',
      dataCount: history.length,
      sampleData: history.slice(0, 3)
    };
  } catch (error) {
    results.tests.historicalData = {
      status: 'EXCEPTION',
      error: error instanceof Error ? error.message : String(error)
    };
  }
  
  console.log('[EUROSTAT TEST] Test completed');
  return results;
}