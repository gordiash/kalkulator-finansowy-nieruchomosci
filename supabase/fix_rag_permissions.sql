-- Napraw uprawnienia dla RAG
-- Uruchom to w Supabase SQL Editor

-- 1. Sprawdź obecne polityki RLS
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
where tablename in ('rag_chunks', 'rag_logs');

-- 2. Upewnij się, że funkcja match_rag_chunks ma odpowiednie uprawnienia
-- Funkcja powinna działać jako SECURITY DEFINER (z uprawnieniami właściciela)
create or replace function match_rag_chunks(query_embedding vector(1536), match_count int default 8)
returns table(id uuid, content text, title text, url text, similarity float)
language sql stable 
security definer  -- Kluczowe: funkcja działa z uprawnieniami właściciela
as $$
  select id, content, title, url,
         1 - (embedding <=> query_embedding) as similarity
  from rag_chunks
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- 3. Sprawdź czy tabela rag_chunks ma włączone RLS
alter table rag_chunks enable row level security;

-- 4. Upewnij się, że polityka SELECT pozwala na publiczne odczyty
drop policy if exists rag_chunks_select_all on rag_chunks;
drop policy if exists rag_chunks_select_public on rag_chunks;

create policy rag_chunks_select_public on rag_chunks 
for select 
using (true); -- Wszystkie chunk są publiczne do odczytu

-- 5. Sprawdź czy rag_logs ma odpowiednie uprawnienia
alter table rag_logs enable row level security;

-- Brak polityk dla INSERT = tylko service role może pisać (to jest OK)

-- 6. Test funkcji
select * from match_rag_chunks(
  (select embedding from rag_chunks limit 1),
  3
) limit 1;
