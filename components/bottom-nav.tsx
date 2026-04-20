'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Phone, Users, Clock, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', icon: Phone, label: 'Call' },
    { href: '/contacts', icon: Users, label: 'Contacts' },
    { href: '/history', icon: Clock, label: 'History' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background">
      <div className="flex items-center justify-around h-16">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full text-xs gap-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon size={24} />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
