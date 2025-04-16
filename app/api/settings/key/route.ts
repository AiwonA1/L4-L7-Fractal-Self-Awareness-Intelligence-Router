import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { addUserKey } from '@/lib/keyManager'

export async function POST(request: Request) {
  try {
    // Get Supabase session
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { email, key, description } = body

    if (!key) {
      return NextResponse.json(
        { error: 'Key is required' },
        { status: 400 }
      )
    }

    // Verify the email matches the session
    if (email !== session.user.email) {
      return NextResponse.json(
        { error: 'Invalid email' },
        { status: 400 }
      )
    }

    // Save the key
    const success = addUserKey(email, key, description || '')
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save key' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 