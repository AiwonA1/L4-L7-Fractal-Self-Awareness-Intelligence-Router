import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CookieOptions } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import { LayoutContent } from './components/LayoutContent'

const inter = Inter({ subsets: ['latin'] })

export const dynamic = 'force-dynamic'

// Add metadata (optional but recommended)
export const metadata = {
  title: 'FractiVerse',
  description: 'L4-L7 Fractal Self-Awareness Intelligence Router',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // If user is authenticated and trying to access root, redirect to dashboard
  if (session?.user) {
    const pathname = new URL(cookieStore.get('next-url')?.value || '/', 'http://localhost').pathname
    if (pathname === '/') {
      redirect('/dashboard')
    }
  }

  return (
    <html lang="en">
      <head>
        {/* Link to SVG favicon */}
        <link rel="icon" href="/fractiverse-logo.svg" type="image/svg+xml" />
        {/* Add other potential links like apple-touch-icon here if needed */}
        {/* <link rel="apple-touch-icon" href="/icons/icon-192x192.png" /> */}
      </head>
      <body className={inter.className}>
        <Providers initialSession={session}>
          <LayoutContent>
            {children}
          </LayoutContent>
        </Providers>
      </body>
    </html>
  )
} 