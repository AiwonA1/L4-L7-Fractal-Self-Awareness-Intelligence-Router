import { NextResponse } from 'next/server'
import { createServerSupabaseClient, getAuthenticatedUserId } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
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
          return NextResponse.json({ error: getError.message }, { status: 500 })
        }

        return NextResponse.json({ chats })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 