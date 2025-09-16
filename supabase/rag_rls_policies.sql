-- RLS Policies dla tabeli rag_chunks
-- Uruchom to po inicjalizacji tabeli

-- 1. SELECT - publiczne odczyty (dla RAG assistant)
alter table rag_chunks enable row level security;

-- Usuń starą politykę jeśli istnieje
drop policy if exists rag_chunks_select_all on rag_chunks;

-- Nowa polityka SELECT - tylko opublikowane chunk
create policy rag_chunks_select_public on rag_chunks 
for select 
using (true); -- Wszystkie chunk są publiczne do odczytu

-- 2. INSERT/UPDATE/DELETE - tylko dla service role i adminów
-- Brak polityk = tylko service role może pisać

-- 3. Opcjonalnie: polityka dla adminów (jeśli masz tabelę users z rolą admin)
-- create policy rag_chunks_admin_write on rag_chunks 
-- for all 
-- using (
--   exists (
--     select 1 from auth.users u 
--     where u.id = auth.uid() 
--     and u.raw_user_meta_data->>'role' = 'admin'
--   )
-- );

-- 4. Sprawdź obecne polityki
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
