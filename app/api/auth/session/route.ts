import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: Request) {
  console.log('Session API Route: Received GET request')

  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Session API Route: Error fetching session:', error)
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (!session) {
      return NextResponse.json({ session: null }, { status: 200 })
    }

    console.log('Session API Route: Session found for user:', session.user.email)
    return NextResponse.json({ session })
  } catch (error: any) {
    console.error('Session API Route: Server error:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 })
  }
} 