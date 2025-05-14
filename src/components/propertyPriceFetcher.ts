export async function fetchPropertyPrice(url: string): Promise<number | null> {
    try {
      // Wysyłamy żądanie do naszego backendu, który będzie obsługiwał pobieranie ceny
      const response = await fetch('/api/fetch-property-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
  
      if (!response.ok) {
        throw new Error('Nie udało się pobrać ceny');
      }
  
      const data = await response.json();
      return data.price;
    } catch (error) {
      console.error('Błąd podczas pobierania ceny:', error);
      return null;
    }
  }