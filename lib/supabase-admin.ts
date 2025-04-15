import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing Supabase URL. Please check your .env.local file and Vercel environment variables.')
}

if (!supabaseServiceKey) {
  throw new Error('Missing Supabase service role key. Please check your .env.local file and Vercel environment variables.')
}

// Admin client for server-side operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
) 