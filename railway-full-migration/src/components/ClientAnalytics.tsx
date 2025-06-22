'use client';

import { useEffect } from 'react';
import { trackPageView } from '@/lib/analytics';

export default function ClientAnalytics() {
  useEffect(() => {
    trackPageView('homepage');
  }, []);

  return null;
} 