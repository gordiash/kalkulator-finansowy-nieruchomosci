import { useEffect } from 'react';

// Interfejs dla obiektu window zawierający właściwości Google AdSense
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const GoogleAdsense = () => {
  useEffect(() => {
    // Funkcja ładująca skrypt Google AdSense
    const loadGoogleAdsense = () => {
      // Sprawdzenie czy skrypt już nie istnieje
      if (document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js"]')) {
        return;
      }

      try {
        // Tworzenie skryptu
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2543665837502840';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.defer = true;
        
        // Obsługa błędów ładowania skryptu
        script.onerror = () => {
          console.error('Błąd ładowania skryptu Google AdSense');
        };
        
        // Dodanie skryptu do dokumentu
        document.head.appendChild(script);
        
        // Inicjalizacja tablicy adsbygoogle
        window.adsbygoogle = window.adsbygoogle || [];
      } catch (error) {
        console.error('Błąd podczas inicjalizacji Google AdSense:', error);
      }
    };
    
    // Ładujemy Google AdSense tylko w środowisku produkcyjnym
    if (process.env.NODE_ENV === 'production' && window.location.hostname !== 'localhost') {
      loadGoogleAdsense();
    }
    
    return () => {
      // Opcjonalnie: Czyszczenie po odmontowaniu komponentu
    };
  }, []);
  
  return null; // Komponent nie renderuje żadnego UI
};

export default GoogleAdsense; 