import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
    
    if (error) throw error
    
    // Get cookies from the request
    const cookieStore = cookies()
    const cookieList = cookieStore.getAll()
    const cookieNames = cookieList.map(c => c.name)
    
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
      cookieStatus: {
        cookieNames,
        sbSession: cookieStore.get('sb-access-token') ? "Found" : "Not found",
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Debug route error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 