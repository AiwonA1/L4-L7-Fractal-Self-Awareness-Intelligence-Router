'use client'

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Create Supabase client for browser
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      fetch: fetch.bind(globalThis)
    }
  }
)

// Helper function to get user session
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Session error:', error.message)
      throw error
    }
    return session
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}

// Helper function to get user profile
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
      
    if (error) {
      console.error('Profile error:', error.message)
      throw error
    }
    return data
  } catch (error) {
    console.error('Profile error:', error)
    return null
  }
}

// Helper function to update user profile
export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
      
    if (error) {
      console.error('Update error:', error.message)
      throw error
    }
    return data
  } catch (error) {
    console.error('Update error:', error)
    return null
  }
} 