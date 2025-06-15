/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SupabaseClient } from '@supabase/supabase-js';

export const getSupabaseServerClient = async (): Promise<SupabaseClient> => {
  const cookieStore = await (cookies() as any);

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options?: any) {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Wywołanie z Server Component – brak możliwości zapisu
          }
        },
        remove(name: string, options?: any) {
          try {
            cookieStore.set(name, '', options);
          } catch {
            // Wywołanie z Server Component – brak możliwości zapisu
          }
        },
      },
    }
  );
}; 