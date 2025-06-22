'use client';

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-700 mb-4">Błąd</h1>
        <h2 className="text-xl text-gray-600 mb-4">Coś poszło nie tak</h2>
        <p className="text-gray-500 mb-8">
          {error.message || 'Wystąpił nieoczekiwany błąd'}
        </p>
        <button
          onClick={reset}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-4"
        >
          Spróbuj ponownie
        </button>
        <Link 
          href="/" 
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Wróć do strony głównej
        </Link>
      </div>
    </div>
  );
} 