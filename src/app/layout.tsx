import type { Metadata } from "next";
import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import NewsletterPopup from "@/components/NewsletterPopup";
import RagChatWidget from "@/components/RagChatWidget";

// Import GA debug utilities in development
if (process.env.NODE_ENV === 'development') {
  import('@/lib/gaDebug');
}

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Kalkulatory Nieruchomości - Wycena AI, Zdolność Kredytowa, Wynajem | Analityka Nieruchomości",
  description: "Profesjonalne kalkulatory nieruchomości: wycena mieszkania AI (MAPE 0.79%), zdolność kredytowa, rentowność wynajmu, koszty zakupu. Blog ekspercki i analiza rynku.",
  keywords: "kalkulator wyceny mieszkania, zdolność kredytowa, rentowność wynajmu, koszty zakupu nieruchomości, analiza rynku nieruchomości, AI wycena, kalkulator kredytu hipotecznego, kalkulator zdolności kredytowej, kredyt hipoteczny kalkulator, oblicz zdolność kredytową, symulacja kredytu hipotecznego, kalkulator RRSO, kredyt na mieszkanie kalkulator, oprocentowanie kredytu hipotecznego, koszt kredytu hipotecznego, porównanie ofert kredytowych, wkład własny kalkulator, kalkulator prowizji bankowej, najlepszy kredyt hipoteczny, kredyt dla młodych kalkulator, ile kosztuje kredyt na mieszkanie, jaki kredyt hipoteczny wybrać, refinansowanie kredytu hipotecznego, przedterminowa spłata kredytu kalkulator, banki kredyt hipoteczny porównanie, wycena nieruchomości online, podatek od nieruchomości kalkulator, koszt notariusza przy kredycie, ubezpieczenie nieruchomości kalkulator, marża kredytu hipotecznego, WIBOR aktualne stawki",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kalkulatorynieruchomosci.pl',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="alternate" type="application/rss+xml" title="RSS" href="/rss.xml" />
        {/* Organization & WebSite schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Analityka Nieruchomości',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
              logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/favicon.png`,
              sameAs: [
                'https://www.facebook.com/YourProfile',
                'https://www.linkedin.com/company/yourprofile',
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Analityka Nieruchomości',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/search?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <GoogleAnalytics />
        <Navbar />
        <main className="flex-grow">{children}</main>
        <RagChatWidget />
        <Footer />
        <CookieConsent />
        <NewsletterPopup />
      </body>
    </html>
  );
}
