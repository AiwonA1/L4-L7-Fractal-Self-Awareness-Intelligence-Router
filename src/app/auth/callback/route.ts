import { createClient } from '@/lib/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // Get the session to ensure it was created
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Create or update user profile
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (profileError) {
          console.error('Profile update error:', profileError)
        }
        
        return redirect(next)
      }
    }
  }

  // Redirect to error page if verification fails
  return redirect('/login?error=auth')
} 