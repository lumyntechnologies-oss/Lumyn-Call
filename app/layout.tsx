import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/next'
import { PWAProvider } from '@/components/pwa-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Lumyn',
  description: 'Smart contact management and call launcher',
  manifest: '/manifest.json',
  icons: {
    icon: [
      {
        url: '/image (33).jpg',
        type: 'image/jpeg',
      },
    ],
    apple: '/image (33).jpg',
  },
}

export const viewport: Viewport = {
  themeColor: '#8b5cf6',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/image (33).jpg" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Lumyn" />
          <meta name="theme-color" content="#8b5cf6" />
        </head>
        <body className="font-sans antialiased bg-background">
          <PWAProvider />
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </body>
      </html>
    </ClerkProvider>
  )
}
