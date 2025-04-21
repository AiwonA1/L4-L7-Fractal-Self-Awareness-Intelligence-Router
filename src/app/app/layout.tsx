import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CookieOptions } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import { LayoutContent } from './components/LayoutContent'

const inter = Inter({ subsets: ['latin'] })

export const dynamic = 'force-dynamic'

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