import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME;

    if (!apiKey || !baseId || !tableName) {
      console.error('Missing Airtable environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const base = new Airtable({ apiKey }).base(baseId);

    await base(tableName).create([
      {
        fields: {
          Email: email, // Upewnij się, że nazwa pola w Airtable to 'Email'
        },
      },
    ]);

    return NextResponse.json({ message: 'Subscriber added successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error adding subscriber to Airtable:', error);
    return NextResponse.json({ error: 'Failed to add subscriber' }, { status: 500 });
  }
} 