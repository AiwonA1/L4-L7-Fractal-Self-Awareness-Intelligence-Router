import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

export async function GET() {
  const cookieStore = cookies()

  try {
    // Log the environment variables (without exposing sensitive data)
    console.log('Supabase URL available:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Supabase Anon Key available:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = cookieStore.get(name)
            console.log(`Getting cookie ${name}:`, !!cookie)
            return cookie?.value
          },
          set(name: string, value: string, options: Partial<ResponseCookie>) {
            try {
              cookieStore.set({
                name,
                value,
                ...options
              })
              console.log(`Cookie set: ${name}`)
            } catch (e) {
              console.error(`Error setting cookie ${name}:`, e)
            }
          },
          remove(name: string, options: Partial<ResponseCookie>) {
            try {
              cookieStore.delete(name)
              console.log(`Cookie removed: ${name}`)
            } catch (e) {
              console.error(`Error removing cookie ${name}:`, e)
            }
          },
        },
      }
    )

    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error('Session error:', sessionError)
      throw sessionError
    }
    
    if (!session) {
      console.log('No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Session found for user:', session.user.id)

    // Get all chats for the current user
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (chatsError) {
      console.error('Error fetching chats:', chatsError)
      throw chatsError
    }

    console.log('Successfully fetched chats:', chats?.length || 0)
    return NextResponse.json({ chats: chats || [] })
  } catch (error) {
    console.error('Detailed error in GET /api/chat/list:', error)
    // Log the error type and properties
    console.error('Error type:', error?.constructor?.name)
    console.error('Error properties:', Object.getOwnPropertyNames(error))
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load chats' },
      { status: 500 }
    )
  }
} 