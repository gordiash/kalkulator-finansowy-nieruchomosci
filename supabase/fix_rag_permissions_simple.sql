-- Proste rozwiązanie: usuń politykę admin i użyj tylko service role
-- Uruchom to w Supabase SQL Editor

-- 1. Usuń politykę admin
drop policy if exists rag_chunks_admin_write on rag_chunks;

-- 2. Upewnij się, że jest tylko polityka SELECT dla public
drop policy if exists rag_chunks_select_all on rag_chunks;
drop policy if exists rag_chunks_select_public on rag_chunks;

create policy rag_chunks_select_public on rag_chunks 
for select 
using (true); -- Wszystkie chunk są publiczne do odczytu

-- 3. Brak polityk dla INSERT/UPDATE/DELETE = tylko service role może pisać
-- To jest OK - service role ma pełne uprawnienia

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
