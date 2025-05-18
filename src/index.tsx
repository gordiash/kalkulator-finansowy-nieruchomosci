import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

// Inicjalizacja Google Analytics
const initializeGoogleAnalytics = () => {
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-9ZQNTH7W8J';
  
  script.onload = () => {
    // Konfiguracja Google Analytics
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', 'G-9ZQNTH7W8J');
  };
  
  document.head.appendChild(script);
};

// Deklaracja interfejsu dla window
declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Wywołanie inicjalizacji Google Analytics
if (process.env.NODE_ENV === 'production') {
  initializeGoogleAnalytics();
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals((metric) => {
  if (process.env.NODE_ENV === 'production') {
    // Wysyłanie metryk wydajności do Google Analytics
    const { name, value } = metric;
    window.dataLayer.push({
      event: 'web-vitals',
      eventCategory: 'Web Vitals',
      eventAction: name,
      eventValue: Math.round(name === 'CLS' ? value * 1000 : value),
      eventLabel: window.location.pathname,
      nonInteraction: true,
    });
  }
}); 