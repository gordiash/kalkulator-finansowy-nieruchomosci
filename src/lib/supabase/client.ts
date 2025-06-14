import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

// Pozwalamy na import zarówno po stronie klienta, jak i serwera

export const supabase = createBrowserSupabaseClient(); 