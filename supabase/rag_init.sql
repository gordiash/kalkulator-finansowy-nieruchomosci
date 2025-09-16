-- Enable pgvector extension
create extension if not exists vector;

-- RAG chunks table
create table if not exists rag_chunks (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_id text not null,
  title text,
  url text,
  content text not null,
  embedding vector(1536),
  created_at timestamptz default now()
);

-- HNSW index for fast similarity search
create index if not exists rag_chunks_embedding_idx
  on rag_chunks using hnsw (embedding vector_l2_ops);

-- RPC for vector similarity (L2)
create or replace function match_rag_chunks(query_embedding vector(1536), match_count int default 8)
returns table(id uuid, content text, title text, url text, similarity float)
language sql stable as $$
  select id, content, title, url,
         1 - (embedding <=> query_embedding) as similarity
  from rag_chunks
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- Logs table (optional)
create table if not exists rag_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  ip_hash text,
  query text,
  sources jsonb,
  latency_ms int,
  retrieval_ms int,
  llm_ms int,
  status text,
  error text
);

-- RLS for rag_chunks: allow public SELECT, write via service role only (no policies for write)
alter table rag_chunks enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where polname = 'rag_chunks_select_all'
  ) then
    create policy rag_chunks_select_all on rag_chunks for select using (true);
  end if;
end $$;


