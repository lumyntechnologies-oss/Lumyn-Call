'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
import { ArrowLeft, Upload, Scan } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'

export default function NewContactPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [platform, setPlatform] = useState('whatsapp')
  const [showImport, setShowImport] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    username: '',
    bio: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Please enter a contact name')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          platform,
        }),
      })

      if (response.ok) {
        router.push('/contacts')
      } else {
        alert('Failed to create contact')
      }
    } catch (error) {
      console.error('Failed to create contact:', error)
      alert('Failed to create contact')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVCardImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const contacts = parseVCard(text)
      
      if (contacts.length > 0) {
        const contact = contacts[0]
        setFormData({
          name: contact.name || '',
          phone_number: contact.phone || '',
          email: contact.email || '',
          username: contact.username || '',
          bio: '',
        })
        if (contact.phone) setPlatform('whatsapp')
        else if (contact.username) setPlatform('telegram')
      }
      setShowImport(false)
    } catch (error) {
      console.error('Failed to parse vCard:', error)
      alert('Failed to parse contact file')
    }
  }

  const parseVCard = (vcardText: string): any[] => {
    const vcards = vcardText.split('BEGIN:VCARD')
    const contacts = []

    for (const vcard of vcards) {
      if (!vcard.trim()) continue
      
      const contact: any = {}
      
      const fnMatch = vcard.match(/FN[;:]*(.+)/)
      if (fnMatch) contact.name = fnMatch[1].trim()

      const telMatch = vcard.match(/TEL[;:]*(.+)/)
      if (telMatch) contact.phone = telMatch[1].replace(/[^0-9+]/g, '')

      const emailMatch = vcard.match(/EMAIL[;:]*(.+)/)
      if (emailMatch) contact.email = emailMatch[1].trim()

      const usernameMatch = vcard.match(/(?:TG|USERNAME)[;:]*(.+)/)
      if (usernameMatch) contact.username = usernameMatch[1].trim()

      if (contact.name) contacts.push(contact)
    }

    return contacts
  }

  const handlePasteImport = () => {
    navigator.clipboard.readText().then(text => {
      const lines = text.split('\n')
      const contact: any = {}

      for (const line of lines) {
        const [key, ...valueParts] = line.split(':')
        const value = valueParts.join(':').trim()
        
        if (key.toLowerCase().includes('name') || key === 'fn') {
          contact.name = value
        } else if (key.toLowerCase().includes('tel') || key.toLowerCase().includes('phone')) {
          contact.phone = value.replace(/[^0-9+]/g, '')
        } else if (key.toLowerCase().includes('email')) {
          contact.email = value
        }
      }

      if (contact.name) {
        setFormData({
          name: contact.name || formData.name,
          phone_number: contact.phone || formData.phone_number,
          email: contact.email || formData.email,
          username: '',
          bio: '',
        })
      }
      setShowImport(false)
    }).catch(() => {
      alert('Could not read clipboard. Make sure you have copied contact info.')
    })
  }

  return (
    <main className="p-4 max-w-2xl mx-auto pb-24">
      <div className="pt-6 pb-4 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">New Contact</h1>
      </div>

      {!showImport ? (
        <>
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="joshua mwendwa"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
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

              {(platform === 'whatsapp' || platform === 'phone') && (
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+254792687584"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Include country code for WhatsApp (e.g., +254...)
                  </p>
                </div>
              )}

              {(platform === 'telegram' || platform === 'instagram') && (
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Without the @ symbol
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  placeholder="Add notes about this contact"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Creating...' : 'Create Contact'}
                </Button>
              </div>
            </form>
          </Card>

          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => setShowImport(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Contact
          </Button>
        </>
      ) : (
        <Card className="p-6 space-y-4">
          <div className="text-center space-y-4">
            <Scan className="w-12 h-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              Import contact from file or clipboard
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept=".vcf,.csv"
            onChange={handleVCardImport}
            className="hidden"
          />

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import from vCard (.vcf)
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handlePasteImport}
            >
              <Scan className="w-4 h-4 mr-2" />
              Paste from Clipboard
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setShowImport(false)}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <BottomNav />
    </main>
  )
}