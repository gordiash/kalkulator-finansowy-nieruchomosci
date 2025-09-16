## Asystent RAG – Plan wdrożenia (Checklist z zależnościami i kolejnością)

Legenda:
- [ ] do zrobienia  | [x] ukończone  | [~] w toku
- ID zadania w nawiasach kwadratowych, np. [T-DB-1]
- Zależności: „Depends on: …” (wymagane przed rozpoczęciem)

### 0) Przygotowanie środowiska
- [x] [T-ENV-1] Zweryfikować zmienne środowiskowe (.env)
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - (opcjonalnie) `SUPABASE_SERVICE_ROLE_KEY` – tylko dla jobów ingest/administracji
- [x] [T-ENV-2] Uzgodnić model embeddingów i LLM (np. OpenAI)
  - `OPENAI_API_KEY` (serwer-only)

### 1) Baza danych i wektory (Supabase)
- [x] [T-DB-1] Włączyć rozszerzenie `pgvector` (Supabase → SQL)
- [x] [T-DB-2] Utworzyć tabelę chunków RAG `rag_chunks`
  - Kolumny: `id uuid`, `source_type text`, `source_id text`, `title text`, `url text`, `content text`, `embedding vector(1536)`, `created_at timestamptz`
- [x] [T-DB-3] Utworzyć indeks HNSW: `rag_chunks_embedding_idx` na `embedding`
- [ ] [T-DB-4] (opcjonalnie) Tabela rozmów `rag_conversations (id, user_id, messages jsonb, created_at)`
- [x] [T-DB-5] (opcjonalnie) Funkcja RPC `match_rag_chunks(query_embedding vector, match_count int)`
  - Depends on: [T-DB-1], [T-DB-2], [T-DB-3]

### 2) Pipeline ingest (indeksowanie źródeł)
- [x] [T-ING-1] Implementować chunkowanie Markdown/HTML (500–1000 tokenów, overlap 50–100)
- [x] [T-ING-2] Wrapper do embeddingów (serwer-only)
- [x] [T-ING-3] Ingest postów z `posts` (status='published') → `rag_chunks`
  - zapis: `source_type='post'`, `source_id=post.id`, `url=/blog/${slug}`
- [x] [T-ING-4] Ingest FAQ/docs (np. `docs/`, komponenty FAQ) → `rag_chunks`
- [x] [T-ING-5] Skrypty: `npm run rag:ingest:posts`, `npm run rag:ingest:docs`
- [x] [T-ING-6] (opcjonalnie) Vercel Cron – reindeks co X godzin
  - Depends on: [T-DB-*], [T-ENV-2]

### 3) Retrieval i logika RAG (serwer)
- [x] [T-RAG-1] Funkcja retrieval (RPC lub zapytanie z operatorem wektorowym)
- [x] [T-RAG-2] (opcjonalnie) Reranking wyników (cross-encoder) – etap 2
- [x] [T-RAG-3] Sanitizacja i ograniczanie kontekstu (limit tokenów)
  - Depends on: [T-ING-*]

### 4) Endpoint czatu (API)
- [x] [T-API-1] `POST /api/assistant/chat` (SSE/stream)
  - Krok: embed zapytania → retrieve (top-k) → prompt → stream z LLM
- [x] [T-API-2] Rate limiting + timeouts + retry
- [x] [T-API-3] Logowanie (opcjonalnie tabela `rag_logs` z anonimizacją)
  - Depends on: [T-RAG-*], [T-ENV-2]

### 5) UI czatu (widget)
- [x] [T-UI-1] Pływający widget czatu (Client Component)
- [x] [T-UI-2] Streaming odpowiedzi + lista źródeł (tytuł + link)
- [x] [T-UI-3] Zgodność z cookies (ukryty/nieaktywny bez zgody analityki, ale działający bez GA)
  - Depends on: [T-API-1]

### 6) Integracja tool calling (kalkulatory) – etap 2
- [x] [T-TOOL-1] Zdefiniować funkcje narzędzi (kalkulatory) z walidacją Zod
- [x] [T-TOOL-2] Warstwa LLM z JSON function calling
- [x] [T-TOOL-3] Integracja w `/api/assistant/chat` – routing intencji → wywołanie toola → odpowiedź
  - Depends on: [T-API-1]

### 7) Bezpieczeństwo i RLS
- [x] [T-SEC-1] RLS/ACL: `rag_chunks` – publiczny odczyt (tylko SELECT), zapis przez service-role
- [x] [T-SEC-2] Brak sekretów w kliencie (embedding/LLM wyłącznie serwer)
- [x] [T-SEC-3] (opcjonalnie) Moderacja promptów i odpowiedzi
  - Depends on: [T-DB-*]

### 8) Monitoring i jakość
- [x] [T-MON-1] Telemetria: latency retrieval/LLM, hit-rate, error-rate
- [x] [T-MON-2] Testy Q/A (zestaw referencyjnych pytań → oczekiwane fragmenty źródeł)
- [ ] [T-MON-3] GA DebugView dla interakcji czatu (po zgodzie cookies)
  - Depends on: [T-API-1], [T-UI-*]

---

### Kolejność wykonania (ścieżka krytyczna do MVP)
1. [T-ENV-1], [T-ENV-2]
2. [T-DB-1] → [T-DB-2] → [T-DB-3] → (opcjonalnie [T-DB-5])
3. [T-ING-1] → [T-ING-2] → [T-ING-3] (→ [T-ING-4]) → [T-ING-5]
4. [T-RAG-1] → [T-RAG-3]
5. [T-API-1] → [T-API-2]
6. [T-UI-1] → [T-UI-2] → [T-UI-3]
7. [T-MON-1] → [T-MON-2] → [T-MON-3]

Etap 2 (po MVP): [T-TOOL-*], [T-ING-6], [T-SEC-*], [T-RAG-2]

---

### Powiązania kluczowe (skrót)
- Retrieval wymaga poprawnie zindeksowanych `rag_chunks` → [T-RAG-1] depends on [T-ING-*]
- Chat API wymaga retrieval i embedding/LLM → [T-API-1] depends on [T-RAG-*], [T-ENV-2]
- Widget UI wymaga działającego API → [T-UI-*] depends on [T-API-1]
- Tool calling wymaga API czatu → [T-TOOL-*] depends on [T-API-1]

---

### Uwagi wdrożeniowe
- Wydajność: top-k = 6–8, limit tokenów kontekstu, cache odpowiedzi często zadawanych pytań.
- Jakość: rozważ reranking w Etapie 2 (cross-encoder) i wzbogacenie danych o FAQ/docs.
- Bezpieczeństwo: service role tylko w ingest/jobach; żadnych sekretów w kliencie.


