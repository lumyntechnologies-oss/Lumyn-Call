import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

async function getOrCreateUser(clerkId: string, email: string) {
  const user = await prisma.user.upsert({
    where: { clerkId },
    update: { email },
    create: { clerkId, email }
  })
  return user.id
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await auth()
    const userEmail = user.sessionClaims?.email as string

    const dbUserId = await getOrCreateUser(userId, userEmail)

    const contacts = await prisma.contact.findMany({
      where: { userId: dbUserId },
      orderBy: { updatedAt: 'desc' }
    })

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

    const user = await auth()
    const userEmail = user.sessionClaims?.email as string

    const dbUserId = await getOrCreateUser(userId, userEmail)

    const contact = await prisma.contact.create({
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
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    )
  }
}