"use client";

import Script from 'next/script';

const MEASUREMENT_ID = 'G-9ZQNTH7W8J';

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

export default function GoogleAnalytics() {
  return (
    <>
      <Script id="ga-loader" strategy="idle">
        {`
          (function(){
            try {
              var raw = localStorage.getItem('cookieConsent');
              var ok = false;
              if (raw) { var c = JSON.parse(raw || '{}'); ok = !!c.analytics; }
              if (!ok) return;
              var s = document.createElement('script');
              s.src = 'https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}';
              s.async = true;
              s.onload = function(){
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);} 
                gtag('js', new Date());
                gtag('config', '${MEASUREMENT_ID}', { page_title: document.title, page_location: window.location.href });
              };
              document.head.appendChild(s);
            } catch(e) {}
          })();
        `}
      </Script>
    </>
  );
} 