"use client";

import Script from 'next/script';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-9ZQNTH7W8J';

function hasAnalyticsConsent(): boolean {
  try {
    const raw = localStorage.getItem('cookieConsent')
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return !!parsed.analytics
  } catch {
    return false
  }
}

function GAInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Śledź zmiany trasy – ręczny page_view
    try {
      const raw = localStorage.getItem('cookieConsent');
      const ok = !!(raw && JSON.parse(raw || '{}').analytics);
      if (!ok) return;
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('config', MEASUREMENT_ID, {
          page_title: document.title,
          page_location: window.location.href,
          page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ''),
        });
      }
    } catch (error) {
      console.error('GA page tracking error:', error);
    }
  }, [pathname, searchParams]);

  return (
    <>
      <Script id="ga-loader" strategy="afterInteractive">
        {`
          (function(){
            try {
              var raw = localStorage.getItem('cookieConsent');
              var ok = false;
              if (raw) { 
                var c = JSON.parse(raw || '{}'); 
                ok = !!c.analytics; 
              }
              if (!ok) {
                return;
              }
              
              var s = document.createElement('script');
              s.src = 'https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}';
              s.async = true;
              s.onload = function(){
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);} 
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${MEASUREMENT_ID}', { 
                  page_title: document.title, 
                  page_location: window.location.href,
                  anonymize_ip: true,
                  allow_google_signals: false,
                  allow_ad_personalization_signals: false
                });
              };
              s.onerror = function(error) {
                console.error('GA: Failed to load script:', error);
                console.error('GA: Script src was:', s.src);
              };
              document.head.appendChild(s);
            } catch(e) {
              console.error('GA initialization error:', e);
            }
          })();
        `}
      </Script>
    </>
  );
}

export default function GoogleAnalytics() {
  return (
    <Suspense>
      <GAInner />
    </Suspense>
  );
}