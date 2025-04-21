import { supabase } from '@/app/lib/supabase/client' // Corrected path
import type { Database } from '@/types/supabase' // Assuming global types
import type { User, Transaction } from '@/app/lib/types' // Use shared types

// Functions intended for CLIENT-SIDE usage (using anon key)

export async function getUserProfile(userId: string): Promise<Partial<User> | null> {
  try {
    const { data: user, error } = await supabase
      .from('users') // Ensure table name matches
      .select('id, email, name, token_balance') // Select specific fields needed client-side
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error("Error fetching user profile (client-side):", error);
      return null;
    }
    return user;
  } catch (error) {
      console.error("Client-side getUserProfile error:", error);
      return null;
  }
}

// Note: Client-side updates might be restricted by RLS. 
// Consider using Server Actions or API routes for secured updates.
export async function updateUserProfileClient(userId: string, data: {
  name?: string | null;
  // Add other fields permitted by RLS for client-side update
}): Promise<Partial<User> | null> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId)
      .select('id, name') // Select minimal fields
      .single()
    
    if (error) throw error;
    return user;
  } catch (error) {
      console.error("Client-side updateUserProfile error:", error);
      return null;
  }
}

// Consider if this RPC call is secure/appropriate for client-side invocation
// It might be better handled via an API route or Server Action.
export async function useTokensClient(userId: string, amount: number, description: string): Promise<boolean> {
  try {
    const { data: success, error: rpcError } = await supabase
      .rpc('use_tokens', {
        p_user_id: userId,
        p_amount: amount,
        p_description: description
      })
    
    if (rpcError) throw rpcError;
    if (!success) throw new Error('Failed to use tokens (insufficient balance or error)');
    
    return true;
  } catch (error) {
      console.error("Client-side useTokens error:", error);
      return false;
  }
}

export async function getUserTransactionsClient(userId: string): Promise<Transaction[] | null> {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error;
    return transactions;
  } catch (error) {
      console.error("Client-side getUserTransactions error:", error);
      return null;
  }
} 