import React, { useEffect, useRef } from 'react';

interface AdComponentProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  style?: React.CSSProperties;
}

const AdComponent: React.FC<AdComponentProps> = ({ adSlot, adFormat = 'auto', style }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Sprawdź, czy jesteśmy w środowisku produkcyjnym
    // Nie ładuj reklam na localhost/środowisku deweloperskim
    if (process.env.NODE_ENV === 'production' && window.location.hostname !== 'localhost') {
      try {
        const { adsbygoogle } = window as any;
        
        if (adsbygoogle && adContainerRef.current) {
          // Czekaj aż skrypt AdSense zostanie załadowany
          if (adsbygoogle.loaded) {
            adsbygoogle.push({});
          } else {
            const adsByGoogleInterval = setInterval(() => {
              if (adsbygoogle.loaded) {
                adsbygoogle.push({});
                clearInterval(adsByGoogleInterval);
              }
            }, 300);
            
            // Limit czasu - jeśli AdSense nie załaduje się w ciągu 5 sekund, przestań próbować
            setTimeout(() => {
              clearInterval(adsByGoogleInterval);
            }, 5000);
          }
        }
      } catch (error) {
        console.error('Błąd podczas ładowania reklamy AdSense:', error);
      }
    } else {
      // W środowisku deweloperskim wyświetl placeholder zamiast reklamy
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = 
          '<div style="background-color:#f0f0f0;border:1px solid #ccc;padding:1rem;text-align:center;color:#666;height:100%;display:flex;align-items:center;justify-content:center;">'+
          '<p>Miejsce na reklamę (widoczne tylko w środowisku produkcyjnym)</p>'+
          '</div>';
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
    >
      <ins 
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-2543665837502840"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdComponent; 