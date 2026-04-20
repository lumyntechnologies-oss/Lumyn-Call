'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Phone, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { BottomNav } from '@/components/bottom-nav'

interface CallLog {
  id: string
  contact_name?: string
  platform: string
  created_at: string
  duration_seconds?: number
}

export default function HistoryPage() {
  const [calls, setCalls] = useState<CallLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCalls()
  }, [])

  const fetchCalls = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/calls')
      if (response.ok) {
        const data = await response.json()
        setCalls(data)
      }
    } catch (error) {
      console.error('Failed to fetch calls:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="p-4 max-w-2xl mx-auto pb-24">
      <div className="pt-6 pb-4">
        <h1 className="text-3xl font-bold">Call History</h1>
        <p className="text-muted-foreground text-sm">
          {calls.length} call{calls.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <Card className="p-4 text-center text-muted-foreground">
            Loading call history...
          </Card>
        ) : calls.length === 0 ? (
          <Card className="p-8 text-center">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">
              No calls yet. Start a call to see it here!
            </p>
          </Card>
        ) : (
          calls.map((call) => (
            <Card
              key={call.id}
              className="p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold">
                      {call.contact_name || 'Unknown Contact'}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">
                    {call.platform} •{' '}
                    {formatDistanceToNow(new Date(call.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {call.duration_seconds && (
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {Math.floor(call.duration_seconds / 60)}m{' '}
                      {call.duration_seconds % 60}s
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      <BottomNav />
    </main>
  )
}
