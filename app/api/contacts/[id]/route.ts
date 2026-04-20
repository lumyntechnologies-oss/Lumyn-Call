import { auth } from '@clerk/nextjs/server'
import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const db = neon(process.env.DATABASE_URL!)

async function getUserId(clerkId: string) {
  const result = await db`SELECT id FROM users WHERE clerk_id = ${clerkId}`
  return result[0]?.id
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const dbUserId = await getUserId(userId)

    if (!dbUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const contact = await db`
      SELECT * FROM contacts
      WHERE id = ${id} AND user_id = ${dbUserId}
    `

    if (contact.length === 0) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json(contact[0])
  } catch (error) {
    console.error('Error fetching contact:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, phone_number, email, platform, username, bio } = body

    const dbUserId = await getUserId(userId)

    if (!dbUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const result = await db`
      UPDATE contacts
      SET 
        name = COALESCE(${name || null}, name),
        phone_number = COALESCE(${phone_number || null}, phone_number),
        email = COALESCE(${email || null}, email),
        platform = COALESCE(${platform || null}, platform),
        username = COALESCE(${username || null}, username),
        bio = COALESCE(${bio || null}, bio),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND user_id = ${dbUserId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error updating contact:', error)
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const dbUserId = await getUserId(userId)

    if (!dbUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const result = await db`
      DELETE FROM contacts
      WHERE id = ${id} AND user_id = ${dbUserId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    )
  }
}
