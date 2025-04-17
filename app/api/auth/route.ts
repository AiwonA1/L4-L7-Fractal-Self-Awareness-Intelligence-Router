import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

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

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  console.log('Auth API Route: Received POST request')
  
  try {
    const { email, password } = await request.json()
    console.log('Auth API Route: Attempting sign in for:', email)

    // Verify admin client is working
    const { data: verifyData, error: verifyError } = await supabaseAdmin.auth.getUser()
    if (verifyError) {
      console.error('Auth API Route: Admin client verification failed:', verifyError)
      return NextResponse.json({ 
        error: 'Invalid service configuration',
        details: verifyError.message
      }, { status: 500 })
    }

    // Attempt sign in
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Auth API Route: Sign in error:', error)
      return NextResponse.json({ 
        error: error.message,
        details: error
      }, { status: 401 })
    }

    console.log('Auth API Route: Sign in successful for user:', data.user.email)

    // Check if user exists in users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (userError) {
      if (userError.code === 'PGRST116') {
        console.log('Auth API Route: Creating new user profile for:', data.user.email)
        const { error: createError } = await supabaseAdmin
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              fract_tokens: 33,
              tokens_used: 0,
              token_balance: 33,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])

        if (createError) {
          console.error('Auth API Route: Error creating user profile:', createError)
          return NextResponse.json({ error: createError.message }, { status: 500 })
        }
        console.log('Auth API Route: Successfully created user profile')
      } else {
        console.error('Auth API Route: Error checking user profile:', userError)
        return NextResponse.json({ error: userError.message }, { status: 500 })
      }
    } else {
      console.log('Auth API Route: Existing user profile found')
    }

    console.log('Auth API Route: Returning successful response with session')
    return NextResponse.json({ 
      user: data.user,
      session: data.session
    })
  } catch (error: any) {
    console.error('Auth API Route: Server error during sign in:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      type: error.constructor.name
    }, { status: 500 })
  }
} 