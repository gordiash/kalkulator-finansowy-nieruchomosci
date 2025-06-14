'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const redirect = typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('redirect') ?? '/admin') : '/admin';

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
          redirectTo={typeof window !== 'undefined' ? `${window.location.origin}${redirect}` : undefined}
          magicLink={false}
        />
      </div>
    </div>
  );
} 