export class CalculationService {
    private apiUrl: string;

    constructor() {
        // Używamy zawsze relatywnej ścieżki do API route w Next.js
        this.apiUrl = '/api/calculate';
    }

    async calculate(data: Record<string, unknown>): Promise<any> {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Błąd serwera: ${response.status} ${response.statusText}. Treść: ${errorText}`);
            }

            const responseData = await response.json();
            return responseData.calculationResults;
        } catch (error) {
            console.error('Błąd w CalculationService:', error);
            throw error;
        }
    }
} 