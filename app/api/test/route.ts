import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: Request) {
  const supabase = createClient<Database>(supabaseUrl, supabaseKey)
  
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('sb-access-token')?.value
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionCookie)

    if (authError || !user) {
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