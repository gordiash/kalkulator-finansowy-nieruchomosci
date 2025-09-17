import { createClient } from '@supabase/supabase-js';

export const getSupabaseServiceRoleClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceKey) {
    console.error('Brak konfiguracji Supabase service role (SUPABASE_SERVICE_ROLE_KEY)');
    // Fallback na zwykły klient - będzie działać tylko dla publicznych operacji
    return createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { 
      auth: { persistSession: false } 
    });
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
};


