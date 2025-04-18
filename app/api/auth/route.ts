import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Immediate logging when module is loaded
console.log('Auth API Route: Module loaded')
console.log('Auth API Route: Environment check', {
  hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
})

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Auth API Route: Missing required environment variables')
  throw new Error('Missing required environment variables')
}

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    return NextResponse.json({ session })
  } catch (error) {
    console.error('Auth route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { email, password } = await request.json()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Auth route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 