import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore,
    })

    if (code) {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(new URL('/login?error=auth', requestUrl.origin))
      }

      // Get the session to ensure it was created
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        return NextResponse.redirect(new URL('/login?error=session', requestUrl.origin))
      }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
  } catch (error) {
    console.error('Auth callback error:', error)
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    return NextResponse.redirect(new URL('/login?error=unknown', origin))
  }
} 