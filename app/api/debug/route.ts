import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createServerSupabaseClient()
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
    
    if (error) throw error
    
    // Get the Supabase session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Check Supabase configuration
    const supabaseConfig = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
      serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set",
    }
    
    return NextResponse.json({
      message: "Auth debug information",
      dbConnection: "Connected successfully",
      dbFirstUser: users[0],
      sessionExists: !!session,
      session: session,
      supabaseConfig,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Debug route error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 