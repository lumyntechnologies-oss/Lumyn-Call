import { auth } from '@clerk/nextjs/server'
import { getDb, getMockContacts, getMockUser, useMockData } from '@/lib/db'
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

    if (useMockData()) {
      const contacts = getMockContacts(userId)
      const contact = contacts.find(c => c.id === id)
      if (!contact) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
      }
      return NextResponse.json(contact)
    }

    const dbUserId = await getUserId(userId)

    if (!dbUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const db = getDb()
    const contact = await db.contact.findFirst({
      where: { id, userId: dbUserId }
    })

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json(contact)
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

    if (useMockData()) {
      return NextResponse.json({ id, name, phone_number, email, platform, username, bio })
    }

    const dbUserId = await getUserId(userId)

    if (!dbUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const db = getDb()
    const contact = await db.contact.updateMany({
      where: { id, userId: dbUserId },
      data: {
        ...(name && { name }),
        ...(phone_number !== undefined && { phoneNumber: phone_number }),
        ...(email !== undefined && { email }),
        ...(platform !== undefined && { platform }),
        ...(username !== undefined && { username }),
        ...(bio !== undefined && { bio }),
        updatedAt: new Date()
      }
    })

    if (contact.count === 0) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    const updated = await db.contact.findUnique({ where: { id } })
    return NextResponse.json(updated)
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

    if (useMockData()) {
      return NextResponse.json({ success: true })
    }

    const dbUserId = await getUserId(userId)

    if (!dbUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const db = getDb()
    const contact = await db.contact.deleteMany({
      where: { id, userId: dbUserId }
    })

    if (contact.count === 0) {
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