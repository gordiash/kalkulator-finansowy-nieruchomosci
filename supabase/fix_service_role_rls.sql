-- Napraw RLS dla service role
-- Uruchom to w Supabase SQL Editor

-- 1. Sprawdź obecne polityki
select 
  schemaname,
  tablename, 
  policyname, 
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies 
where tablename = 'rag_chunks';

-- 2. Usuń wszystkie polityki dla rag_chunks
drop policy if exists rag_chunks_admin_write on rag_chunks;
drop policy if exists rag_chunks_select_all on rag_chunks;
drop policy if exists rag_chunks_select_public on rag_chunks;

-- 3. Wyłącz RLS dla rag_chunks (service role będzie mógł pisać)
alter table rag_chunks disable row level security;

-- 4. Sprawdź czy RLS jest wyłączone
select schemaname, tablename, rowsecurity 
from pg_tables 
where tablename = 'rag_chunks';

-- 5. Opcjonalnie: włącz RLS z powrotem tylko z polityką SELECT
-- alter table rag_chunks enable row level security;
-- create policy rag_chunks_select_public on rag_chunks 
-- for select 
-- using (true);
