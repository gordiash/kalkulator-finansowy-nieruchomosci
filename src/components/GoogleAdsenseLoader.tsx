import { useEffect, useState } from 'react';

// Interfejs dla obiektu window
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

/**
 * GoogleAdsenseLoader - komponent ładujący Google AdSense w bezpieczny sposób
 * Używa kilku alternatywnych metod ładowania, aby zwiększyć szanse na powodzenie
 */
const GoogleAdsenseLoader = () => {
  const [loadMethod, setLoadMethod] = useState<'direct' | 'iframe' | 'none'>('direct');
  
  // Metoda 1: Bezpośrednie ładowanie skryptu
  const loadDirectScript = () => {
    try {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.dataset.adClient = 'ca-pub-2543665837502840';
      
      script.onload = () => {
        console.log('AdSense załadowany bezpośrednio');
        window.adsbygoogle = window.adsbygoogle || [];
      };
      
      script.onerror = () => {
        console.warn('Nie udało się załadować AdSense bezpośrednio, próbuję alternatywną metodę');
        setLoadMethod('iframe');
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.error('Błąd przy ładowaniu AdSense bezpośrednio:', error);
      setLoadMethod('iframe');
    }
  };
  
  // Metoda 2: Ładowanie przez iframe (obejście ograniczeń CSP)
  const loadViaIframe = () => {
    try {
      // Tworzenie iframe, który będzie ładował skrypt AdSense
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      // Dostęp do dokumentu iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        // Tworzenie skryptu w iframe
        const script = iframeDoc.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2543665837502840';
        script.async = true;
        
        script.onload = () => {
          console.log('AdSense załadowany przez iframe');
          
          // Synchronizacja z głównym oknem
          if (iframe.contentWindow && iframe.contentWindow.adsbygoogle) {
            window.adsbygoogle = iframe.contentWindow.adsbygoogle;
          }
        };
        
        script.onerror = () => {
          console.warn('Nie udało się załadować AdSense przez iframe');
          setLoadMethod('none');
        };
        
        iframeDoc.head.appendChild(script);
      }
    } catch (error) {
      console.error('Błąd przy ładowaniu AdSense przez iframe:', error);
      setLoadMethod('none');
    }
  };
  
  useEffect(() => {
    // Ładuj tylko w środowisku produkcyjnym
    if (process.env.NODE_ENV === 'production' && window.location.hostname !== 'localhost') {
      // Próbujemy różnych metod ładowania w zależności od aktualnego stanu
      switch (loadMethod) {
        case 'direct':
          // Najpierw próbujemy bezpośredniego ładowania
          setTimeout(loadDirectScript, 1000);
          break;
        case 'iframe':
          // Jeśli bezpośrednie ładowanie nie zadziałało, próbujemy przez iframe
          setTimeout(loadViaIframe, 1000);
          break;
        case 'none':
          // Jeśli żadna metoda nie zadziałała, rezygnujemy z reklam
          console.warn('Nie udało się załadować Google AdSense - reklamy nie będą wyświetlane');
          break;
      }
    }
  }, [loadMethod]);
  
  return null; // Komponent nie renderuje żadnego UI
};

export default GoogleAdsenseLoader; 