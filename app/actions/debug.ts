'use server'

import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'

export async function debugUserDataAccess() {
  try {
    // Create admin client
    const supabase = createAdminSupabaseClient()
    
    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      return {
        status: 'error',
        message: 'Session error',
        error: sessionError.message,
        userId: null,
        email: null,
        userData: null,
        cookies: null
      }
    }
    
    if (!session?.user) {
      return {
        status: 'error',
        message: 'No session found',
        userId: null,
        email: null,
        userData: null,
        cookies: getCookieInfo()
      }
    }
    
    // Try to get user data
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (userError) {
        return {
          status: 'error',
          message: 'User data error',
          error: userError.message,
          code: userError.code,
          userId: session.user.id,
          email: session.user.email,
          userData: null,
          cookies: getCookieInfo()
        }
      }
      
      return {
        status: 'success',
        message: 'User data found',
        userId: session.user.id,
        email: session.user.email,
        userData,
        cookies: getCookieInfo()
      }
    } catch (error: any) {
      return {
        status: 'error',
        message: 'Unexpected error querying user',
        error: error.message,
        userId: session.user.id,
        email: session.user.email,
        userData: null,
        cookies: getCookieInfo()
      }
    }
  } catch (error: any) {
    return {
      status: 'error',
      message: 'Unexpected error',
      error: error.message,
      cookies: getCookieInfo()
    }
  }
}

export async function checkDatabaseAccess() {
  const supabase = createAdminSupabaseClient()
  
  try {
    // Check if we can query a simple DB function
    const { data, error } = await supabase.rpc('version')
    
    if (error) {
      return {
        status: 'error',
        message: 'Database access error',
        error: error.message,
        data: null
      }
    }
    
    return {
      status: 'success',
      message: 'Database accessible',
      data
    }
  } catch (error: any) {
    return {
      status: 'error',
      message: 'Database connection error',
      error: error.message,
      data: null
    }
  }
}

function getCookieInfo() {
  try {
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    
    // Return just the names and partial values for security
    return allCookies.map(cookie => ({
      name: cookie.name,
      // Just show first few chars of value for security
      valuePreview: cookie.value.substring(0, 10) + '...'
    }))
  } catch (error: any) {
    return {
      error: error.message
    }
  }
} 