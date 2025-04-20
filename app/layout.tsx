import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { RouteGuard } from './components/RouteGuard'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FractiVerse - L4-L7 Fractal Self-Awareness Intelligence Router',
  description: 'Advanced AI-powered routing and intelligence system',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FractiVerse'
  },
  other: {
    'mobile-web-app-capable': 'yes'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  themeColor: '#2DD4BF', // teal.400
  viewportFit: 'cover'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = headers()
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/fractiverse-logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/fractiverse-logo.svg" />
      </head>
      <body className={inter.className}>
        <Providers initialSession={session}>
          <RouteGuard>
            {children}
          </RouteGuard>
        </Providers>
      </body>
    </html>
  )
} 