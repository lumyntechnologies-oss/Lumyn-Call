import { auth } from '@clerk/nextjs/server'
import { getDb, getMockContacts, getMockUser, useMockData } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

async function getOrCreateUser(clerkId: string, email: string | null) {
  if (useMockData()) {
    const user = getMockUser(clerkId)
    return user.id
  }

  const db = getDb()
  const user = await db.user.upsert({
    where: { clerkId },
    update: { email: email || 'unknown' },
    create: { clerkId, email: email || 'unknown' }
  })
  return user.id
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (useMockData()) {
      const contacts = getMockContacts(userId)
      return NextResponse.json(contacts)
    }

    const user = await auth()
    const userEmail = user.sessionClaims?.email as string | undefined

    const dbUserId = await getOrCreateUser(userId, userEmail || null)

    const db = getDb()
    const contacts = await db.contact.findMany({
      where: { userId: dbUserId },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Error fetching contacts:', error)
    if (useMockData()) {
      const contacts = getMockContacts('mock')
      return NextResponse.json(contacts)
    }
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

    if (useMockData()) {
      const newContact = {
        id: String(Date.now()),
        userId,
        name,
        phoneNumber: phone_number || null,
        email: email || null,
        platform: platform || 'whatsapp',
        username: username || null,
        bio: bio || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      return NextResponse.json(newContact, { status: 201 })
    }

    const user = await auth()
    const userEmail = user.sessionClaims?.email as string | undefined

    const dbUserId = await getOrCreateUser(userId, userEmail || null)

    const db = getDb()
    const contact = await db.contact.create({
      data: {
        userId: dbUserId,
        name,
        phoneNumber: phone_number || null,
        email: email || null,
        platform: platform || 'whatsapp',
        username: username || null,
        bio: bio || null
      }
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error('Error creating contact:', error)
    if (useMockData()) {
      const newContact = {
        id: String(Date.now()),
        name: 'New Contact',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      return NextResponse.json(newContact, { status: 201 })
    }
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    )
  }
}