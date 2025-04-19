import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export const dynamic = 'force-dynamic'

export const createServerSupabaseClient = () => {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
      },
      auth: {
        persistSession: false
      }
    }
  )
}

// Helper to get authenticated user ID from session cookie
export const getAuthenticatedUserId = async () => {
  const supabase = createServerSupabaseClient()
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('sb-access-token')?.value

  if (!sessionCookie) {
    return null
  }

  const { data: { user }, error } = await supabase.auth.getUser(sessionCookie)
  if (error || !user) {
    return null
  }

  return user.id
}

// Export a default dynamic flag for routes using this client
export const revalidate = 0 