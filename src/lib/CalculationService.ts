export class CalculationService {
    private apiUrl: string;

    constructor() {
        // W środowisku produkcyjnym używaj relative path do Next.js API route
        // W developmencie możesz nadal używać localhost lub też relative path
        this.apiUrl = process.env.NODE_ENV === 'production' 
            ? '/api/calculate.php' 
            : (process.env.NEXT_PUBLIC_API_URL || '/api/calculate.php');
    }

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