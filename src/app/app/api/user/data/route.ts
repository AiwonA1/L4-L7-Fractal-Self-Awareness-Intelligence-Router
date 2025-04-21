import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Force dynamic for user data routes
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error('User data error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 