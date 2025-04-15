import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file and Vercel environment variables.')
}

// Create Supabase client for browser
export const createClient = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
)

// Create Supabase client for server components
export const createServerComponentClient = () => {
  const cookieStore = cookies()
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookies.set error in Server Components
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookies.delete error in Server Components
          }
        },
      },
    }
  )
}

// Helper function to get user session
export const getSession = async () => {
  try {
    const { data: { session }, error } = await createClient.auth.getSession()
    if (error) throw error
    return session
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}

// Helper function to get user profile
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await createClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
      
    if (error) throw error
    return data
  } catch (error) {
    console.error('Profile error:', error)
    return null
  }
}

// Helper function to update user profile
export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await createClient
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
      
    if (error) throw error
    return data
  } catch (error) {
    console.error('Update error:', error)
    return null
  }
} 