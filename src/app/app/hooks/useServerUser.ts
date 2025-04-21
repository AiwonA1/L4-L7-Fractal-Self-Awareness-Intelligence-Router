import { createServerSupabaseClient } from '@/lib/supabase-server'
import { cache } from 'react'

export const getServerUser = cache(async () => {
  const supabase = createServerSupabaseClient()
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return null
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return null
    }

    return {
      ...session.user,
      ...userData
    }
  } catch (error) {
    console.error('Error in getServerUser:', error)
    return null
  }
}) 