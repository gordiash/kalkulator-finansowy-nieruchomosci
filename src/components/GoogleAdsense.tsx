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
        // Inicjalizacja tablicy adsbygoogle
        window.adsbygoogle = window.adsbygoogle || [];
        
        // Tworzenie skryptu
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        script.async = true;
        script.dataset.adClient = 'ca-pub-2543665837502840';
        
        // Ustawienie atrybutów w sposób zgodny z CSP
        // Nie używamy crossOrigin="anonymous", które może powodować problemy z CSP
        
        // Obsługa błędów ładowania skryptu
        script.onerror = (error) => {
          console.error('Błąd ładowania skryptu Google AdSense:', error);
          
          // Alternatywne podejście - próba załadowania z innym adresem
          setTimeout(() => {
            const alternativeScript = document.createElement('script');
            alternativeScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2543665837502840';
            alternativeScript.async = true;
            document.head.appendChild(alternativeScript);
          }, 1000);
        };
        
        // Obsługa sukcesu ładowania
        script.onload = () => {
          console.log('Google AdSense załadowany pomyślnie');
        };
        
        // Dodanie skryptu do dokumentu
        document.head.appendChild(script);
      } catch (error) {
        console.error('Błąd podczas inicjalizacji Google AdSense:', error);
      }
    };
    
    // Ładujemy Google AdSense tylko w środowisku produkcyjnym
    if (process.env.NODE_ENV === 'production' && window.location.hostname !== 'localhost') {
      // Dodanie opóźnienia przed ładowaniem AdSense może pomóc rozwiązać problemy z CSP
      setTimeout(loadGoogleAdsense, 1000);
    }
    
    return () => {
      // Opcjonalnie: Czyszczenie po odmontowaniu komponentu
    };
  }, []);
  
  return null; // Komponent nie renderuje żadnego UI
};

export default GoogleAdsense; 