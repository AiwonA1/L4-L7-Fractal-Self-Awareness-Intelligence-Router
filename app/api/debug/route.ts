import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    // Get session info
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 })
    }

    // Check if cookie is set
    const cookieStatus = session ? 'Cookie is set' : 'Cookie is not set'

    return NextResponse.json({
      users,
      session,
      cookieStatus,
      supabaseConfigured: true
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 