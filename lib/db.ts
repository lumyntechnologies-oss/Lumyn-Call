import { PrismaClient } from '@prisma/client'
import { mockUserSettings } from './mock-data'

export let dbConnected = false
export let prisma: PrismaClient | null = null

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

export async function initPrisma() {
  if (!process.env.DATABASE_URL) {
    console.warn('[DB] No DATABASE_URL')
    dbConnected = false
    return
  }

  try {
    prisma = new PrismaClient()
    await prisma.$connect()
    dbConnected = true
    console.log('[DB] Connected to database')
  } catch (error) {
    console.warn('[DB] Connection failed:', error)
    dbConnected = false
    prisma = null
  }
}

export function useMockData() {
  return !dbConnected || !prisma
}

export function getDb() {
  if (prisma) {
    return prisma
  }
  return db
}

export function getMockContacts(_userId: string) {
  return []
}

export function getMockCallLogs(_userId: string) {
  return []
}

export function getMockUser(clerkId: string) {
  return { id: '', clerkId, email: '' }
}

export function getMockSettings() {
  return mockUserSettings
}

export async function closeDb() {
  if (prisma) {
    await prisma.$disconnect()
  }
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db