import { supabaseAdmin } from './supabase/supabase-admin' // Correct path
import type { User } from './types'; // Assuming User type matches Supabase table

export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users') // Ensure this table name matches your DB
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
        if (error.code === 'PGRST116') { // PostgREST error code for "Resource Not Found"
            console.log(`User profile not found for ID: ${userId}`);
            return null; // Not found is not necessarily a console error
        } else {
            throw error; // Re-throw other errors
        }
    }
    return user as User | null;
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
  // Remove fields that shouldn't be updated directly via this function
  const { id, created_at, email, password, ...validUpdates } = updates;

  // Add updated_at manually if not handled by a trigger
  const updatesWithTimestamp = {
      ...validUpdates,
      updated_at: new Date().toISOString(),
  };

  try {
    const { data: user, error } = await supabaseAdmin
      .from('users') // Ensure this table name matches your DB
      .update(updatesWithTimestamp)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error;
    return user as User | null;
  } catch (error) {
    console.error('Error updating user profile:', error)
    return null
  }
} 