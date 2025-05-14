import React from 'react';

const LogoSVG: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 420 150" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ minWidth: '100px', minHeight: '50px' }}
      >
        {/* Niebieski dom */}
        <path 
          d="M60 40 L135 40 L135 150 L60 150 Z" 
          fill="#1a4e8e" 
        />
        <path 
          d="M97.5 15 L60 40 L135 40 Z" 
          fill="#1a4e8e" 
        />
        
        {/* Okno domu */}
        <rect x="85" y="75" width="25" height="25" fill="#ffffff" />
        
        {/* Zielony kalkulator */}
        <rect x="150" y="40" width="100" height="130" rx="10" fill="#2e9f74" stroke="#ffffff" strokeWidth="3" />
        
        {/* Ekran kalkulatora z wykresem */}
        <rect x="160" y="50" width="80" height="50" rx="5" fill="#ffffff" />
        
        {/* Strzałka wykresu na ekranie */}
        <path 
          d="M170 85 L190 70 L210 77 L230 55" 
          stroke="#2e9f74" 
          strokeWidth="4" 
          fill="none" 
        />
        <polygon 
          points="225,50 235,55 230,65" 
          fill="#2e9f74" 
        />
        
        {/* Przyciski kalkulatora - pierwszy rząd */}
        <rect x="165" y="110" width="30" height="20" rx="3" fill="#ffffff" />
        <rect x="205" y="110" width="30" height="20" rx="3" fill="#ffffff" />
        
        {/* Przyciski kalkulatora - drugi rząd */}
        <rect x="165" y="140" width="30" height="20" rx="3" fill="#ffffff" />
        <rect x="205" y="140" width="30" height="20" rx="3" fill="#ffffff" />
      </svg>
    </div>
  );
};

export default LogoSVG; 