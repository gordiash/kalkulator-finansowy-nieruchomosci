import { NextRequest } from 'next/server';
import { GET } from '@/app/api/market/inflation/route';

// Mock rate limiting
jest.mock('@/lib/rateLimit', () => ({
	rateLimitMiddleware: jest.fn().mockResolvedValue({ status: 200 })
}));

// Mock NBP functions
jest.mock('@/lib/market/nbp', () => ({
	fetchNBPInflationData: jest.fn(),
	fetchNBPInflationHistory: jest.fn(),
	fetchNBPCoreInflationHistory: jest.fn()
}));

const { fetchNBPInflationData, fetchNBPInflationHistory, fetchNBPCoreInflationHistory } = require('@/lib/market/nbp');

describe('/api/market/inflation', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const createRequest = (url: string): NextRequest => {
		return new NextRequest(url) as any;
	};

	describe('GET /api/market/inflation', () => {
		it('powinien zwrócić aktualne dane o inflacji (domyślnie)', async () => {
			const mockData = {
				date: '2024-01-01',
				cpi_yoy: 3.2,
				core_inflation: 2.8,
				source: 'nbp'
			};

			fetchNBPInflationData.mockResolvedValue(mockData);

			const request = createRequest('http://localhost:3000/api/market/inflation');
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.data).toEqual(mockData);
			expect(fetchNBPInflationData).toHaveBeenCalledTimes(1);
		});

		it('powinien zwrócić aktualne dane o inflacji (type=current)', async () => {
			const mockData = {
				date: '2024-01-01',
				cpi_yoy: 3.2,
				core_inflation: 2.8,
				source: 'nbp'
			};

			fetchNBPInflationData.mockResolvedValue(mockData);

			const request = createRequest('http://localhost:3000/api/market/inflation?type=current');
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.data).toEqual(mockData);
			expect(fetchNBPInflationData).toHaveBeenCalledTimes(1);
		});

		it('powinien zwrócić historię inflacji CPI (type=cpi_history)', async () => {
			const mockData = [
				{ date: '2024-01-01', cpi_yoy: 3.2 },
				{ date: '2023-12-01', cpi_yoy: 3.5 }
			];

			fetchNBPInflationHistory.mockResolvedValue(mockData);

			const request = createRequest('http://localhost:3000/api/market/inflation?type=cpi_history&months=12');
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.data).toEqual(mockData);
			expect(fetchNBPInflationHistory).toHaveBeenCalledWith(12);
		});

		it('powinien zwrócić historię inflacji bazowej (type=core_history)', async () => {
			const mockData = [
				{ date: '2024-01-01', core_inflation: 2.8 },
				{ date: '2023-12-01', core_inflation: 3.1 }
			];

			fetchNBPCoreInflationHistory.mockResolvedValue(mockData);

			const request = createRequest('http://localhost:3000/api/market/inflation?type=core_history&months=24');
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.data).toEqual(mockData);
			expect(fetchNBPCoreInflationHistory).toHaveBeenCalledWith(24);
		});

		it('powinien użyć domyślnej liczby miesięcy (24) gdy nie podano', async () => {
			const mockData = [{ date: '2024-01-01', cpi_yoy: 3.2 }];

			fetchNBPInflationHistory.mockResolvedValue(mockData);

			const request = createRequest('http://localhost:3000/api/market/inflation?type=cpi_history');
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(fetchNBPInflationHistory).toHaveBeenCalledWith(24);
		});

		it('powinien zwrócić błąd 404 gdy brak danych', async () => {
			fetchNBPInflationData.mockResolvedValue(null);

			const request = createRequest('http://localhost:3000/api/market/inflation');
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(404);
			expect(data.error.code).toBe('NO_DATA');
			expect(data.error.message).toBe('Brak danych o inflacji');
		});

		it('powinien obsłużyć błąd podczas pobierania danych', async () => {
			fetchNBPInflationData.mockRejectedValue(new Error('Network error'));

			const request = createRequest('http://localhost:3000/api/market/inflation');
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data.error.code).toBe('INTERNAL_ERROR');
			expect(data.error.message).toBe('Nie udało się pobrać danych o inflacji');
		});
	});
});
