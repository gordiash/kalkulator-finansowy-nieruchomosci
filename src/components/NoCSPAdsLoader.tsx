import { useEffect } from 'react';

/**
 * NoCSPAdsLoader - Komponent ładujący reklamy z pominięciem większości ograniczeń CSP
 * OSTRZEŻENIE: To rozwiązanie jest używane jako ostateczność i może wprowadzić ryzyko
 * związane z bezpieczeństwem. W produkcji zaleca się stosowanie bardziej restrykcyjnych
 * polityk CSP.
 */
const NoCSPAdsLoader = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || window.location.hostname === 'localhost') {
      return; // Nie ładuj w środowisku deweloperskim
    }

    try {
      // 1. Metoda synchronicznego dodania meta tagów CSP bezpośrednio do head
      const addMetaTags = () => {
        // Dynamiczne dodanie meta tagów przed ładowaniem skryptów
        const metaCSP = document.createElement('meta');
        metaCSP.httpEquiv = 'Content-Security-Policy';
        metaCSP.content = "script-src * 'unsafe-inline' 'unsafe-eval'; frame-src *;";
        document.head.appendChild(metaCSP);
      };

      // 2. Metoda skryptów inline z base64 - używa obejścia CSP
      const loadAdSenseInline = () => {
        // Tworzymy skrypt bezpośrednio w stronie
        const inlineScript = document.createElement('script');
        inlineScript.innerHTML = `
          (function() {
            window.adsbygoogle = window.adsbygoogle || [];
            
            // Generujemy dynamiczny skrypt
            var script = document.createElement('script');
            script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2543665837502840';
            script.async = true;
            document.head.appendChild(script);
            
            // Czekamy na załadowanie
            var checkAdsense = setInterval(function() {
              if (typeof window.adsbygoogle.push === 'function') {
                clearInterval(checkAdsense);
                console.log('AdSense załadowany pomyślnie');
              }
            }, 300);
            
            // Zatrzymaj sprawdzanie po 10 sekundach
            setTimeout(function() { 
              clearInterval(checkAdsense);
            }, 10000);
          })();
        `;
        document.head.appendChild(inlineScript);
      };

      // 3. Metoda ze skryptem zewnętrznym
      const loadExternalAdSense = () => {
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        script.async = true;
        // Usuń parametr client z URL i dodaj jako atrybut data-
        script.dataset.adClient = 'ca-pub-2543665837502840';
        document.head.appendChild(script);

        window.adsbygoogle = window.adsbygoogle || [];
      };

      // 4. Metoda z dokumentem HTML jako string
      const loadAdSenseWithDOMParser = () => {
        const htmlString = `
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2543665837502840" crossorigin="anonymous"></script>
        `;
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const scriptNode = doc.querySelector('script');
        
        if (scriptNode) {
          const newScript = document.createElement('script');
          newScript.async = true;
          newScript.src = scriptNode.src;
          if (scriptNode.crossOrigin) {
            newScript.crossOrigin = "anonymous";
          }
          document.head.appendChild(newScript);
        }

        window.adsbygoogle = window.adsbygoogle || [];
      };

      // Uruchamiamy wszystkie metody z opóźnieniem sekwencyjnym
      setTimeout(addMetaTags, 500);
      setTimeout(loadExternalAdSense, 1000);
      setTimeout(loadAdSenseInline, 1500);
      setTimeout(loadAdSenseWithDOMParser, 2000);

    } catch (error) {
      console.error('Błąd przy ładowaniu reklam:', error);
    }

    return () => {
      // Czyszczenie nie jest konieczne
    };
  }, []);

  return null;
};

export default NoCSPAdsLoader; 