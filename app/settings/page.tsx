'use client'

import { useState, useEffect } from 'react'
import { useClerk, useUser } from '@clerk/nextjs'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { 
  LogOut, 
  User, 
  Moon, 
  Sun, 
  Download, 
  Trash2, 
  Upload,
  Bell,
  Link2,
  Smartphone,
  Mail,
  MessageCircle,
  Send
} from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'

interface UserSettings {
  theme: string
  defaultPlatform: string
  notifications: {
    enabled: boolean
    callReminders: boolean
    newContactAlerts: boolean
    weeklySummary: boolean
  }
  linkedPlatforms: {
    whatsapp: boolean
    telegram: boolean
    instagram: boolean
  }
}

const defaultSettings: UserSettings = {
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

export default function SettingsPage() {
  const { signOut } = useClerk()
  const { user } = useUser()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json')

  const handleExport = async () => {
    try {
      const contactsRes = await fetch('/api/contacts')
      const callsRes = await fetch('/api/calls')
      const contacts = await contactsRes.json()
      const calls = await callsRes.json()

      const data = { contacts, calls, exportedAt: new Date().toISOString() }
      
      if (exportFormat === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `lumyn-export-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        const csvContacts = contacts.map((c: any) => 
          `${c.name},${c.phoneNumber || ''},${c.email || ''},${c.platform || ''},${c.username || ''},${c.bio || ''}`
        ).join('\n')
        const csvHeader = 'name,phone,email,platform,username,bio\n'
        const blob = new Blob([csvHeader + csvContacts], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `lumyn-contacts-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      let contacts = []

      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text)
        contacts = data.contacts || []
      } else {
        const lines = text.split('\n').filter(Boolean)
        const headers = lines[0].split(',')
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',')
          const contact: any = {}
          headers.forEach((h, idx) => {
            contact[h.trim()] = values[idx]?.trim()
          })
          contacts.push(contact)
        }
      }

      for (const contact of contacts) {
        await fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: contact.name,
            phone_number: contact.phoneNumber || contact.phone,
            email: contact.email,
            platform: contact.platform || 'whatsapp',
            username: contact.username,
            bio: contact.bio
          })
        })
      }

      setImportDialogOpen(false)
      window.location.reload()
    } catch (error) {
      console.error('Import failed:', error)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return
    
    try {
      await fetch('/api/settings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      signOut({ redirectUrl: '/' })
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="p-4 max-w-2xl mx-auto pb-24">
      <div className="pt-6 pb-4">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
      </div>

      <div className="space-y-4">
        {user && (
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                {user.imageUrl && (
                  <img
                    src={user.imageUrl}
                    alt="Profile"
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold">{user.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>
        )}

        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            {theme === 'dark' || (theme === 'system' && mounted) ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
            Appearance
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Theme</Label>
              <Select value={theme || 'system'} onValueChange={setTheme}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Default Platform
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>New contacts default to</Label>
              <Select 
                value={settings.defaultPlatform} 
                onValueChange={(v) => updateSetting('defaultPlatform', v)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="call">Phone Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive push alerts</p>
              </div>
              <Switch 
                checked={settings.notifications.enabled}
                onCheckedChange={(v) => updateSetting('notifications', { ...settings.notifications, enabled: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Call Reminders</Label>
                <p className="text-xs text-muted-foreground">Remind to call contacts</p>
              </div>
              <Switch 
                checked={settings.notifications.callReminders}
                onCheckedChange={(v) => updateSetting('notifications', { ...settings.notifications, callReminders: v })}
                disabled={!settings.notifications.enabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>New Contact Alerts</Label>
                <p className="text-xs text-muted-foreground">Notify when new contact added</p>
              </div>
              <Switch 
                checked={settings.notifications.newContactAlerts}
                onCheckedChange={(v) => updateSetting('notifications', { ...settings.notifications, newContactAlerts: v })}
                disabled={!settings.notifications.enabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Weekly Summary</Label>
                <p className="text-xs text-muted-foreground">Weekly call activity summary</p>
              </div>
              <Switch 
                checked={settings.notifications.weeklySummary}
                onCheckedChange={(v) => updateSetting('notifications', { ...settings.notifications, weeklySummary: v })}
                disabled={!settings.notifications.enabled}
              />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Linked Platforms
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-500" />
                <Label>WhatsApp</Label>
              </div>
              <Switch 
                checked={settings.linkedPlatforms.whatsapp}
                onCheckedChange={(v) => updateSetting('linkedPlatforms', { ...settings.linkedPlatforms, whatsapp: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-500" />
                <Label>Telegram</Label>
              </div>
              <Switch 
                checked={settings.linkedPlatforms.telegram}
                onCheckedChange={(v) => updateSetting('linkedPlatforms', { ...settings.linkedPlatforms, telegram: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-pink-500 text-lg">📸</span>
                <Label>Instagram</Label>
              </div>
              <Switch 
                checked={settings.linkedPlatforms.instagram}
                onCheckedChange={(v) => updateSetting('linkedPlatforms', { ...settings.linkedPlatforms, instagram: v })}
              />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Data Management
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Export Data</Label>
                <p className="text-xs text-muted-foreground">Download contacts & call logs</p>
              </div>
              <Select value={exportFormat} onValueChange={(v: 'json' | 'csv') => setExportFormat(v)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleExport} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export as {exportFormat.toUpperCase()}
            </Button>

            <div className="flex items-center justify-between pt-2">
              <div>
                <Label>Import Contacts</Label>
                <p className="text-xs text-muted-foreground">Import from CSV or JSON</p>
              </div>
              <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Import Contacts</DialogTitle>
                    <DialogDescription>
                      Upload a CSV or JSON file with your contacts. 
                      CSV should have headers: name, phone, email, platform, username, bio
                    </DialogDescription>
                  </DialogHeader>
                  <Input 
                    type="file" 
                    accept=".csv,.json"
                    onChange={handleImport}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
              <span className="text-3xl">📱</span>
            </div>
            <div>
              <h3 className="font-bold text-xl">Lumyn</h3>
              <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            </div>
          </div>
        </Card>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">Delete Account</DialogTitle>
              <DialogDescription>
                This will permanently delete all your data including contacts and call logs.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label>Type DELETE to confirm</Label>
              <Input 
                value={deleteConfirmText} 
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          variant="destructive"
          className="w-full"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Account
        </Button>

        <Button
          onClick={() => signOut({ redirectUrl: '/sign-in' })}
          variant="outline"
          className="w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <BottomNav />
    </main>
  )
}