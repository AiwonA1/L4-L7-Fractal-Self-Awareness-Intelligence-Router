'use server'

import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/supabase'

// User type with additional profile fields
type User = Database['public']['Tables']['users']['Row']

/**
 * Get the current user's data including profile information
 */
export async function getCurrentUser() {
  const supabase = createAdminSupabaseClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) throw new Error('Not authenticated')
  
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()
  
  if (error) throw error
  
  return user
}

/**
 * Get a user by ID
 */
export async function getUserById(userId: string) {
  const supabase = createAdminSupabaseClient()
  
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  
  return user
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(updateData: Partial<User>) {
  const supabase = createAdminSupabaseClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) throw new Error('Not authenticated')
  
  const { data: updatedUser, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', session.user.id)
    .select()
    .single()
  
  if (error) throw error
  
  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return updatedUser
}

/**
 * Update user token balance (e.g., after using tokens or purchasing)
 */
export async function updateUserTokens(userId: string, tokens: number) {
  const supabase = createAdminSupabaseClient()
  
  // First, get current token balance
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('fract_tokens')
    .eq('id', userId)
    .single()
  
  if (fetchError) throw fetchError
  
  const currentTokens = user?.fract_tokens || 0
  const newTokenBalance = currentTokens + tokens
  
  // Update the token balance
  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({ fract_tokens: newTokenBalance })
    .eq('id', userId)
    .select()
    .single()
  
  if (updateError) throw updateError
  
  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return updatedUser
} 