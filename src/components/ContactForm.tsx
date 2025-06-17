'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Błąd')
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } catch (e: any) {
      setError(e.message)
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block mb-1 font-medium">Imię i nazwisko</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Wiadomość</label>
        <textarea
          name="message"
          rows={5}
          value={form.message}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          required
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {status === 'success' && <p className="text-green-600 text-sm">Wiadomość została wysłana. Dziękujemy!</p>}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
      >
        {status === 'loading' ? 'Wysyłanie…' : 'Wyślij wiadomość'}
      </button>
    </form>
  )
} 