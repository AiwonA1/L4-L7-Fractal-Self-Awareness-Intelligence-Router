import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Mark route as dynamic
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test database connection
    const { data, error } = await supabase
      .from('users')
      .select('id, email')
      .limit(1)

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      message: 'Database connection successful',
      testData: data 
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 