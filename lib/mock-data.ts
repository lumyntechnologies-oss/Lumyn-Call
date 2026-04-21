export const mockContacts: any[] = []

export const mockCallLogs: any[] = []

export const mockUser = null

export const mockUserSettings = {
  theme: 'system',
  defaultPlatform: 'whatsapp',
  notifications: {
    enabled: true,
    callReminders: true,
    newContactAlerts: false,
    weeklySummary: true
  },
  linkedPlatforms: {
    whatsapp: true,
    telegram: true,
    instagram: true
  }
}

export function getMockContacts(_userId: string) {
  return []
}

export function getMockCallLogs(_userId: string) {
  return []
}

export function getMockUser(_clerkId: string) {
  return null
}

export function getMockSettings() {
  return mockUserSettings
}