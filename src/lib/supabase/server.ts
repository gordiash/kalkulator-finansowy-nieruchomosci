import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { SupabaseClient } from '@supabase/supabase-js';

export const getSupabaseServerClient = (): SupabaseClient => {
  // Biblioteka sama pobierze URL i klucz z env
  return createServerComponentClient({ cookies });
}; 