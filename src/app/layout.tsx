import type { Metadata } from "next";
import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import 'highlight.js/styles/github.css';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import NewsletterPopup from "@/components/NewsletterPopup";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kalkulatory Nieruchomości",
  description: "Zbiór kalkulatorów do analizy rynku nieruchomości.",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
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
        <Footer />
        <CookieConsent />
        <NewsletterPopup />
      </body>
    </html>
  );
}
