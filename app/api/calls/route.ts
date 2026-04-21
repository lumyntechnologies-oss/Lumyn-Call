import { auth } from '@clerk/nextjs/server'
import { getDb, getMockCallLogs, getMockUser, useMockData } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

async function getUserId(clerkId: string) {
  if (useMockData()) {
    const user = getMockUser(clerkId)
    return user.id
  }

  const db = getDb()
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

    if (useMockData()) {
      const calls = getMockCallLogs(userId)
      return NextResponse.json(calls)
    }

    const dbUserId = await getUserId(userId)

    if (!dbUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const db = getDb()
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

    const formattedCalls = calls.map((call: any) => ({
      ...call,
      contact_name: call.contact?.name || null,
      phone_number: call.contact?.phoneNumber || null,
      contact_platform: call.contact?.platform || null
    }))

    return NextResponse.json(formattedCalls)
  } catch (error) {
    console.error('Error fetching calls:', error)
    if (useMockData()) {
      const calls = getMockCallLogs('mock')
      return NextResponse.json(calls)
    }
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

    if (useMockData()) {
      const newCall = {
        id: String(Date.now()),
        userId,
        contactId: contact_id || null,
        platform,
        durationSeconds: duration_seconds || 0,
        notes: notes || null,
        createdAt: new Date()
      }
      return NextResponse.json(newCall, { status: 201 })
    }

    const dbUserId = await getUserId(userId)

    if (!dbUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const db = getDb()
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
    if (useMockData()) {
      const newCall = {
        id: String(Date.now()),
        createdAt: new Date()
      }
      return NextResponse.json(newCall, { status: 201 })
    }
    return NextResponse.json(
      { error: 'Failed to create call log' },
      { status: 500 }
    )
  }
}