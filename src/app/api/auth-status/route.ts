import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('Checking auth status...')
    
    const supabase = createServerSupabaseClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Auth status error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!session) {
      console.log('No active session found')
      return NextResponse.json({ 
        authenticated: false,
        message: 'No active session'
      })
    }

    // Get user data if session exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (userError) {
      console.error('User data fetch error:', userError)
    }

    console.log('Active session found:', {
      user: session.user.email,
      userData: userData
    })

    return NextResponse.json({
      authenticated: true,
      session: {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: userData?.name,
          fract_tokens: userData?.fract_tokens,
          tokens_used: userData?.tokens_used,
          token_balance: userData?.token_balance
        },
        expires_at: session.expires_at
      }
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ 
      error: 'Failed to check authentication status'
    }, { status: 500 })
  }
} 