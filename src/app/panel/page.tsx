'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PanelPage() {
  const router = useRouter();

  useEffect(() => {
    // Domyślne przekierowanie: zapisane kalkulacje
    router.replace('/panel/kalkulacje');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Przekierowywanie...</p>
      </div>
    </div>
  );
} 