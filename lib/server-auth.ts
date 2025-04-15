import { createServerSupabaseClient } from './supabase-server'
import { redirect } from 'next/navigation'

export async function getServerSession() {
  const supabase = createServerSupabaseClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

export async function requireAuth() {
  const session = await getServerSession()
  
  if (!session) {
    redirect('/login')
  }
  
  return session
} 