/**
 * Debug utilities for Google Analytics
 */

export const gaDebug = {
  /**
   * Check if GA is properly initialized
   */
  checkGAStatus: () => {
    if (typeof window === 'undefined') {
      console.log('GA Debug: Running on server side');
      return false;
    }

    const win = window as any;
    const hasDataLayer = !!win.dataLayer;
    const hasGtag = !!win.gtag;
    const hasConsent = (() => {
      try {
        const raw = localStorage.getItem('cookieConsent');
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        return !!parsed.analytics;
      } catch {
        return false;
      }
    })();

    const status = {
      hasDataLayer,
      hasGtag,
      hasConsent,
      dataLayerLength: hasDataLayer ? win.dataLayer.length : 0,
      measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-9ZQNTH7W8J'
    };

    console.log('GA Debug Status:', status);
    return status;
  },

  /**
   * Send a test event to GA
   */
  sendTestEvent: (eventName: string = 'test_event') => {
    if (typeof window === 'undefined') return false;

    const win = window as any;
    if (!win.gtag) {
      console.error('GA Debug: gtag not available');
      return false;
    }

    try {
      win.gtag('event', eventName, {
        event_category: 'debug',
        event_label: 'test',
        value: 1
      });
      console.log(`GA Debug: Sent test event "${eventName}"`);
      return true;
    } catch (error) {
      console.error('GA Debug: Failed to send test event:', error);
      return false;
    }
  },

  /**
   * Check consent status
   */
  checkConsent: () => {
    if (typeof window === 'undefined') return null;

    try {
      const raw = localStorage.getItem('cookieConsent');
      if (!raw) {
        console.log('GA Debug: No consent data found');
        return null;
      }
      
      const parsed = JSON.parse(raw);
      console.log('GA Debug: Consent data:', parsed);
      return parsed;
    } catch (error) {
      console.error('GA Debug: Error reading consent:', error);
      return null;
    }
  },

  /**
   * Force initialize GA (for testing)
   */
  forceInit: () => {
    if (typeof window === 'undefined') return false;

    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-9ZQNTH7W8J';
    
    try {
      // Remove existing script if any
      const existing = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
      if (existing) {
        existing.remove();
      }

      // Create new script
      const s = document.createElement('script');
      s.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      s.async = true;
      s.onload = function(){
        const win = window as any;
        win.dataLayer = win.dataLayer || [];
        function gtag(...args: any[]) {
          win.dataLayer.push(args);
        }
        win.gtag = gtag;
        gtag('js', new Date());
        gtag('config', measurementId, {
          anonymize_ip: true,
          allow_google_signals: false,
          allow_ad_personalization_signals: false
        });
        console.log('GA Debug: Force initialized successfully');
      };
      s.onerror = function() {
        console.error('GA Debug: Failed to force initialize');
      };
      document.head.appendChild(s);
      return true;
    } catch (error) {
      console.error('GA Debug: Force init error:', error);
      return false;
    }
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).gaDebug = gaDebug;
}
