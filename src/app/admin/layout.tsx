import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';

interface Props {
  children: ReactNode;
}

export default async function AdminLayout({ children }: Props) {
  // Sprawdź sesję użytkownika po stronie serwera
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Jeśli brak użytkownika => przekieruj do /login z parametrem redirect
  if (!user) {
    redirect('/login?redirect=/admin');
  }

  return <>{children}</>;
}

export const dynamic = 'force-dynamic'; 