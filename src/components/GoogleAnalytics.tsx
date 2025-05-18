import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Interfejs dla obiektu window z typami Google Analytics
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Ładowanie skryptu Google Analytics 
    const loadGoogleAnalytics = () => {
      // Sprawdzenie czy skrypt już nie istnieje
      if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
        return;
      }

      // Tworzenie skryptu
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=G-9ZQNTH7W8J`;
      script.async = true;
      script.defer = true;
      
      // Dodanie skryptu do dokumentu
      document.head.appendChild(script);
        
      // Inicjalizacja Google Analytics
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: any[]) {
        window.dataLayer.push(arguments);
      };
      
      window.gtag('js', new Date());
      window.gtag('config', 'G-9ZQNTH7W8J', {
        send_page_view: false // Wyłączamy domyślne śledzenie stron, będziemy robić to ręcznie
      });
    };
    
    // Ładujemy Google Analytics tylko w środowisku produkcyjnym
    if (process.env.NODE_ENV === 'production') {
      loadGoogleAnalytics();
    }
  }, []);
  
  // Śledzenie zmian strony
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && window.gtag) {
      // Śledzenie odsłony strony
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname + location.search
      });
    }
  }, [location]);
  
  return null; // Komponent nie renderuje żadnego UI
};

export default GoogleAnalytics; 