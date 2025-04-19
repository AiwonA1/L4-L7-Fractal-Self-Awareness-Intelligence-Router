import { NextResponse } from 'next/server'
import { serverSupabase } from '@/lib/supabase-server'

// Force dynamic for user data routes
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data: { session }, error: authError } = await serverSupabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: userData, error } = await serverSupabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error('Error fetching user data:', error)
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error('User data error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 