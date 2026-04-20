import { auth } from '@clerk/nextjs/server'
import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const db = neon(process.env.DATABASE_URL!)

async function ensureTablesExist() {
  try {
    await db`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        clerk_id TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        phone_number TEXT,
        email TEXT,
        platform TEXT DEFAULT 'whatsapp',
        username TEXT,
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS call_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
        platform TEXT NOT NULL,
        duration_seconds INT DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
      CREATE INDEX IF NOT EXISTS idx_call_logs_user_id ON call_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_call_logs_contact_id ON call_logs(contact_id);
    `
  } catch (error) {
    console.error('Error ensuring tables exist:', error)
  }
}

async function getOrCreateUser(clerkId: string, email: string) {
  try {
    const result = await db`
      INSERT INTO users (clerk_id, email)
      VALUES (${clerkId}, ${email})
      ON CONFLICT (clerk_id) DO UPDATE SET email = EXCLUDED.email
      RETURNING id
    `
    return result[0].id
  } catch (error) {
    console.error('Error getting/creating user:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await ensureTablesExist()

    const user = await auth()
    const userEmail = user.sessionClaims?.email as string

    const dbUserId = await getOrCreateUser(userId, userEmail)

    const contacts = await db`
      SELECT * FROM contacts
      WHERE user_id = ${dbUserId}
      ORDER BY updated_at DESC
    `

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone_number, email, platform, username, bio } = body

    await ensureTablesExist()

    const user = await auth()
    const userEmail = user.sessionClaims?.email as string

    const dbUserId = await getOrCreateUser(userId, userEmail)

    const result = await db`
      INSERT INTO contacts (user_id, name, phone_number, email, platform, username, bio)
      VALUES (${dbUserId}, ${name}, ${phone_number || null}, ${email || null}, ${platform || 'whatsapp'}, ${username || null}, ${bio || null})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    )
  }
}
