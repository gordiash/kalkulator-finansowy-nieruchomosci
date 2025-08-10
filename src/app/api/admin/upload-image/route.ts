import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Konfiguracja – wymagane na serwerze (NIE ujawniaj service role do klienta)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE as string
const BUCKET = 'posts-images'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
      return NextResponse.json(
        { error: 'Brak konfiguracji Supabase (SUPABASE_SERVICE_ROLE lub URL)' },
        { status: 500 }
      )
    }

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Brak pliku w żądaniu (formData: file)' }, { status: 400 })
    }

    // Walidacja typu i rozmiaru
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Niedozwolony typ pliku' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Plik jest za duży (max 5MB)' }, { status: 400 })
    }

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const filePath = `public/${filename}`

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

    const arrayBuf = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuf)

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, buffer, { contentType: file.type, upsert: true, cacheControl: '3600' })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Public URL (jeśli bucket publiczny) lub URL podpisany
    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
    let url = publicData?.publicUrl || ''

    if (!url) {
      const signed = await supabase.storage.from(BUCKET).createSignedUrl(filePath, 60 * 60 * 24 * 365)
      url = signed.data?.signedUrl || ''
    }

    if (!url) {
      return NextResponse.json({ error: 'Nie udało się uzyskać URL pliku' }, { status: 500 })
    }

    return NextResponse.json({ url, path: filePath })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


