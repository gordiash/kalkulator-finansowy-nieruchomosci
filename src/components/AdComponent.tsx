import React, { useEffect, useRef } from 'react';

interface AdComponentProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  style?: React.CSSProperties;
}

const AdComponent: React.FC<AdComponentProps> = ({ adSlot, adFormat = 'auto', style }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // W środowisku deweloperskim wyświetl placeholder
    if (process.env.NODE_ENV !== 'production' || window.location.hostname === 'localhost') {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = 
          '<div style="background-color:#f0f0f0;border:1px solid #ccc;padding:1rem;text-align:center;color:#666;height:100%;display:flex;align-items:center;justify-content:center;">'+
          '<p>Miejsce na reklamę (widoczne tylko w środowisku produkcyjnym)</p>'+
          '</div>';
      }
      return;
    }

    try {
      // Używamy najprostszej możliwej metody aktywacji reklam
      if (adContainerRef.current) {
        // Bezpośrednie wstawienie kodu HTML reklamy
        adContainerRef.current.innerHTML = `
          <ins class="adsbygoogle"
              style="display:block"
              data-ad-client="ca-pub-2543665837502840"
              data-ad-slot="${adSlot}"
              data-ad-format="${adFormat}"
              data-full-width-responsive="true">
          </ins>
          <script>
              (adsbygoogle = window.adsbygoogle || []).push({});
          </script>
        `;
      }
    } catch (error) {
      console.error('Błąd podczas renderowania reklamy:', error);
      
      // Zapasowa metoda ładowania reklam
      if (adContainerRef.current && typeof window.adsbygoogle !== 'undefined') {
        setTimeout(() => {
          try {
            window.adsbygoogle.push({});
          } catch (pushError) {
            console.error('Błąd podczas ładowania reklamy metodą zapasową:', pushError);
          }
        }, 1000);
      }
    }
    
    return () => {
      // Czyszczenie przy odmontowaniu komponentu
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, [adSlot, adFormat]);
  
  const formatClasses = {
    auto: 'block mx-auto my-4',
    fluid: 'w-full my-4',
    rectangle: 'block mx-auto my-4',
    horizontal: 'block mx-auto my-4',
    vertical: 'block mx-auto my-4 h-full'
  };
  
  return (
    <div 
      ref={adContainerRef}
      className={`ad-container ${formatClasses[adFormat]}`} 
      style={style}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
    />
  );
};

export default AdComponent; 