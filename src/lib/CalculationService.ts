export class CalculationService {
    private apiUrl = 'http://localhost:8000/api/calculate.php';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async calculate(data: any): Promise<any> {
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