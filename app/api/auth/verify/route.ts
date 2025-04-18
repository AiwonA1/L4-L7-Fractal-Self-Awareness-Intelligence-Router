import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const supabase = createClient<Database>(supabaseUrl, supabaseKey)
  
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Verify the token using Supabase's built-in email verification
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    })

    if (verifyError) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    // Update user's email_verified status
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ message: 'Email verified successfully' })
  } catch (error) {
    console.error('Error verifying email:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Verify the token
    const supabase = createClient<Database>(supabaseUrl, supabaseKey)
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    })

    if (verifyError) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    // Redirect to success page
    return NextResponse.redirect(new URL('/verify-success', request.url))
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.redirect(new URL('/verify-error', request.url))
  }
} 