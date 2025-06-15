/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { createBrowserClient } from '@supabase/ssr';

// Pozwalamy na import zarówno po stronie klienta, jak i serwera

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export const supabase = createClient(); 