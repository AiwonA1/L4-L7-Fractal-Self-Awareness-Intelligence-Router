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

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { email, password } = await request.json()
    console.log('Auth API Route: Attempting sign in for:', email)

    // Attempt sign in
    const { data, error } = await supabase.auth.signInWithPassword({
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
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (userError && userError.code === 'PGRST116') {
      // Create new user record
      const newUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || null,
        fract_tokens: 0,
        tokens_used: 0,
        token_balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }

      console.log('Created new user:', createdUser)
      return NextResponse.json(createdUser)
    }

    if (userError) {
      console.error('Error fetching user data:', userError)
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 