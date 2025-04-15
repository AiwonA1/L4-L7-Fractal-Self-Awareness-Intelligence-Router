import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
    
    // Check if we have a session
    const session = await supabase.auth.getSession()

    if (session) {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if user exists in users table
        const { data: existingUser } = await supabase
          .from('users')
          .select()
          .eq('id', user.id)
          .single()

        if (!existingUser) {
          // Create new user record
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata.full_name,
                avatar_url: user.user_metadata.avatar_url
              }
            ])

          if (insertError) throw insertError
        }
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin)
} 