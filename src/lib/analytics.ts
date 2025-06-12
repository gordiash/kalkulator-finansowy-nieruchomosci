// Google Analytics event tracking functions

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config?: Record<string, any>
    ) => void;
  }
}

export const GA_MEASUREMENT_ID = 'G-355556102';

// Funkcja do śledzenia zdarzeń
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...parameters,
      send_to: GA_MEASUREMENT_ID,
    });
  }
};

// Funkcje do śledzenia konkretnych zdarzeń kalkulatorów
export const trackCalculatorUse = (calculatorType: 'credit-score' | 'rental' | 'purchase') => {
  trackEvent('calculator_use', {
    calculator_type: calculatorType,
    event_category: 'engagement',
  });
};

export const trackCalculatorResult = (
  calculatorType: 'credit-score' | 'rental' | 'purchase',
  result: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters?: Record<string, any>
) => {
  trackEvent('calculator_result', {
    calculator_type: calculatorType,
    result_value: result,
    event_category: 'conversion',
    ...parameters,
  });
};

// Śledzenie błędów
export const trackError = (errorType: string, errorMessage: string) => {
  trackEvent('error', {
    error_type: errorType,
    error_message: errorMessage,
    event_category: 'error',
  });
};

// Śledzenie czasu spędzonego na stronie
export const trackPageView = (pageName: string) => {
  trackEvent('page_view', {
    page_name: pageName,
    event_category: 'engagement',
  });
}; 