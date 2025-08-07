'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const redirect = typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('redirect') ?? '/admin') : '/admin';

  useEffect(() => {
    // Sprawdź czy użytkownik jest już zalogowany
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && !error) {
          router.replace(redirect);
        }
      } catch (error) {
        console.error('Błąd podczas sprawdzania sesji:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Nasłuchuj zmian w autoryzacji
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace(redirect);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, redirect]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 pt-20 sm:pt-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Sprawdzanie sesji...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 pt-20 sm:pt-24">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Panel administracyjny</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="default"
          localization={{
            variables: {
              sign_in: { email_label: 'Adres e-mail', password_label: 'Hasło', button_label: 'Zaloguj' },
              sign_up: { email_label: 'Adres e-mail', password_label: 'Hasło', button_label: 'Zarejestruj' },
            },
          }}
          providers={[]}
          magicLink={false}
          redirectTo={typeof window !== 'undefined' ? `${window.location.origin}${redirect}` : redirect}
        />
      </div>
    </div>
  );
} 