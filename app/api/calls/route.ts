import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

async function getUserId(clerkId: string) {
  const user = await db.user.findUnique({
    where: { clerkId },
    select: { id: true }
  })
  return user?.id
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

    const calls = await db.callLog.findMany({
      where: { userId: dbUserId },
      include: {
        contact: {
          select: {
            name: true,
            phoneNumber: true,
            platform: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    const formattedCalls = calls.map((call) => ({
      ...call,
      contact_name: call.contact?.name || null,
      phone_number: call.contact?.phoneNumber || null,
      contact_platform: call.contact?.platform || null
    }))

    return NextResponse.json(formattedCalls)
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

    const callLog = await db.callLog.create({
      data: {
        userId: dbUserId,
        contactId: contact_id || null,
        platform,
        durationSeconds: duration_seconds || 0,
        notes: notes || null
      }
    })

    return NextResponse.json(callLog, { status: 201 })
  } catch (error) {
    console.error('Error creating call log:', error)
    return NextResponse.json(
      { error: 'Failed to create call log' },
      { status: 500 }
    )
  }
}