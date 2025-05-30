import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import './globals.css'; // Import globalnych stylów
import 'react-toastify/dist/ReactToastify.css'; // Import stylów dla react-toastify
import { ToastContainer } from 'react-toastify';

import MainNavigation from '@/components/MainNavigation'; // Dodano import nawigacji
import Footer from '@/components/Footer'; // Dodano import stopki

// Import komponentów, które były w App.tsx
// Założenie: te komponenty zostaną dostosowane lub utworzone później
// import GoogleAnalytics from '@/components/GoogleAnalytics';
// import NoCSPAdsLoader from '@/components/NoCSPAdsLoader';
// import MainLayout from '@/components/Layout'; // Zmieniona nazwa na MainLayout dla jasności

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kalkulator Finansowy Nieruchomości', // Przykładowy tytuł, można dostosować
  description: 'Oblicz rentowność inwestycji w nieruchomości, ROI, wartość najmu i więcej.', // Przykładowy opis
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className={`${inter.className} flex flex-col min-h-screen`}> {/* Dodano flex flex-col min-h-screen do body */}
        {/* <GoogleAnalytics /> */}
        {/* <NoCSPAdsLoader /> */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <MainNavigation /> {/* Dodano komponent nawigacji */}
        <main className="flex-grow container mx-auto py-8 px-4"> {/* Dodano flex-grow i padding do main */} 
          {children}
        </main>
        <Footer /> {/* Dodano komponent stopki */}
        {/* <CookieConsent /> */}
      </body>
    </html>
  );
} 