'use client';

import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
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