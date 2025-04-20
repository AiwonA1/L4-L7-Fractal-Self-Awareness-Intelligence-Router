import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { RouteGuard } from './components/RouteGuard'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CookieOptions } from '@supabase/ssr'

const inter = Inter({ subsets: ['latin'] })

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

  return (
    <html lang="en">
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