import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseServiceRoleClient } from '@/lib/supabase/admin'
import { chunkText } from '@/lib/rag/chunk'
import { embed } from '@/lib/rag/embed'

// Lazy import PDF parser (ESM/CJS interop)
async function parsePdf(buffer: Buffer): Promise<string> {
  console.log(`[PDF] Parsing PDF, buffer size: ${buffer.length} bytes`)
  try {
    // @ts-ignore
    const mod = await import('pdf-parse')
    const pdfParse = (mod as any)?.default || (mod as any)
    const data = await pdfParse(buffer)
    const text = (data?.text || '').toString()
    console.log(`[PDF] pdf-parse success, text length: ${text.length}`)
    return text
  } catch (e) {
    console.error('[PDF] pdf-parse error:', e)
    // Fallback: spróbuj pdfjs-dist wyciągnąć tekst
    try {
      console.log('[PDF] Trying pdfjs-dist fallback...')
      const pdfjs = await import('pdfjs-dist') as any
      const { getDocument } = pdfjs
      const loadingTask = getDocument({ data: buffer })
      const doc = await loadingTask.promise
      console.log(`[PDF] pdfjs-dist loaded, pages: ${doc.numPages}`)
      let full = ''
      for (let p = 1; p <= doc.numPages; p++) {
        const page = await doc.getPage(p)
        const content = await page.getTextContent()
        const text = (content.items || []).map((i: any) => i.str).join(' ')
        full += '\n' + text
      }
      const result = full.trim()
      console.log(`[PDF] pdfjs-dist success, text length: ${result.length}`)
      return result
    } catch (e2) {
      console.error('[PDF] pdfjs-dist fallback failed:', e2)
      return ''
    }
  }
}

function extractTextFromHtml(html: string): string {
  // proste usunięcie tagów HTML (wystarczające do chunkowania)
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function POST(request: NextRequest) {
  try {
    // Auth: service role secret albo admin session upstream (middleware)
    const url = new URL(request.url)
    const qsSecret = url.searchParams.get('secret')
    const headerSecret = request.headers.get('x-rag-secret')
    let authorized = (qsSecret && qsSecret === process.env.RAG_INGEST_SECRET) || (headerSecret && headerSecret === process.env.RAG_INGEST_SECRET)

    // Alternatywnie: zezwól zalogowanemu użytkownikowi (admin panel) poprzez sesję Supabase
    if (!authorized) {
      const response = NextResponse.next()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              response.cookies.set(name, value, options)
            },
            remove(name: string, options: any) {
              response.cookies.set(name, '', options)
            },
          },
        }
      )
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) authorized = true
      } catch {}
      if (!authorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Wymagane multipart/form-data' }, { status: 400 })
    }

    // Ogranicz rozmiar do ~20MB (szacowane, multipart bez content-length)
    const form = await request.formData()
    const files = form.getAll('files') as File[]
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Brak plików (pole files)' }, { status: 400 })
    }

    const sbAdmin = getSupabaseServiceRoleClient()
    let totalChunks = 0
    const accepted: Array<{ name: string; chunks: number }> = []

    for (const file of files) {
      if (!(file instanceof File)) continue
      const name = file.name || 'upload'
      const mime = file.type || ''
      console.log(`[INGEST] Processing file: ${name}, mime: ${mime}, size: ${file.size}`)
      
      const arrayBuf = await file.arrayBuffer()
      const buffer = Buffer.from(new Uint8Array(arrayBuf))
      if (buffer.byteLength === 0) {
        console.log(`[INGEST] Empty file: ${name}`)
        accepted.push({ name, chunks: 0 })
        continue
      }

      let rawText = ''
      if (/markdown|md|text\/(plain|markdown)/i.test(mime) || /\.(md|mdx|txt)$/i.test(name)) {
        rawText = buffer.toString('utf8')
        console.log(`[INGEST] Text file ${name}, content length: ${rawText.length}`)
      } else if (/html/i.test(mime) || /\.(html|htm)$/i.test(name)) {
        rawText = extractTextFromHtml(buffer.toString('utf8'))
        console.log(`[INGEST] HTML file ${name}, content length: ${rawText.length}`)
      } else if (/pdf/i.test(mime) || /\.(pdf)$/i.test(name)) {
        rawText = await parsePdf(buffer)
        console.log(`[INGEST] PDF file ${name}, extracted text length: ${rawText.length}`)
      } else {
        console.log(`[INGEST] Unsupported file type: ${name}`)
        continue
      }

      if (!rawText || rawText.length < 5) {
        console.log(`[INGEST] No content extracted from ${name}, skipping`)
        accepted.push({ name, chunks: 0 })
        continue
      }

      const chunks = chunkText(rawText, { maxChars: 2000, overlapChars: 200 })
      console.log(`[INGEST] Created ${chunks.length} chunks for ${name}`)
      let fileChunks = 0
      for (let i = 0; i < chunks.length; i++) {
        const text = chunks[i]
        try {
          console.log(`[INGEST] Embedding chunk ${i+1}/${chunks.length} for ${name} (${text.length} chars)`)
          const vector = await embed(text)
          console.log(`[INGEST] Got embedding for chunk ${i+1}, upserting...`)
          const { error } = await sbAdmin
            .from('rag_chunks')
            .upsert({
              source_type: 'upload',
              source_id: name,
              title: name,
              url: `/uploads/${encodeURIComponent(name)}`,
              content: text,
              embedding: vector as unknown as any,
            })
          if (error) {
            console.error('Supabase upsert error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
          }
          totalChunks += 1
          fileChunks += 1
          console.log(`[INGEST] Successfully upserted chunk ${i+1}/${chunks.length}`)
        } catch (embErr) {
          console.error(`[INGEST] Error embedding/upserting chunk ${i+1} for ${name}:`, embErr)
          return NextResponse.json({ error: 'Embedding/upsert failed' }, { status: 500 })
        }
      }
      accepted.push({ name, chunks: fileChunks })
    }

    return NextResponse.json({ success: true, totalChunks, files: accepted })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}


