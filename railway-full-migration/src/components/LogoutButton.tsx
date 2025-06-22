'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    // wylogowanie po stronie przeglądarki (czyści localStorage, memCache)
    await supabase.auth.signOut();
    // zakończ sesję http-only na serwerze
    await fetch('/api/logout', { method: 'POST' });
    router.replace('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="ml-auto bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
    >
      Wyloguj
    </button>
  );
} 