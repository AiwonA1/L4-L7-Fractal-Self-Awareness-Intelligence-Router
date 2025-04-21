import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { rateLimitCheck, getIp } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  // --- Rate Limiting ---
  const ip = getIp(request) ?? 'unknown_ip';
  const { success: limitReached } = await rateLimitCheck(ip, 'auth');
  if (!limitReached) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  // --- End Rate Limiting ---

  const supabase = createClient<Database>(supabaseUrl, supabaseKey)
  
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !user) {
      // For security reasons, still return success even if user doesn't exist
      return NextResponse.json({ message: 'If an account exists, a password reset link has been sent.' })
    }

    // Send password reset email using Supabase Auth
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_URL}/reset-password`
    })

    if (resetError) {
      throw resetError
    }

    return NextResponse.json({
      message: 'If an account exists, a password reset link has been sent.'
    })
  } catch (error) {
    console.error('Error in forgot password:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 