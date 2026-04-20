'use client'

import { useClerk, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LogOut, User } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'

export default function SettingsPage() {
  const { signOut } = useClerk()
  const { user } = useUser()

  return (
    <main className="p-4 max-w-2xl mx-auto pb-24">
      <div className="pt-6 pb-4">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account</p>
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
          <h3 className="font-semibold mb-3">About</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-1">Lumyn Call</p>
              <p>Smart contact management and call launcher</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Version</p>
              <p>1.0.0</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Features</p>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>WhatsApp deep linking</li>
                <li>Telegram integration</li>
                <li>Instagram direct messaging</li>
                <li>Phone call logs</li>
                <li>Contact management</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3">App Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform</span>
              <span>Web & Mobile (PWA)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Database</span>
              <span>Neon PostgreSQL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Authentication</span>
              <span>Clerk</span>
            </div>
          </div>
        </Card>

        <Button
          onClick={() => signOut({ redirectUrl: '/sign-in' })}
          variant="destructive"
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
