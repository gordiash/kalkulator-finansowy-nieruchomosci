import { NextRequest, NextResponse } from 'next/server'

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const AIRTABLE_CONTACT_TABLE_NAME = process.env.AIRTABLE_CONTACT_TABLE_NAME || 'Contact'

export async function POST(request: NextRequest) {
  try {
    if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN || !AIRTABLE_CONTACT_TABLE_NAME) {
      console.error('Missing Airtable configuration for contact form')
      return NextResponse.json({ error: 'Błąd konfiguracji serwera' }, { status: 500 })
    }

    const body = await request.json()
    const { name = '', email = '', message = '' } = body

    if (!name.trim() || !email.includes('@') || message.trim().length < 10) {
      return NextResponse.json({ error: 'Nieprawidłowe dane formularza' }, { status: 400 })
    }

    // Zapis do Airtable
    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_CONTACT_TABLE_NAME)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                Name: name,
                Email: email,
                Message: message,
                Created: new Date().toISOString()
              }
            }
          ]
        })
      }
    )

    if (!airtableRes.ok) {
      const err = await airtableRes.json()
      console.error('Airtable contact error', err)
      return NextResponse.json({ error: 'Błąd zapisu. Spróbuj ponownie.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Contact form error', e)
    return NextResponse.json({ error: 'Wystąpił błąd serwera' }, { status: 500 })
  }
} 