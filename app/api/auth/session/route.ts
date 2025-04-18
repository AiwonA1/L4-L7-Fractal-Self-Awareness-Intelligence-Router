import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

export async function GET(request: Request) {
  console.log('Session API Route: Received GET request')

  try {
    const cookieStore = cookies()

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string; secure?: boolean }) {
            try {
              cookieStore.set({
                name,
                value,
                ...options
              })
            } catch (error) {
              // Handle cookie setting error
              console.error('Error setting cookie:', error)
            }
          },
          remove(name: string, options: { path?: string; domain?: string }) {
            try {
              cookieStore.set({
                name,
                value: '',
                maxAge: 0,
                ...options
              })
            } catch (error) {
              // Handle cookie removal error
              console.error('Error removing cookie:', error)
            }
          }
        }
      }
    )

    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Session API Route: Error fetching session:', error)
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (!session) {
      return NextResponse.json({ session: null }, { status: 200 })
    }

    console.log('Session API Route: Session found for user:', session.user.email)
    return NextResponse.json({ session })
  } catch (error: any) {
    console.error('Session API Route: Server error:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 })
  }
} 