import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

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

// Raportowanie metryk Web Vitals
reportWebVitals(process.env.NODE_ENV === 'production' ? 
  (metric) => {
    // W środowisku produkcyjnym metryki będą zbierane przez komponent GoogleAnalytics
  } : undefined
); 