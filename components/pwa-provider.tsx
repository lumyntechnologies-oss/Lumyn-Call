'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function PWAProvider() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.log('Service Worker registration failed:', error)
      })
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowPrompt(true)
    }

    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return

    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstallPrompt(null)
      setShowPrompt(false)
      setIsInstalled(true)
    }
  }

  if (isInstalled || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg z-50 flex items-center gap-3">
      <div className="flex-1">
        <p className="font-medium text-sm">Install Lumyn</p>
        <p className="text-xs opacity-90">Add to your home screen for quick access</p>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleInstall}
        className="shrink-0"
      >
        Install
      </Button>
      <button
        onClick={() => setShowPrompt(false)}
        className="text-lg opacity-70 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  )
}
