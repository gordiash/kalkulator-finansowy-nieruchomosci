'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const redirect = typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('redirect') ?? '/admin') : '/admin';

  // Po pomyślnym logowaniu przekieruj na żądaną ścieżkę (domyślnie /admin)
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.replace(redirect);
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, redirect]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
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
        />
      </div>
    </div>
  );
} 