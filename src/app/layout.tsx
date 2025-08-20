import type { Metadata } from "next";
import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import NewsletterPopup from "@/components/NewsletterPopup";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Kalkulatory Nieruchomości - Wycena AI, Zdolność Kredytowa, Wynajem",
  description: "Profesjonalne kalkulatory nieruchomości: wycena mieszkań z AI (MAPE 0.79%), zdolność kredytowa, rentowność wynajmu i koszty zakupu. Blog ekspercki.",
  keywords: [
    'kalkulator wyceny mieszkania',
    'wycena nieruchomości online',
    'sztuczna inteligencja nieruchomości',
    'EstymatorAI wycena',
    'kalkulator zakupu nieruchomości',
    'kalkulator wynajmu',
    'zdolność kredytowa',
    'analityka nieruchomości',
    'wycena AI',
    'Olsztyn mieszkania'
  ],
  authors: [{ name: "KalkulatoryNieruchomosci.pl" }],
  creator: "KalkulatoryNieruchomosci.pl",
  publisher: "KalkulatoryNieruchomosci.pl",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: '/',
    title: 'Kalkulatory Nieruchomości - Wycena AI, Zdolność Kredytowa, Wynajem',
    description: 'Profesjonalne kalkulatory nieruchomości: wycena mieszkań z AI (MAPE 0.79%), zdolność kredytowa, rentowność wynajmu i koszty zakupu.',
    siteName: 'KalkulatoryNieruchomosci.pl',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Kalkulatory Nieruchomości - Profesjonalne narzędzia analityczne',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kalkulatory Nieruchomości - Wycena AI, Zdolność Kredytowa, Wynajem',
    description: 'Profesjonalne kalkulatory nieruchomości: wycena mieszkań z AI (MAPE 0.79%), zdolność kredytowa, rentowność wynajmu i koszty zakupu.',
    images: ['/og-image.jpg'],
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
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
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
    <html lang="pl" className="dark">
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
              name: 'KalkulatoryNieruchomosci.pl',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
              logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/favicon.png`,
              description: 'Profesjonalne kalkulatory nieruchomościowe z AI: wycena mieszkań, zakup, wynajem, zdolność kredytowa',
              sameAs: [
                'https://www.facebook.com/YourProfile',
                'https://www.linkedin.com/company/yourprofile',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                availableLanguage: 'Polish'
              },
              areaServed: 'PL',
              serviceType: 'Financial Calculator',
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'KalkulatoryNieruchomosci.pl',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
              description: 'Profesjonalne kalkulatory nieruchomościowe z AI: wycena mieszkań, zakup, wynajem, zdolność kredytowa',
              inLanguage: 'pl-PL',
              potentialAction: {
                '@type': 'SearchAction',
                target: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/search?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen bg-slate-900 text-white`}>
        <GoogleAnalytics />
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
        <CookieConsent />
        <NewsletterPopup />
      </body>
    </html>
  );
}
