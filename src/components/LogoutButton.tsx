'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Wyloguj z Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Błąd podczas wylogowywania:', error);
      } else {
        // wylogowanie po stronie przeglądarki (czyści localStorage, memCache)
        localStorage.removeItem('auth_token');
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Przekieruj do strony głównej
        router.replace('/');
      }
    } catch (error) {
      console.error('Błąd podczas wylogowywania:', error);
      // W przypadku błędu, przekieruj do strony logowania
      router.replace('/login');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="text-red-600 hover:text-red-800 font-medium"
    >
      Wyloguj
    </button>
  );
} 