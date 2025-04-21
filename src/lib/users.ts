import { supabaseAdmin } from './supabase-admin'
import type { User } from './types'

export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return user as User | null
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
  const { id, created_at, email, ...validUpdates } = updates

  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(validUpdates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return user as User | null
  } catch (error) {
    console.error('Error updating user profile:', error)
    return null
  }
} 