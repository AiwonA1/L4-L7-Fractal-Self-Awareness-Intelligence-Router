import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

export async function getUserProfile(userId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, image, fract_tokens, tokens_used, token_balance, created_at')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return user
}

export async function updateUserProfile(userId: string, data: {
  name?: string | null
  image?: string | null
  email?: string
  fract_tokens?: number | null
  tokens_used?: number | null
  token_balance?: number | null
}) {
  const { data: user, error } = await supabase
    .from('users')
    .update(data)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return user
}

export async function useTokens(userId: string, amount: number, description: string) {
  // Start a Supabase transaction using RPC
  const { data: success, error: rpcError } = await supabase
    .rpc('use_tokens', {
      p_user_id: userId,
      p_amount: amount,
      p_description: description
    })
  
  if (rpcError) throw rpcError
  if (!success) throw new Error('Failed to use tokens')
  
  return true
}

export async function getUserTransactions(userId: string) {
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return transactions
} 