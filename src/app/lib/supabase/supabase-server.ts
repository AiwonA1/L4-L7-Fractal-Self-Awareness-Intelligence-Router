import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase' // Adjusted path

// This dynamic = 'force-dynamic' export should typically be in the route/page using the client,
// not in the client creation utility itself.
// export const dynamic = 'force-dynamic'

export const createServerSupabaseClient = () => {
  const cookieStore = cookies()

  // Ensure required env vars are present
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl) {
      throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL for createServerSupabaseClient');
  }
  if (!supabaseAnonKey) {
      throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY for createServerSupabaseClient');
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle potential errors setting cookies in Server Actions or Route Handlers
            console.warn(`Error setting cookie ${name}:`, error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options }) // Use set with empty value for removal
          } catch (error) {
            // Handle potential errors removing cookies
            console.warn(`Error removing cookie ${name}:`, error);
          }
        }
      }
    }
  )
}

// Helper to get authenticated user ID from session in Server Components/Actions/Routes
export const getAuthenticatedUserId = async () => {
  const supabase = createServerSupabaseClient();
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Supabase getSession error:', error.message);
      return null;
    }
    if (!session?.user) {
      // Not an error, just no session
      return null;
    }
    return session.user.id;
  } catch (error) {
      console.error('Error getting authenticated user ID:', error);
      return null;
  }
}

// This revalidate = 0 export should typically be in the route/page using the client,
// not in the client creation utility itself.
// export const revalidate = 0 