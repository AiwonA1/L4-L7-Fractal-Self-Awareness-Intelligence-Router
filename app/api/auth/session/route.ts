import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables')
}

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          },
        },
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        }
      }
    )

    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Session error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ user: null })
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (userError) {
      console.error('User data fetch error:', userError)
      return NextResponse.json({ user: session.user })
    }

    const user = {
      ...session.user,
      ...userData
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Session check failed:', error)
    return NextResponse.json({ user: null })
  }
} 