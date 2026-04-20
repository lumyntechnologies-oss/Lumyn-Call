'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Phone, MessageCircle } from 'lucide-react'

interface Contact {
  id: string
  name: string
  phone_number?: string
  username?: string
  platform: string
}

interface CallLauncherModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PLATFORM_CONFIGS = {
  whatsapp: {
    name: 'WhatsApp',
    icon: '💬',
    buildUrl: (contact: Contact) => {
      if (contact.phone_number) {
        return `https://wa.me/${contact.phone_number.replace(/\D/g, '')}`
      }
      return null
    },
  },
  telegram: {
    name: 'Telegram',
    icon: '✈️',
    buildUrl: (contact: Contact) => {
      if (contact.username) {
        return `https://t.me/${contact.username}`
      }
      return null
    },
  },
  instagram: {
    name: 'Instagram',
    icon: '📷',
    buildUrl: (contact: Contact) => {
      if (contact.username) {
        return `https://instagram.com/${contact.username}`
      }
      return null
    },
  },
  phone: {
    name: 'Phone Call',
    icon: '☎️',
    buildUrl: (contact: Contact) => {
      if (contact.phone_number) {
        return `tel:${contact.phone_number}`
      }
      return null
    },
  },
}

export function CallLauncherModal({
  open,
  onOpenChange,
}: CallLauncherModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filtered, setFiltered] = useState<Contact[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchContacts()
    }
  }, [open])

  const fetchContacts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/contacts')
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
        setFiltered(data)
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    const query = value.toLowerCase()
    setFiltered(
      contacts.filter((contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.phone_number?.includes(query) ||
        contact.username?.toLowerCase().includes(query)
      )
    )
  }

  const launchCall = (contact: Contact, platform: string) => {
    const config = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS]
    if (config) {
      const url = config.buildUrl(contact)
      if (url) {
        window.open(url, '_blank')
        logCall(contact.id, platform)
        onOpenChange(false)
      } else {
        alert(`${contact.name} doesn't have the required info for ${config.name}`)
      }
    }
  }

  const logCall = async (contactId: string, platform: string) => {
    try {
      await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: contactId,
          platform,
        }),
      })
    } catch (error) {
      console.error('Failed to log call:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start a Call</DialogTitle>
          <DialogDescription>
            Select a contact and choose your communication platform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
          />

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-4">
                Loading contacts...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                No contacts found
              </div>
            ) : (
              filtered.map((contact) => (
                <Card key={contact.id} className="p-3">
                  <p className="font-medium mb-2">{contact.name}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {contact.phone_number && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => launchCall(contact, 'whatsapp')}
                        className="w-full text-xs"
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        WhatsApp
                      </Button>
                    )}
                    {contact.username && contact.platform === 'telegram' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => launchCall(contact, 'telegram')}
                        className="w-full text-xs"
                      >
                        ✈️ Telegram
                      </Button>
                    )}
                    {contact.username && contact.platform === 'instagram' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => launchCall(contact, 'instagram')}
                        className="w-full text-xs"
                      >
                        📷 Instagram
                      </Button>
                    )}
                    {contact.phone_number && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => launchCall(contact, 'phone')}
                        className="w-full text-xs"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
