import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase' // Corrected path assuming global types

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseServiceKey) {
    throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
}

// Admin client for server-side operations requiring elevated privileges.
// Use sparingly and only when RLS is insufficient.
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Function to get an admin client instance if needed elsewhere
export const createAdminSupabaseClient = () => {
  // Re-check keys in case environment changes, though typically stable
  if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase service role credentials for createAdminSupabaseClient')
  }
  return createClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
} 