export type CPIReading = {
	key: 'cpi_pl_ror';
	name: string;
	unit: '%';
	value: number;
	date: string; // YYYY-MM
	source: 'gus';
};

// Oficjalny endpoint GUS BDL API zgodnie z dokumentacją
const BDL_BASE = 'https://bdl.stat.gov.pl/api/v1';

function getApiKey(): string | undefined {
	return process.env.GUS_BDL_API_KEY;
}

// Pobieranie najnowszych danych CPI zgodnie z dokumentacją GUS BDL API
export async function fetchCpiYoYLatest(): Promise<CPIReading | null> {
	try {
		const apiKey = getApiKey();
		const headers: Record<string, string> = { 
			'Accept': 'application/json',
			...(apiKey ? { 'X-ClientId': apiKey } : {})
		};
		
		console.log('[CPI LATEST] Fetching latest CPI data...');
		
		// Zgodnie z dokumentacją GUS BDL - pobieranie danych dla zmiennej
		// Zmienna 217230: Wskaźnik cen towarów i usług konsumpcyjnych - ogółem (DZIAŁAJĄCA)
		// Unit-id 000000000000: POLSKA (poziom krajowy)
		const url = `${BDL_BASE}/data/by-unit/000000000000?var-id=217230&format=json&page-size=12`;
		console.log(`[CPI LATEST] URL: ${url}`);
		
		const res = await fetch(url, { 
			headers,
			signal: AbortSignal.timeout(10000)
		});
		
		console.log(`[CPI LATEST] Response: ${res.status} ${res.statusText}`);
		
		if (!res.ok) {
			const errorText = await res.text();
			console.error(`[CPI LATEST] API Error: ${errorText}`);
			return null;
		}
		
		const json = await res.json();
		console.log(`[CPI LATEST] Response structure:`, Object.keys(json));
		
		const results = json?.results ?? [];
		console.log(`[CPI LATEST] Results count: ${results.length}`);
		
		if (!Array.isArray(results) || results.length === 0) {
			console.warn('[CPI LATEST] No results found');
			return null;
		}
		
		// Sprawdź pierwszy wynik - może zawierać tablicę values
		if (results.length > 0 && results[0]?.values) {
			const values = results[0].values;
			console.log(`[CPI LATEST] Found values array with ${values.length} entries`);
			
			// Sortuj według roku malejąco
			const sortedValues = values
				.filter((item: any) => item?.val != null && item?.year != null)
				.sort((a: any, b: any) => Number(b.year) - Number(a.year));
			
			console.log(`[CPI LATEST] Sorted values count: ${sortedValues.length}`);
			
			if (sortedValues.length > 0) {
				const latest = sortedValues[0];
				const value = Number(latest.val);
				const year = Number(latest.year);
				
				console.log(`[CPI LATEST] Latest data: year=${year}, value=${value}`);
				
				if (Number.isFinite(value) && Number.isFinite(year)) {
					// Konwertuj z indeksu (100 = brak zmiany) do procentów r/r
					const cpiYoY = value - 100;
					const date = `${year}-12`; // Dane roczne - przypisz do grudnia
					
					console.log(`[CPI LATEST] Converted: date=${date}, cpiYoY=${cpiYoY}`);
					
					return {
						key: 'cpi_pl_ror',
						name: 'Inflacja CPI r/r (GUS)',
						unit: '%',
						value: Math.round(cpiYoY * 10) / 10,
						date,
						source: 'gus'
					};
				}
			}
		} else {
			// Fallback - sprawdź bezpośrednio w results (dla danych miesięcznych)
			const sortedResults = results
				.filter(item => item?.val != null && item?.year != null && item?.month != null)
				.sort((a, b) => {
					const dateA = new Date(Number(a.year), Number(a.month) - 1);
					const dateB = new Date(Number(b.year), Number(b.month) - 1);
					return dateB.getTime() - dateA.getTime();
				});
			
			console.log(`[CPI LATEST] Sorted results count: ${sortedResults.length}`);
			
			if (sortedResults.length > 0) {
				const latest = sortedResults[0];
				const value = Number(latest.val);
				const year = Number(latest.year);
				const month = Number(latest.month);
				
				console.log(`[CPI LATEST] Latest data: year=${year}, month=${month}, value=${value}`);
				
				if (Number.isFinite(value) && Number.isFinite(year) && Number.isFinite(month)) {
					// Konwertuj z indeksu (100 = brak zmiany) do procentów r/r
					const cpiYoY = value - 100;
					const date = `${year}-${String(month).padStart(2, '0')}`;
					
					console.log(`[CPI LATEST] Converted: date=${date}, cpiYoY=${cpiYoY}`);
					
					return {
						key: 'cpi_pl_ror',
						name: 'Inflacja CPI r/r (GUS)',
						unit: '%',
						value: Math.round(cpiYoY * 10) / 10,
						date,
						source: 'gus'
					};
				}
			}
		}
		
		return null;
	} catch (error) {
		console.error('[CPI LATEST] Exception:', error);
		return null;
	}
}

export type CpiPoint = { date: string; value: number };

// Alternatywna funkcja używająca różnych endpointów GUS BDL API
export async function fetchMonthlyCpiDataAlternative(from: string, to: string): Promise<CpiPoint[]> {
	console.log(`[CPI ALT] Fetching data from ${from} to ${to}`);
	
	const apiKey = getApiKey();
	const headers: Record<string, string> = { 
		'Accept': 'application/json', 
		...(apiKey ? { 'X-ClientId': apiKey } : {}) 
	};
	
	const parseDate = (dateStr: string): Date => {
		const [year, month] = dateStr.split('-').map(Number);
		return new Date(year, month - 1, 1);
	};
	
	const start = parseDate(from);
	const end = parseDate(to);
	
	try {
		// Spróbuj różnych zmiennych i endpointów zgodnie z dokumentacją
		const variablesToTry = [
			{ id: '217230', name: 'CPI ogółem' }, // PRIORYTET - działająca zmienna
			{ id: '64513', name: 'CPI nowa zmienna' },
			{ id: '42169', name: 'CPI analogiczny miesiąc poprzedniego roku' },
			{ id: '42170', name: 'CPI alternatywny' },
		];
		
		for (const variable of variablesToTry) {
			console.log(`[CPI ALT] Trying variable ${variable.id}: ${variable.name}`);
			
			try {
				// Metoda 1: Pobieranie przez by-unit (zalecane w dokumentacji)
				let url = `${BDL_BASE}/data/by-unit/000000000000?var-id=${variable.id}&format=json&page-size=500`;
				console.log(`[CPI ALT] Method 1 URL: ${url}`);
				
				let res = await fetch(url, { 
					headers,
					signal: AbortSignal.timeout(15000)
				});
				
				console.log(`[CPI ALT] Method 1 Response: ${res.status} ${res.statusText}`);
				
				if (!res.ok) {
					// Metoda 2: Pobieranie przez by-variable (fallback)
					url = `${BDL_BASE}/data/by-variable/${variable.id}?format=json&page-size=500`;
					console.log(`[CPI ALT] Method 2 URL: ${url}`);
					
					res = await fetch(url, { 
						headers,
						signal: AbortSignal.timeout(15000)
					});
					
					console.log(`[CPI ALT] Method 2 Response: ${res.status} ${res.statusText}`);
				}
				
				if (res.ok) {
					const json = await res.json();
					console.log(`[CPI ALT] Response structure:`, Object.keys(json));
					console.log(`[CPI ALT] Results count: ${json?.results?.length || 0}`);
					
					const results = json?.results ?? [];
					
					if (results.length > 0) {
						console.log(`[CPI ALT] Sample result:`, JSON.stringify(results[0], null, 2));
						
						const allData: CpiPoint[] = [];
						
						for (const item of results) {
							const itemYear = Number(item?.year);
							const itemMonth = Number(item?.month);
							const itemValue = Number(item?.val);
							
							if (Number.isFinite(itemYear) && Number.isFinite(itemMonth) && Number.isFinite(itemValue)) {
								const dataPoint = new Date(itemYear, itemMonth - 1, 1);
								
								// Sprawdź czy data jest w żądanym zakresie
								if (dataPoint >= start && dataPoint <= end) {
									// Konwertuj z indeksu (100 = brak zmiany) do procentów r/r
									const cpiYoY = itemValue - 100;
									const date = `${itemYear}-${String(itemMonth).padStart(2, '0')}-01`;
									
									allData.push({ 
										date, 
										value: Math.round(cpiYoY * 10) / 10 
									});
								}
							}
						}
						
						if (allData.length > 0) {
							allData.sort((a, b) => a.date.localeCompare(b.date));
							console.log(`[CPI ALT] Found ${allData.length} data points with variable ${variable.id}`);
							console.log(`[CPI ALT] Date range: ${allData[0].date} to ${allData[allData.length - 1].date}`);
							return allData;
						}
					}
				} else {
					const errorText = await res.text();
					console.log(`[CPI ALT] Error response for ${variable.id}:`, errorText);
				}
			} catch (error) {
				console.error(`[CPI ALT] Error with variable ${variable.id}:`, error);
			}
		}
		
		console.log(`[CPI ALT] No data found with any variable`);
		return [];
		
	} catch (error) {
		console.error(`[CPI ALT] General error:`, error);
		return [];
	}
}

// Pobieranie miesięcznych danych CPI zgodnie z dokumentacją GUS BDL API
export async function fetchMonthlyCpiData(from: string, to: string): Promise<CpiPoint[]> {
	console.log(`[CPI] Fetching data from ${from} to ${to}`);
	
	const apiKey = getApiKey();
	const headers: Record<string, string> = { 
		'Accept': 'application/json', 
		...(apiKey ? { 'X-ClientId': apiKey } : {}) 
	};
	
	console.log(`[CPI] Using API key: ${apiKey ? 'YES' : 'NO'}`);
	
	const parseDate = (dateStr: string): Date => {
		const [year, month] = dateStr.split('-').map(Number);
		return new Date(year, month - 1, 1);
	};
	
	const start = parseDate(from);
	const end = parseDate(to);
	
	console.log(`[CPI] Date range: ${start.toISOString()} to ${end.toISOString()}`);
	
	try {
		const startYear = start.getFullYear();
		const endYear = end.getFullYear();
		
		console.log(`[CPI] Fetching data for years: ${startYear} to ${endYear}`);
		
		// Zgodnie z dokumentacją GUS BDL - pobieranie danych dla jednostki terytorialnej
		// Unit-id 000000000000: POLSKA (poziom krajowy)
		// Var-id 217230: Wskaźnik cen towarów i usług konsumpcyjnych - ogółem (DZIAŁAJĄCA)
		const url = `${BDL_BASE}/data/by-unit/000000000000?var-id=217230&format=json&page-size=1000`;
		console.log(`[CPI] Fetching: ${url}`);
		
		const res = await fetch(url, { 
			headers,
			signal: AbortSignal.timeout(15000)
		});
		
		console.log(`[CPI] Response: ${res.status} ${res.statusText}`);
		
		if (!res.ok) {
			const errorText = await res.text();
			console.error(`[CPI] API error: ${res.status} ${res.statusText} - ${errorText}`);
			
			// Spróbuj alternatywnej metody
			console.log(`[CPI] Trying alternative method...`);
			return await fetchMonthlyCpiDataAlternative(from, to);
		}
		
		const json = await res.json();
		console.log(`[CPI] Response structure:`, Object.keys(json));
		
		const results = json?.results ?? [];
		console.log(`[CPI] Total results count: ${results.length}`);
		
		if (results.length > 0) {
			console.log(`[CPI] Sample result:`, JSON.stringify(results[0], null, 2));
		}
		
		const allData: CpiPoint[] = [];
		
		// Przetwórz wszystkie wyniki
		for (const item of results) {
			const itemYear = Number(item?.year);
			const itemMonth = Number(item?.month);
			const itemValue = Number(item?.val);
			
			if (Number.isFinite(itemYear) && Number.isFinite(itemMonth) && Number.isFinite(itemValue)) {
				const dataPoint = new Date(itemYear, itemMonth - 1, 1);
				
				// Sprawdź czy data jest w żądanym zakresie
				if (dataPoint >= start && dataPoint <= end) {
					// Konwertuj z indeksu (100 = brak zmiany) do procentów r/r
					const cpiYoY = itemValue - 100;
					const date = `${itemYear}-${String(itemMonth).padStart(2, '0')}-01`;
					
					allData.push({ 
						date, 
						value: Math.round(cpiYoY * 10) / 10 
					});
					
					console.log(`[CPI] Added data point: ${date} = ${cpiYoY.toFixed(1)}%`);
				}
			}
		}
		
		// Sortuj dane chronologicznie
		allData.sort((a, b) => a.date.localeCompare(b.date));
		
		console.log(`[CPI] Final result: ${allData.length} data points`);
		if (allData.length > 0) {
			console.log(`[CPI] Date range: ${allData[0].date} to ${allData[allData.length - 1].date}`);
			console.log(`[CPI] Sample data:`, allData.slice(0, 3));
		}
		
		// Jeśli nie znaleźliśmy danych, spróbuj alternatywnej metody
		if (allData.length === 0) {
			console.log(`[CPI] No data found, trying alternative method...`);
			const alternativeData = await fetchMonthlyCpiDataAlternative(from, to);
			
			// Jeśli alternatywna metoda też nie działa, spróbuj Eurostat
			if (alternativeData.length === 0) {
				console.log(`[CPI] Alternative method failed, trying Eurostat...`);
				const { fetchEurostatCpiHistory } = await import('./eurostat');
				const eurostatData = await fetchEurostatCpiHistory(from, to);
				return eurostatData.map(point => ({ date: point.date, value: point.value }));
			}
			
			return alternativeData;
		}
		
		return allData;
		
	} catch (error) {
		console.error(`[CPI] General error:`, error);
		
		// Spróbuj alternatywnej metody w przypadku błędu
		console.log(`[CPI] Trying alternative method due to error...`);
		return await fetchMonthlyCpiDataAlternative(from, to);
	}
}



// Funkcja testowa połączenia z GUS BDL API zgodnie z dokumentacją
export async function testGusBdlConnection(): Promise<any> {
	const apiKey = getApiKey();
	const headers: Record<string, string> = { 
		'Accept': 'application/json', 
		...(apiKey ? { 'X-ClientId': apiKey } : {}) 
	};
	
	console.log('[CPI TEST] Testing GUS BDL API connection...');
	
	const tests: any = {};
	
	// Test 1: Podstawowe połączenie - lista zmiennych
	try {
		const url = `${BDL_BASE}/variables?format=json&page-size=5`;
		console.log(`[CPI TEST] Test 1 - Variables list: ${url}`);
		
		const res = await fetch(url, { 
			headers,
			signal: AbortSignal.timeout(10000)
		});
		
		console.log(`[CPI TEST] Test 1 Response: ${res.status} ${res.statusText}`);
		
		if (res.ok) {
			const json = await res.json();
			tests.variables = {
				status: 'SUCCESS',
				resultsCount: json?.results?.length || 0,
				sampleVariable: json?.results?.[0] || null
			};
		} else {
			const errorText = await res.text();
			tests.variables = {
				status: 'HTTP_ERROR',
				httpStatus: res.status,
				errorBody: errorText
			};
		}
	} catch (error) {
		tests.variables = {
			status: 'EXCEPTION',
			error: error instanceof Error ? error.message : String(error)
		};
	}
	
	// Test 2: Sprawdzenie jednostek terytorialnych
	try {
		const url = `${BDL_BASE}/units?format=json&page-size=5&level=0`;
		console.log(`[CPI TEST] Test 2 - Units list: ${url}`);
		
		const res = await fetch(url, { 
			headers,
			signal: AbortSignal.timeout(10000)
		});
		
		console.log(`[CPI TEST] Test 2 Response: ${res.status} ${res.statusText}`);
		
		if (res.ok) {
			const json = await res.json();
			tests.units = {
				status: 'SUCCESS',
				resultsCount: json?.results?.length || 0,
				sampleUnit: json?.results?.[0] || null
			};
		} else {
			const errorText = await res.text();
			tests.units = {
				status: 'HTTP_ERROR',
				httpStatus: res.status,
				errorBody: errorText
			};
		}
	} catch (error) {
		tests.units = {
			status: 'EXCEPTION',
			error: error instanceof Error ? error.message : String(error)
		};
	}
	
	// Test 3: Sprawdzenie konkretnej zmiennej CPI
	try {
		const url = `${BDL_BASE}/variables/42169?format=json`;
		console.log(`[CPI TEST] Test 3 - CPI variable info: ${url}`);
		
		const res = await fetch(url, { 
			headers,
			signal: AbortSignal.timeout(10000)
		});
		
		console.log(`[CPI TEST] Test 3 Response: ${res.status} ${res.statusText}`);
		
		if (res.ok) {
			const json = await res.json();
			tests.cpiVariable = {
				status: 'SUCCESS',
				variableInfo: json
			};
		} else {
			const errorText = await res.text();
			tests.cpiVariable = {
				status: 'HTTP_ERROR',
				httpStatus: res.status,
				errorBody: errorText
			};
		}
	} catch (error) {
		tests.cpiVariable = {
			status: 'EXCEPTION',
			error: error instanceof Error ? error.message : String(error)
		};
	}
	
	// Test 4: Próba pobrania danych CPI dla Polski
	try {
		const url = `${BDL_BASE}/data/by-unit/000000000000?var-id=42169&format=json&page-size=5`;
		console.log(`[CPI TEST] Test 4 - CPI data for Poland: ${url}`);
		
		const res = await fetch(url, { 
			headers,
			signal: AbortSignal.timeout(10000)
		});
		
		console.log(`[CPI TEST] Test 4 Response: ${res.status} ${res.statusText}`);
		
		if (res.ok) {
			const json = await res.json();
			tests.cpiData = {
				status: 'SUCCESS',
				resultsCount: json?.results?.length || 0,
				sampleData: json?.results?.[0] || null,
				responseStructure: Object.keys(json)
			};
		} else {
			const errorText = await res.text();
			tests.cpiData = {
				status: 'HTTP_ERROR',
				httpStatus: res.status,
				errorBody: errorText
			};
		}
	} catch (error) {
		tests.cpiData = {
			status: 'EXCEPTION',
			error: error instanceof Error ? error.message : String(error)
		};
	}
	
	return {
		hasApiKey: !!apiKey,
		apiKeyValue: apiKey ? `${apiKey.substring(0, 8)}...` : null,
		tests
	};
}

// Funkcja testowa do sprawdzenia dostępnych zmiennych CPI
// Funkcja do przeszukiwania bazy GUS BDL w poszukiwaniu zmiennych CPI
export async function searchGusBdlForCpiVariables(): Promise<any> {
	const apiKey = getApiKey();
	const headers: Record<string, string> = { 
		'Accept': 'application/json', 
		...(apiKey ? { 'X-ClientId': apiKey } : {}) 
	};
	
	console.log('[CPI SEARCH] Searching GUS BDL for CPI variables...');
	
	const results: any = {
		hasApiKey: !!apiKey,
		searches: {}
	};
	
	// 1. Przeszukaj tematy związane z cenami
	try {
		console.log('[CPI SEARCH] Step 1: Searching subjects...');
		const subjectsUrl = `${BDL_BASE}/subjects?format=json&page-size=100`;
		const res = await fetch(subjectsUrl, { headers, signal: AbortSignal.timeout(15000) });
		
		if (res.ok) {
			const json = await res.json();
			const priceRelatedSubjects = (json?.results || []).filter((subject: any) => {
				const name = (subject?.name || '').toLowerCase();
				return name.includes('cen') || name.includes('inflac') || name.includes('konsump') || 
				       name.includes('price') || name.includes('wskaźnik');
			});
			
			results.searches.subjects = {
				status: 'SUCCESS',
				totalSubjects: json?.results?.length || 0,
				priceRelatedCount: priceRelatedSubjects.length,
				priceRelatedSubjects: priceRelatedSubjects.map((s: any) => ({
					id: s.id,
					name: s.name,
					hasChildren: s.hasChildren
				}))
			};
			
			console.log(`[CPI SEARCH] Found ${priceRelatedSubjects.length} price-related subjects`);
		}
	} catch (error) {
		results.searches.subjects = { status: 'ERROR', error: String(error) };
	}
	
	// 2. Przeszukaj zmienne dla głównych tematów cenowych
	const subjectIds = ['P2955', 'P2956', 'P2957', 'P2958']; // Typowe ID dla tematów cenowych
	
	for (const subjectId of subjectIds) {
		try {
			console.log(`[CPI SEARCH] Step 2: Searching variables for subject ${subjectId}...`);
			const variablesUrl = `${BDL_BASE}/variables?subject-id=${subjectId}&format=json&page-size=100`;
			const res = await fetch(variablesUrl, { headers, signal: AbortSignal.timeout(15000) });
			
			if (res.ok) {
				const json = await res.json();
				const cpiVariables = (json?.results || []).filter((variable: any) => {
					const name = (variable?.name || '').toLowerCase();
					return name.includes('wskaźnik cen') || name.includes('cpi') || name.includes('inflac') ||
					       name.includes('analogiczny') || name.includes('poprzedni rok') || name.includes('100');
				});
				
				results.searches[`subject_${subjectId}`] = {
					status: 'SUCCESS',
					totalVariables: json?.results?.length || 0,
					cpiVariablesCount: cpiVariables.length,
					cpiVariables: cpiVariables.map((v: any) => ({
						id: v.id,
						name: v.name,
						subjectId: v.subjectId,
						measureUnitName: v.measureUnitName
					}))
				};
				
				console.log(`[CPI SEARCH] Subject ${subjectId}: Found ${cpiVariables.length} CPI variables`);
			}
		} catch (error) {
			results.searches[`subject_${subjectId}`] = { status: 'ERROR', error: String(error) };
		}
	}
	
	// 3. Przeszukaj konkretne zmienne, które mogą zawierać dane CPI
	const testVariableIds = [
		'64513', // Nowa zmienna - priorytet
		'42169', '42170', '42171', '42172', '42173',
		'217230', '217231', '217232', '217233', '217234',
		'P2955', 'P2956', 'P2957', 'P2958'
	];
	
	for (const varId of testVariableIds) {
		try {
			console.log(`[CPI SEARCH] Step 3: Testing variable ${varId}...`);
			const variableUrl = `${BDL_BASE}/variables/${varId}?format=json`;
			const res = await fetch(variableUrl, { headers, signal: AbortSignal.timeout(10000) });
			
			if (res.ok) {
				const json = await res.json();
				results.searches[`variable_${varId}`] = {
					status: 'SUCCESS',
					variable: {
						id: json.id,
						name: json.name,
						subjectId: json.subjectId,
						measureUnitName: json.measureUnitName,
						n1: json.n1,
						n2: json.n2,
						n3: json.n3,
						n4: json.n4,
						n5: json.n5,
						n6: json.n6
					}
				};
				
				// Sprawdź czy ta zmienna ma dane dla Polski
				try {
					const dataUrl = `${BDL_BASE}/data/by-unit/000000000000?var-id=${varId}&format=json&page-size=5`;
					const dataRes = await fetch(dataUrl, { headers, signal: AbortSignal.timeout(10000) });
					
					if (dataRes.ok) {
						const dataJson = await dataRes.json();
						results.searches[`variable_${varId}`].dataTest = {
							status: 'SUCCESS',
							totalRecords: dataJson.totalRecords || 0,
							unitName: dataJson.unitName,
							resultsCount: dataJson?.results?.length || 0,
							sampleData: dataJson?.results?.[0] || null
						};
					}
				} catch (dataError) {
					results.searches[`variable_${varId}`].dataTest = {
						status: 'ERROR',
						error: String(dataError)
					};
				}
			}
		} catch (error) {
			results.searches[`variable_${varId}`] = { status: 'ERROR', error: String(error) };
		}
	}
	
	// 4. Przeszukaj jednostki terytorialne
	try {
		console.log('[CPI SEARCH] Step 4: Searching territorial units...');
		const unitsUrl = `${BDL_BASE}/units?level=0&format=json&page-size=20`;
		const res = await fetch(unitsUrl, { headers, signal: AbortSignal.timeout(15000) });
		
		if (res.ok) {
			const json = await res.json();
			results.searches.units = {
				status: 'SUCCESS',
				totalUnits: json?.results?.length || 0,
				units: (json?.results || []).map((u: any) => ({
					id: u.id,
					name: u.name,
					level: u.level
				}))
			};
			
			console.log(`[CPI SEARCH] Found ${json?.results?.length || 0} territorial units`);
		}
	} catch (error) {
		results.searches.units = { status: 'ERROR', error: String(error) };
	}
	
	console.log('[CPI SEARCH] Search completed');
	return results;
}

export async function testGusBdlVariables(): Promise<any> {
	const apiKey = getApiKey();
	const headers: Record<string, string> = { 
		'Accept': 'application/json', 
		...(apiKey ? { 'X-ClientId': apiKey } : {}) 
	};
	
	console.log('[CPI TEST] Testing GUS BDL variables...');
	
	// Sprawdź różne zmienne CPI
	const variablesToTest = [
		'42169', // Wskaźnik cen towarów i usług konsumpcyjnych (analogiczny miesiąc poprzedniego roku = 100)
		'217230', // Wskaźnik cen towarów i usług konsumpcyjnych (ogółem)
		'42170', // Możliwa alternatywa
		'42171', // Możliwa alternatywa
	];
	
	const results: any = {};
	
	for (const variable of variablesToTest) {
		try {
			const url = `${BDL_BASE}/data/by-variable/${variable}?format=json&page-size=5&year=2024`;
			console.log(`[CPI TEST] Testing variable ${variable}: ${url}`);
			
			const res = await fetch(url, { 
				headers,
				signal: AbortSignal.timeout(10000)
			});
			
			if (res.ok) {
				const json = await res.json();
				results[variable] = {
					status: 'OK',
					count: json?.results?.length || 0,
					sample: json?.results?.[0] || null
				};
				console.log(`[CPI TEST] Variable ${variable}: ${results[variable].count} results`);
			} else {
				const errorText = await res.text();
				results[variable] = {
					status: 'ERROR',
					error: `${res.status} ${res.statusText}`,
					details: errorText
				};
				console.log(`[CPI TEST] Variable ${variable} failed: ${res.status} ${res.statusText}`);
			}
		} catch (error) {
			results[variable] = {
				status: 'EXCEPTION',
				error: error instanceof Error ? error.message : String(error)
			};
			console.error(`[CPI TEST] Variable ${variable} exception:`, error);
		}
	}
	
	// Sprawdź też ogólne info o zmiennych
	try {
		const variablesUrl = `${BDL_BASE}/variables?format=json&page-size=10&subject-id=P2955`;
		console.log(`[CPI TEST] Checking variables list: ${variablesUrl}`);
		
		const res = await fetch(variablesUrl, { 
			headers,
			signal: AbortSignal.timeout(10000)
		});
		
		if (res.ok) {
			const json = await res.json();
			results['variables_list'] = {
				status: 'OK',
				count: json?.results?.length || 0,
				variables: json?.results?.map((v: any) => ({ id: v.id, name: v.name })) || []
			};
		}
	} catch (error) {
		results['variables_list'] = {
			status: 'ERROR',
			error: error instanceof Error ? error.message : String(error)
		};
	}
	
	console.log('[CPI TEST] Test results:', JSON.stringify(results, null, 2));
	return results;
}

// Funkcja do testowania różnych kombinacji zmiennych i jednostek
export async function testCpiDataCombinations(from: string, to: string): Promise<any> {
	const apiKey = getApiKey();
	const headers: Record<string, string> = { 
		'Accept': 'application/json', 
		...(apiKey ? { 'X-ClientId': apiKey } : {}) 
	};
	
	console.log(`[CPI COMBINATIONS] Testing combinations for ${from} to ${to}`);
	
	const results: any = {
		hasApiKey: !!apiKey,
		dateRange: { from, to },
		tests: {}
	};
	
	// Różne kombinacje zmiennych i jednostek do przetestowania
	const combinations = [
		// Nowa zmienna 64513 - priorytet
		{ unit: '000000000000', variable: '64513', name: 'POLSKA - CPI zmienna 64513' },
		{ unit: '72', variable: '64513', name: 'POLSKA (ID 72) - CPI zmienna 64513' },
		{ unit: '1', variable: '64513', name: 'POLSKA (ID 1) - CPI zmienna 64513' },
		{ unit: '0', variable: '64513', name: 'POLSKA (ID 0) - CPI zmienna 64513' },
		
		// Standardowe kombinacje
		{ unit: '000000000000', variable: '42169', name: 'POLSKA - CPI analogiczny miesiąc' },
		{ unit: '000000000000', variable: '217230', name: 'POLSKA - CPI ogółem' },
		{ unit: '000000000000', variable: '42170', name: 'POLSKA - CPI alternatywny 1' },
		{ unit: '000000000000', variable: '42171', name: 'POLSKA - CPI alternatywny 2' },
		
		// Inne możliwe ID dla Polski z oryginalną zmienną
		{ unit: '72', variable: '42169', name: 'POLSKA (ID 72) - CPI analogiczny miesiąc' },
		{ unit: '1', variable: '42169', name: 'POLSKA (ID 1) - CPI analogiczny miesiąc' },
		{ unit: '0', variable: '42169', name: 'POLSKA (ID 0) - CPI analogiczny miesiąc' },
		
		// Inne zmienne CPI
		{ unit: '000000000000', variable: '217231', name: 'POLSKA - CPI wariant 2' },
		{ unit: '000000000000', variable: '217232', name: 'POLSKA - CPI wariant 3' },
		{ unit: '000000000000', variable: '217233', name: 'POLSKA - CPI wariant 4' },
	];
	
	for (const combo of combinations) {
		const testKey = `${combo.unit}_${combo.variable}`;
		console.log(`[CPI COMBINATIONS] Testing: ${combo.name}`);
		
		try {
			// Test 1: Sprawdź czy zmienna istnieje
			const variableUrl = `${BDL_BASE}/variables/${combo.variable}?format=json`;
			const varRes = await fetch(variableUrl, { headers, signal: AbortSignal.timeout(10000) });
			
			let variableInfo = null;
			if (varRes.ok) {
				variableInfo = await varRes.json();
			}
			
			// Test 2: Sprawdź czy jednostka istnieje
			const unitUrl = `${BDL_BASE}/units/${combo.unit}?format=json`;
			const unitRes = await fetch(unitUrl, { headers, signal: AbortSignal.timeout(10000) });
			
			let unitInfo = null;
			if (unitRes.ok) {
				unitInfo = await unitRes.json();
			}
			
			// Test 3: Spróbuj pobrać dane
			const dataUrl = `${BDL_BASE}/data/by-unit/${combo.unit}?var-id=${combo.variable}&format=json&page-size=50`;
			const dataRes = await fetch(dataUrl, { headers, signal: AbortSignal.timeout(15000) });
			
			let dataInfo: any = null;
			if (dataRes.ok) {
				const dataJson = await dataRes.json();
				dataInfo = {
					status: 'SUCCESS',
					totalRecords: dataJson.totalRecords || 0,
					unitName: dataJson.unitName,
					resultsCount: dataJson?.results?.length || 0,
					dateRange: dataJson?.results?.length > 0 ? {
						earliest: dataJson.results[dataJson.results.length - 1],
						latest: dataJson.results[0]
					} : null,
					sampleData: dataJson?.results?.slice(0, 3) || [],
					relevantDataCount: 0,
					relevantSample: []
				};
				
				// Jeśli znaleźliśmy dane, sprawdź czy są w żądanym zakresie
				if (dataJson?.results?.length > 0) {
					const parseDate = (dateStr: string): Date => {
						const [year, month] = dateStr.split('-').map(Number);
						return new Date(year, month - 1, 1);
					};
					
					const start = parseDate(from);
					const end = parseDate(to);
					
					const relevantData = dataJson.results.filter((item: any) => {
						const itemYear = Number(item?.year);
						const itemMonth = Number(item?.month);
						if (Number.isFinite(itemYear) && Number.isFinite(itemMonth)) {
							const dataPoint = new Date(itemYear, itemMonth - 1, 1);
							return dataPoint >= start && dataPoint <= end;
						}
						return false;
					});
					
					dataInfo.relevantDataCount = relevantData.length;
					dataInfo.relevantSample = relevantData.slice(0, 3);
				}
			} else {
				const errorText = await dataRes.text();
				dataInfo = {
					status: 'ERROR',
					httpStatus: dataRes.status,
					error: errorText
				};
			}
			
			results.tests[testKey] = {
				combination: combo,
				variable: variableInfo ? {
					exists: true,
					name: variableInfo.name,
					subjectId: variableInfo.subjectId,
					measureUnit: variableInfo.measureUnitName
				} : { exists: false },
				unit: unitInfo ? {
					exists: true,
					name: unitInfo.name,
					level: unitInfo.level
				} : { exists: false },
				data: dataInfo
			};
			
			// Jeśli znaleźliśmy dane w żądanym zakresie, zaloguj sukces
			if (dataInfo?.relevantDataCount > 0) {
				console.log(`[CPI COMBINATIONS] SUCCESS: ${combo.name} has ${dataInfo.relevantDataCount} relevant data points`);
			}
			
		} catch (error) {
			results.tests[testKey] = {
				combination: combo,
				status: 'EXCEPTION',
				error: error instanceof Error ? error.message : String(error)
			};
		}
	}
	
	// Podsumowanie wyników
	const successfulCombinations = Object.entries(results.tests)
		.filter(([_, test]: [string, any]) => test.data?.relevantDataCount > 0)
		.map(([key, test]: [string, any]) => ({
			key,
			name: test.combination.name,
			dataCount: test.data.relevantDataCount,
			variable: test.combination.variable,
			unit: test.combination.unit
		}));
	
	results.summary = {
		totalTests: combinations.length,
		successfulCombinations: successfulCombinations.length,
		bestOptions: successfulCombinations.sort((a, b) => b.dataCount - a.dataCount)
	};
	
	console.log(`[CPI COMBINATIONS] Found ${successfulCombinations.length} working combinations`);
	
	return results;
}

// Funkcja do testowania konkretnej zmiennej 64513
export async function testVariable64513(from: string, to: string): Promise<any> {
	const apiKey = getApiKey();
	const headers: Record<string, string> = { 
		'Accept': 'application/json', 
		...(apiKey ? { 'X-ClientId': apiKey } : {}) 
	};
	
	console.log(`[CPI 64513] Testing variable 64513 for ${from} to ${to}`);
	
	const results: any = {
		hasApiKey: !!apiKey,
		variable: '64513',
		dateRange: { from, to },
		tests: {}
	};
	
	// Test różnych jednostek terytorialnych z zmienną 64513
	const unitsToTest = [
		{ id: '000000000000', name: 'POLSKA (standardowe ID)' },
		{ id: '72', name: 'POLSKA (ID 72)' },
		{ id: '1', name: 'POLSKA (ID 1)' },
		{ id: '0', name: 'POLSKA (ID 0)' },
		{ id: 'PL', name: 'POLSKA (kod PL)' },
	];
	
	for (const unit of unitsToTest) {
		const testKey = `unit_${unit.id}`;
		console.log(`[CPI 64513] Testing unit: ${unit.name}`);
		
		try {
			// Test 1: Sprawdź informacje o zmiennej
			const variableUrl = `${BDL_BASE}/variables/64513?format=json`;
			const varRes = await fetch(variableUrl, { headers, signal: AbortSignal.timeout(10000) });
			
			let variableInfo = null;
			if (varRes.ok) {
				variableInfo = await varRes.json();
				console.log(`[CPI 64513] Variable info:`, variableInfo.name);
			}
			
			// Test 2: Sprawdź czy jednostka istnieje
			const unitUrl = `${BDL_BASE}/units/${unit.id}?format=json`;
			const unitRes = await fetch(unitUrl, { headers, signal: AbortSignal.timeout(10000) });
			
			let unitInfo = null;
			if (unitRes.ok) {
				unitInfo = await unitRes.json();
				console.log(`[CPI 64513] Unit ${unit.id}:`, unitInfo.name);
			}
			
			// Test 3: Pobierz dane
			const dataUrl = `${BDL_BASE}/data/by-unit/${unit.id}?var-id=64513&format=json&page-size=100`;
			console.log(`[CPI 64513] Data URL: ${dataUrl}`);
			
			const dataRes = await fetch(dataUrl, { headers, signal: AbortSignal.timeout(15000) });
			
			console.log(`[CPI 64513] Data response for ${unit.id}: ${dataRes.status} ${dataRes.statusText}`);
			
			if (dataRes.ok) {
				const dataJson = await dataRes.json();
				console.log(`[CPI 64513] Response structure:`, Object.keys(dataJson));
				console.log(`[CPI 64513] Total records: ${dataJson.totalRecords || 0}`);
				console.log(`[CPI 64513] Results count: ${dataJson?.results?.length || 0}`);
				
				if (dataJson?.results?.length > 0) {
					console.log(`[CPI 64513] Sample data:`, JSON.stringify(dataJson.results[0], null, 2));
					
					// Filtruj dane w żądanym zakresie
					const parseDate = (dateStr: string): Date => {
						const [year, month] = dateStr.split('-').map(Number);
						return new Date(year, month - 1, 1);
					};
					
					const start = parseDate(from);
					const end = parseDate(to);
					
					const relevantData = dataJson.results.filter((item: any) => {
						const itemYear = Number(item?.year);
						const itemMonth = Number(item?.month);
						if (Number.isFinite(itemYear) && Number.isFinite(itemMonth)) {
							const dataPoint = new Date(itemYear, itemMonth - 1, 1);
							return dataPoint >= start && dataPoint <= end;
						}
						return false;
					});
					
					results.tests[testKey] = {
						unit: unit,
						variable: variableInfo,
						data: {
							status: 'SUCCESS',
							totalRecords: dataJson.totalRecords || 0,
							unitName: dataJson.unitName,
							resultsCount: dataJson?.results?.length || 0,
							relevantDataCount: relevantData.length,
							dateRange: {
								earliest: dataJson.results[dataJson.results.length - 1],
								latest: dataJson.results[0]
							},
							relevantSample: relevantData.slice(0, 5),
							allSample: dataJson.results.slice(0, 3)
						}
					};
					
					if (relevantData.length > 0) {
						console.log(`[CPI 64513] SUCCESS: Unit ${unit.id} has ${relevantData.length} relevant data points`);
						
						// Konwertuj dane do formatu CpiPoint
						const convertedData: CpiPoint[] = relevantData.map((item: any) => {
							const itemYear = Number(item.year);
							const itemMonth = Number(item.month);
							const itemValue = Number(item.val);
							
							// Konwertuj z indeksu (100 = brak zmiany) do procentów r/r
							const cpiYoY = itemValue - 100;
							const date = `${itemYear}-${String(itemMonth).padStart(2, '0')}-01`;
							
							return {
								date,
								value: Math.round(cpiYoY * 10) / 10
							};
						}).sort((a: CpiPoint, b: CpiPoint) => a.date.localeCompare(b.date));
						
						results.tests[testKey].convertedData = convertedData;
					}
				} else {
					results.tests[testKey] = {
						unit: unit,
						variable: variableInfo,
						data: {
							status: 'NO_DATA',
							totalRecords: dataJson.totalRecords || 0,
							unitName: dataJson.unitName,
							resultsCount: 0
						}
					};
				}
			} else {
				const errorText = await dataRes.text();
				results.tests[testKey] = {
					unit: unit,
					variable: variableInfo,
					data: {
						status: 'ERROR',
						httpStatus: dataRes.status,
						error: errorText
					}
				};
			}
		} catch (error) {
			results.tests[testKey] = {
				unit: unit,
				data: {
					status: 'EXCEPTION',
					error: error instanceof Error ? error.message : String(error)
				}
			};
		}
	}
	
	// Znajdź najlepszą opcję
	const successfulTests = Object.entries(results.tests)
		.filter(([_, test]: [string, any]) => test.data?.relevantDataCount > 0)
		.map(([key, test]: [string, any]) => ({
			key,
			unitId: test.unit.id,
			unitName: test.unit.name,
			dataCount: test.data.relevantDataCount,
			convertedData: test.convertedData
		}))
		.sort((a, b) => b.dataCount - a.dataCount);
	
	results.summary = {
		totalTests: unitsToTest.length,
		successfulTests: successfulTests.length,
		bestOption: successfulTests[0] || null,
		allSuccessful: successfulTests
	};
	
	console.log(`[CPI 64513] Summary: ${successfulTests.length} successful tests out of ${unitsToTest.length}`);
	if (successfulTests.length > 0) {
		console.log(`[CPI 64513] Best option: Unit ${successfulTests[0].unitId} with ${successfulTests[0].dataCount} data points`);
	}
	
	return results;
}

// Historia CPI r/r - tylko z GUS BDL API
export async function fetchCpiYoYHistory(from: string, to: string): Promise<CpiPoint[]> {
  // Użyj nowej funkcji fetchMonthlyCpiData
  return fetchMonthlyCpiData(from, to);
}