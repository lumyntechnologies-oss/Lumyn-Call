'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Phone } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface CallLog {
  id: string
  contact_name?: string
  platform: string
  created_at: string
  duration_seconds?: number
}

export function RecentCalls() {
  const [calls, setCalls] = useState<CallLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCalls()
    const interval = setInterval(fetchCalls, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchCalls = async () => {
    try {
      const response = await fetch('/api/calls')
      if (response.ok) {
        const data = await response.json()
        setCalls(data.slice(0, 5))
      }
    } catch (error) {
      console.error('Failed to fetch calls:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && calls.length === 0) {
    return null
  }

  if (calls.length === 0) {
    return null
  }

  return (
    <Card className="p-4 mt-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Phone className="w-4 h-4" />
        Recent Calls
      </h3>
      <div className="space-y-2">
        {calls.map((call) => (
          <div
            key={call.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-sm">
                {call.contact_name || 'Unknown Contact'}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {call.platform} •{' '}
                {formatDistanceToNow(new Date(call.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
            {call.duration_seconds && (
              <p className="text-xs text-muted-foreground">
                {Math.floor(call.duration_seconds / 60)}m{' '}
                {call.duration_seconds % 60}s
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
