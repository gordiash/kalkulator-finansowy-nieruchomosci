'use client';

import { useState, useEffect } from 'react';

interface CookieConsentData {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

export const useCookieConsent = () => {
  const [consent, setConsent] = useState<CookieConsentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cookieConsent');
      if (stored) {
        const parsedConsent = JSON.parse(stored);
        setConsent(parsedConsent);
      }
    } catch (error) {
      console.error('Error reading cookie consent:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateConsent = (newConsent: Partial<CookieConsentData>) => {
    const updatedConsent = {
      necessary: true, // Always true
      analytics: false,
      marketing: false,
      timestamp: new Date().getTime(),
      ...newConsent,
    };

    try {
      localStorage.setItem('cookieConsent', JSON.stringify(updatedConsent));
      setConsent(updatedConsent);
    } catch (error) {
      console.error('Error saving cookie consent:', error);
    }
  };

  const hasConsent = () => {
    return consent !== null;
  };

  const canUseAnalytics = () => {
    return consent?.analytics === true;
  };

  const canUseMarketing = () => {
    return consent?.marketing === true;
  };

  const revokeConsent = () => {
    try {
      localStorage.removeItem('cookieConsent');
      setConsent(null);
    } catch (error) {
      console.error('Error revoking cookie consent:', error);
    }
  };

  return {
    consent,
    isLoading,
    hasConsent: hasConsent(),
    canUseAnalytics: canUseAnalytics(),
    canUseMarketing: canUseMarketing(),
    updateConsent,
    revokeConsent,
  };
}; 