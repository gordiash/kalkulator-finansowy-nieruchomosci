import { fetchNBPInflationData, fetchNBPInflationHistory, fetchNBPCoreInflationHistory } from '@/lib/market/nbp';

// Mock fetch
global.fetch = jest.fn();

describe('NBP Inflation API', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('fetchNBPInflationData', () => {
		it('powinien pobrać dane o inflacji CPI i bazowej', async () => {
			const mockCpiResponse = [
				{ date: '2024-01-01', value: 3.2 },
				{ date: '2023-12-01', value: 3.5 }
			];
			
			const mockCoreResponse = [
				{ date: '2024-01-01', value: 2.8 },
				{ date: '2023-12-01', value: 3.1 }
			];

			(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					ok: true,
					text: () => Promise.resolve(JSON.stringify(mockCpiResponse))
				})
				.mockResolvedValueOnce({
					ok: true,
					text: () => Promise.resolve(JSON.stringify(mockCoreResponse))
				});

			const result = await fetchNBPInflationData();

			expect(result).toEqual({
				date: '2024-01-01',
				cpi_yoy: 3.2,
				core_inflation: 2.8,
				source: 'nbp'
			});

			expect(global.fetch).toHaveBeenCalledTimes(2);
		});

		it('powinien obsłużyć błąd API CPI', async () => {
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
				status: 500
			});

			const result = await fetchNBPInflationData();
			expect(result).toBeNull();
		});

		it('powinien obsłużyć błąd API inflacji bazowej', async () => {
			const mockCpiResponse = [{ date: '2024-01-01', value: 3.2 }];
			
			(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					ok: true,
					text: () => Promise.resolve(JSON.stringify(mockCpiResponse))
				})
				.mockResolvedValueOnce({
					ok: false,
					status: 500
				});

			const result = await fetchNBPInflationData();

			expect(result).toEqual({
				date: '2024-01-01',
				cpi_yoy: 3.2,
				core_inflation: 0,
				source: 'nbp'
			});
		});
	});

	describe('fetchNBPInflationHistory', () => {
		it('powinien pobrać historię inflacji CPI', async () => {
			const mockResponse = [
				{ date: '2024-01-01', value: 3.2 },
				{ date: '2023-12-01', value: 3.5 },
				{ date: '2023-11-01', value: 3.8 }
			];

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(JSON.stringify(mockResponse))
			});

			const result = await fetchNBPInflationHistory(3);

			expect(result).toEqual([
				{ date: '2023-11-01', cpi_yoy: 3.8 },
				{ date: '2023-12-01', cpi_yoy: 3.5 },
				{ date: '2024-01-01', cpi_yoy: 3.2 }
			]);
		});

		it('powinien obsłużyć błąd API', async () => {
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
				status: 500
			});

			const result = await fetchNBPInflationHistory();
			expect(result).toEqual([]);
		});

		it('powinien obsłużyć nieprawidłowe dane', async () => {
			const mockResponse = [
				{ date: '2024-01-01', value: 'invalid' },
				{ date: '2023-12-01', value: 3.5 }
			];

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(JSON.stringify(mockResponse))
			});

			const result = await fetchNBPInflationHistory();

			// Sprawdź czy wynik zawiera tylko prawidłowe dane (bez NaN)
			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({ date: '2023-12-01', cpi_yoy: 3.5 });
			// Sprawdź czy nie ma NaN w wynikach
			expect(result.every(item => !isNaN(item.cpi_yoy))).toBe(true);
		});
	});

	describe('fetchNBPCoreInflationHistory', () => {
		it('powinien pobrać historię inflacji bazowej', async () => {
			const mockResponse = [
				{ date: '2024-01-01', value: 2.8 },
				{ date: '2023-12-01', value: 3.1 },
				{ date: '2023-11-01', value: 3.4 }
			];

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(JSON.stringify(mockResponse))
			});

			const result = await fetchNBPCoreInflationHistory(3);

			expect(result).toEqual([
				{ date: '2023-11-01', core_inflation: 3.4 },
				{ date: '2023-12-01', core_inflation: 3.1 },
				{ date: '2024-01-01', core_inflation: 2.8 }
			]);
		});

		it('powinien obsłużyć błąd API', async () => {
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
				status: 500
			});

			const result = await fetchNBPCoreInflationHistory();
			expect(result).toEqual([]);
		});
	});

	describe('timeout handling', () => {
		it('powinien obsłużyć timeout', async () => {
			// Mock AbortController aby symulować timeout
			const originalAbortController = global.AbortController;
			global.AbortController = jest.fn().mockImplementation(() => ({
				abort: jest.fn(),
				signal: { aborted: false }
			}));

			// Symuluj bardzo wolny fetch
			(global.fetch as jest.Mock).mockImplementation(() => 
				new Promise(resolve => setTimeout(() => resolve({ ok: true, text: () => Promise.resolve('[]') }), 100))
			);

			const result = await fetchNBPInflationData();
			expect(result).toBeNull();

			// Przywróć oryginalny AbortController
			global.AbortController = originalAbortController;
		});
	});
});
