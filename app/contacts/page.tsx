'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'

interface Contact {
  id: string
  name: string
  phone_number?: string
  email?: string
  username?: string
  platform: string
}

export default function ContactsPage() {
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filtered, setFiltered] = useState<Contact[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchContacts()
  }, [])

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
        contact.email?.toLowerCase().includes(query) ||
        contact.username?.toLowerCase().includes(query)
      )
    )
  }

  const deleteContact = async (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        const response = await fetch(`/api/contacts/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          setContacts(contacts.filter((c) => c.id !== id))
          setFiltered(filtered.filter((c) => c.id !== id))
        }
      } catch (error) {
        console.error('Failed to delete contact:', error)
      }
    }
  }

  return (
    <main className="p-4 max-w-2xl mx-auto pb-24">
      <div className="pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground text-sm">
            {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => router.push('/contacts/new')}
          size="icon"
          className="rounded-full"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <Card className="p-4 text-center text-muted-foreground">
            Loading contacts...
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              {contacts.length === 0
                ? 'No contacts yet. Create one to get started!'
                : 'No contacts match your search'}
            </p>
            {contacts.length === 0 && (
              <Button onClick={() => router.push('/contacts/new')}>
                Create Contact
              </Button>
            )}
          </Card>
        ) : (
          filtered.map((contact) => (
            <Card
              key={contact.id}
              className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => router.push(`/contacts/${contact.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{contact.name}</h3>
                  <div className="text-sm text-muted-foreground space-y-1 mt-1">
                    {contact.phone_number && (
                      <p>{contact.phone_number}</p>
                    )}
                    {contact.email && <p>{contact.email}</p>}
                    {contact.username && (
                      <p>
                        @{contact.username}{' '}
                        <span className="capitalize">({contact.platform})</span>
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteContact(contact.id)
                  }}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <BottomNav />
    </main>
  )
}
