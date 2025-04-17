import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase.auth.signOut()
    
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