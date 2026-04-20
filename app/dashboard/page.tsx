'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Phone, PhoneOff, MessageCircle } from 'lucide-react'
import { CallLauncherModal } from '@/components/call-launcher-modal'
import { RecentCalls } from '@/components/recent-calls'

interface Contact {
  id: string
  name: string
  phone_number?: string
  username?: string
  platform: string
}

export default function DashboardPage() {
  const { isLoaded } = useAuth()
  const [showCallLauncher, setShowCallLauncher] = useState(false)
  const [recentContacts, setRecentContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoaded) {
      fetchRecentContacts()
    }
  }, [isLoaded])

  const fetchRecentContacts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/contacts')
      if (response.ok) {
        const contacts = await response.json()
        setRecentContacts(contacts.slice(0, 5))
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoaded) {
    return <div className="p-4 text-center">Loading...</div>
  }

  return (
    <main className="p-4 max-w-2xl mx-auto">
      <div className="pt-8 pb-4">
        <h1 className="text-3xl font-bold mb-2">Lumyn Call</h1>
        <p className="text-muted-foreground">Smart contact calling made easy</p>
      </div>

      {/* Call Launcher Button */}
      <Card className="p-6 mb-6 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <Phone className="w-12 h-12 mx-auto text-primary mb-2" />
            <h2 className="text-xl font-semibold mb-1">Start a Call</h2>
            <p className="text-sm text-muted-foreground">
              Choose a contact and launch a call across your favorite platform
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setShowCallLauncher(true)}
            className="w-full"
          >
            <Phone className="w-4 h-4 mr-2" />
            Launch Call
          </Button>
        </div>
      </Card>

      {/* Recent Contacts */}
      {!isLoading && recentContacts.length > 0 && (
        <Card className="p-4 mb-4">
          <h3 className="font-semibold mb-4">Quick Access Contacts</h3>
          <div className="space-y-2">
            {recentContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => setShowCallLauncher(true)}
              >
                <div className="flex-1">
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {contact.phone_number || contact.username || contact.platform}
                  </p>
                </div>
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {isLoading && (
        <Card className="p-4 text-center text-muted-foreground">
          Loading contacts...
        </Card>
      )}

      {!isLoading && recentContacts.length === 0 && (
        <Card className="p-4 text-center text-muted-foreground">
          <p>No contacts yet. Create one to get started!</p>
        </Card>
      )}

      <RecentCalls />

      <CallLauncherModal
        open={showCallLauncher}
        onOpenChange={setShowCallLauncher}
      />
    </main>
  )
}
