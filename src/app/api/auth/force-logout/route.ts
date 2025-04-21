import { createAdminSupabaseClient } from '@/lib/supabase/supabase-admin'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('sb-access-token')?.value
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = createAdminSupabaseClient()
    const { error } = await supabaseAdmin.auth.signOut()
    
    if (error) {
      console.error('Force logout error:', error)
      return NextResponse.json({ error: 'Failed to force logout' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Force logout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 