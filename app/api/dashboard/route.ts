import { NextResponse } from 'next/server'
import { createServerSupabaseClient, getAuthenticatedUserId } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      console.log('No authenticated user found')
      return NextResponse.json({ 
        error: 'Not authenticated',
        message: 'Please sign in to continue'
      }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const { action, title, chatId } = await req.json()

    switch (action) {
      case 'create_chat':
        const { data: chat, error: createError } = await supabase
          .from('chats')
          .insert({
            user_id: userId,
            title: title || 'New Chat',
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating chat:', createError)
          return NextResponse.json({ error: createError.message }, { status: 500 })
        }

        return NextResponse.json({ chat })

      case 'get_chats':
        const { data: chats, error: getError } = await supabase
          .from('chats')
          .select(`
            *,
            messages (
              *,
              created_at
            )
          `)
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })

        if (getError) {
          console.error('Error fetching chats:', getError)
          return NextResponse.json({ error: getError.message }, { status: 500 })
        }

        return NextResponse.json({ chats })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error?.message
    }, { status: 500 })
  }
} 