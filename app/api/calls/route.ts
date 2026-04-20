import { auth } from '@clerk/nextjs/server'
import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const db = neon(process.env.DATABASE_URL!)

async function getUserId(clerkId: string) {
  const result = await db`SELECT id FROM users WHERE clerk_id = ${clerkId}`
  return result[0]?.id
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUserId = await getUserId(userId)

    if (!dbUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const calls = await db`
      SELECT 
        cl.*,
        c.name as contact_name,
        c.phone_number,
        c.platform as contact_platform
      FROM call_logs cl
      LEFT JOIN contacts c ON cl.contact_id = c.id
      WHERE cl.user_id = ${dbUserId}
      ORDER BY cl.created_at DESC
      LIMIT 100
    `

    return NextResponse.json(calls)
  } catch (error) {
    console.error('Error fetching calls:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calls' },
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
    const { contact_id, platform, duration_seconds, notes } = body

    const dbUserId = await getUserId(userId)

    if (!dbUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const result = await db`
      INSERT INTO call_logs (user_id, contact_id, platform, duration_seconds, notes)
      VALUES (${dbUserId}, ${contact_id || null}, ${platform}, ${duration_seconds || 0}, ${notes || null})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Error creating call log:', error)
    return NextResponse.json(
      { error: 'Failed to create call log' },
      { status: 500 }
    )
  }
}
