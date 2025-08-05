'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RejestracjaPage() {
  const router = useRouter();

  useEffect(() => {
    // Przekieruj do strony logowania z parametrem rejestracji
    router.push('/logowanie?mode=register');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 pt-20 sm:pt-24">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Przekierowywanie do formularza rejestracji...</p>
      </div>
    </div>
  );
} 