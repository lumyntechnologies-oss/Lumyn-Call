'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Phone } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'

interface Contact {
  id: string
  name: string
  phone_number?: string
  email?: string
  username?: string
  platform: string
  bio?: string
}

export default function ContactDetailPage() {
  const router = useRouter()
  const params = useParams()
  const contactId = params.id as string

  const [contact, setContact] = useState<Contact | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Contact | null>(null)

  useEffect(() => {
    fetchContact()
  }, [contactId])

  const fetchContact = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/contacts/${contactId}`)
      if (response.ok) {
        const data = await response.json()
        setContact(data)
        setFormData(data)
      } else {
        router.push('/contacts')
      }
    } catch (error) {
      console.error('Failed to fetch contact:', error)
      router.push('/contacts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData || !formData.name.trim()) {
      alert('Please enter a contact name')
      return
    }

    try {
      setIsSaving(true)
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updated = await response.json()
        setContact(updated)
        setIsEditing(false)
      } else {
        alert('Failed to update contact')
      }
    } catch (error) {
      console.error('Failed to update contact:', error)
      alert('Failed to update contact')
    } finally {
      setIsSaving(false)
    }
  }

  const launchCall = () => {
    if (!contact) return

    const platformConfigs: Record<string, { url: string | null }> = {
      whatsapp: {
        url: contact.phone_number
          ? `https://wa.me/${contact.phone_number.replace(/\D/g, '')}`
          : null,
      },
      telegram: {
        url: contact.username ? `https://t.me/${contact.username}` : null,
      },
      instagram: {
        url: contact.username
          ? `https://instagram.com/${contact.username}`
          : null,
      },
      phone: {
        url: contact.phone_number ? `tel:${contact.phone_number}` : null,
      },
    }

    const config = platformConfigs[contact.platform]
    if (config.url) {
      window.open(config.url, '_blank')
      logCall()
    } else {
      alert('No contact information available for this platform')
    }
  }

  const logCall = async () => {
    try {
      await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: contactId,
          platform: contact?.platform,
        }),
      })
    } catch (error) {
      console.error('Failed to log call:', error)
    }
  }

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>
  }

  if (!contact && !formData) {
    return <div className="p-4 text-center">Contact not found</div>
  }

  const displayData = isEditing ? formData : contact

  return (
    <main className="p-4 max-w-2xl mx-auto pb-24">
      <div className="pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isEditing) {
                setIsEditing(false)
                setFormData(contact)
              } else {
                router.back()
              }
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">{displayData?.name}</h1>
        </div>
      </div>

      <div className="space-y-4">
        <Button
          onClick={launchCall}
          size="lg"
          className="w-full"
        >
          <Phone className="w-4 h-4 mr-2" />
          Start Call
        </Button>

        <Card className="p-6">
          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="text-lg font-medium">{contact?.name}</p>
              </div>

              {contact?.phone_number && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-lg font-medium">{contact.phone_number}</p>
                </div>
              )}

              {contact?.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-lg font-medium">{contact.email}</p>
                </div>
              )}

              {contact?.username && (
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="text-lg font-medium capitalize">
                    @{contact.username} ({contact.platform})
                  </p>
                </div>
              )}

              {contact?.bio && (
                <div>
                  <p className="text-sm text-muted-foreground">Bio</p>
                  <p className="text-lg">{contact.bio}</p>
                </div>
              )}

              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="w-full"
              >
                Edit Contact
              </Button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData?.name || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData!,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={formData?.platform || ''}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData!,
                      platform: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData?.phone_number || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData!,
                      phone_number: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData?.email || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData!,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData?.username || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData!,
                      username: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  value={formData?.bio || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData!,
                      bio: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setFormData(contact)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>

      <BottomNav />
    </main>
  )
}
