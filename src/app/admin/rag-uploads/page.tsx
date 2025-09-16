'use client'

import { useRef, useState } from 'react'

export default function RagUploadsPage() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [status, setStatus] = useState<'idle'|'uploading'|'done'|'error'>('idle')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<any>(null)
  const [abortCtrl, setAbortCtrl] = useState<AbortController | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!files || files.length === 0) return
    setStatus('uploading')
    setMessage('')
    setResult(null)
    try {
      const form = new FormData()
      Array.from(files).forEach((f) => form.append('files', f))

      const ctrl = new AbortController()
      setAbortCtrl(ctrl)
      const timeout = setTimeout(() => ctrl.abort(), 30000) // 30s timeout

      const res = await fetch('/api/rag/ingest-files', {
        method: 'POST',
        body: form,
        credentials: 'include',
        signal: ctrl.signal as any
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Błąd uploadu')
      setResult(json)
      setStatus('done')
      // wyczyść wybór plików po sukcesie
      setFiles(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch (e) {
      setStatus('error')
      setMessage(e instanceof Error ? e.message : 'Nieznany błąd')
    }
    finally {
      if (abortCtrl) abortCtrl.abort()
      setAbortCtrl(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 pt-24">
      <h1 className="text-2xl font-semibold mb-4">RAG: Upload plików do indeksu</h1>
      <p className="text-sm text-gray-600 mb-4">Obsługiwane: Markdown/HTML/PDF. Pliki zostaną pocięte, zembedowane i zapisane w bazie.</p>
      <form onSubmit={onSubmit} className="space-y-4 border rounded-lg p-4 bg-white">
        <div>
          <label className="block text-sm font-medium mb-1">Pliki (wiele)</label>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".md,.mdx,.txt,.html,.pdf"
            onChange={(e) => { setFiles(e.target.files); setStatus('idle'); setMessage(''); }}
            className="block w-full border rounded p-2"
          />
          <p className="text-xs text-gray-500 mt-1">.md, .mdx, .txt, .html, .pdf</p>
        </div>
        <button
          type="submit"
          disabled={status==='uploading' || !files || files.length===0}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >{status==='uploading' ? 'Wysyłanie…' : 'Wyślij do indeksu'}</button>
        {status==='uploading' && (
          <button
            type="button"
            onClick={() => { abortCtrl?.abort(); setStatus('idle'); }}
            className="ml-3 px-4 py-2 bg-gray-200 rounded"
          >Anuluj</button>
        )}
      </form>
      {message && <div className="mt-4 text-red-700">{message}</div>}
      {result && (
        <div className="mt-6 border rounded p-4 bg-gray-50">
          <div className="font-medium">Wynik</div>
          <div className="text-sm text-gray-700 mt-2">Łącznie chunków: {result.totalChunks}</div>
          <ul className="list-disc pl-6 text-sm mt-2">
            {(result.files||[]).map((f: any, i: number) => (
              <li key={i}>{f.name} – {f.chunks} chunks</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}


