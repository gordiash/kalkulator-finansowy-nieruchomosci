import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';

interface Props {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: Props) {
  try {
    // Sprawdź sesję użytkownika po stronie serwera
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // Debug: loguj informacje o autoryzacji
    console.log('Admin layout - Auth check:', { 
      hasUser: !!user, 
      userId: user?.id, 
      authError: error?.message 
    });

    // Jeśli wystąpił błąd lub brak użytkownika => przekieruj do /login
    if (error || !user) {
      console.log('Brak autoryzacji, przekierowywanie do logowania');
      redirect('/login?redirect=/admin');
    }

    return <div className="admin-content">{children}</div>;
  } catch (error) {
    console.error('Błąd podczas sprawdzania autoryzacji:', error);
    redirect('/login?redirect=/admin');
  }
}

export const dynamic = 'force-dynamic'; 