import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export const dynamic = 'force-dynamic'

export const createServerSupabaseClient = () => {
  const cookieStore = cookies()

  return createServerClient<Database>(
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
        }
      }
    }
  )
}

// Helper to get authenticated user ID from session
export const getAuthenticatedUserId = async () => {
  const supabase = createServerSupabaseClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session?.user) {
    console.error('Auth error:', error)
    return null
  }

  return session.user.id
}

// Export a default dynamic flag for routes using this client
export const revalidate = 0 