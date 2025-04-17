import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('Checking session...')

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing required environment variables:', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      })
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set(name, value, options)
            } catch (error) {
              console.error('Error setting cookie:', error)
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set(name, '', { ...options, maxAge: 0 })
            } catch (error) {
              console.error('Error removing cookie:', error)
            }
          },
        },
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        }
      }
    )

    console.log('Getting session from Supabase...')
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Session error:', {
        message: error.message,
        status: error.status,
        name: error.name
      })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!session) {
      console.log('No active session found')
      return NextResponse.json({ user: null })
    }

    console.log('Session found for user:', session.user.email)

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (userError) {
        console.error('User data fetch error:', {
          message: userError.message,
          details: userError.details,
          hint: userError.hint
        })
        return NextResponse.json({ user: session.user })
      }

      const user = {
        ...session.user,
        ...userData
      }

      console.log('Successfully retrieved user data')
      return NextResponse.json({ user })
    } catch (userError: any) {
      console.error('Error fetching user data:', {
        message: userError.message,
        stack: userError.stack,
        name: userError.name
      })
      return NextResponse.json({ user: session.user })
    }
  } catch (error: any) {
    console.error('Session check failed:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json({ user: null })
  }
} 