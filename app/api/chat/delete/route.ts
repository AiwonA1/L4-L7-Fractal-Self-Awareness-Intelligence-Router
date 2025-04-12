import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { chatId, userId } = body

    if (!chatId || !userId) {
      return NextResponse.json({ error: 'Chat ID and User ID required' }, { status: 400 })
    }

    // Verify the chat belongs to the user
    const { data: chat, error: chatCheckError } = await supabaseAdmin
      .from('chats')
      .select('id')
      .eq('id', chatId)
      .eq('user_id', userId)
      .single()

    if (chatCheckError || !chat) {
      console.error('❌ Chat ownership verification failed:', chatCheckError)
      return NextResponse.json({ error: 'Chat not found or unauthorized' }, { status: 404 })
    }

    // Delete messages first (due to foreign key constraint)
    const { error: messagesError } = await supabaseAdmin
      .from('messages')
      .delete()
      .eq('chat_id', chatId)

    if (messagesError) {
      console.error('❌ Error deleting messages:', messagesError)
      return NextResponse.json({ error: `Failed to delete messages: ${messagesError.message}` }, { status: 500 })
    }

    // Delete chat
    const { error: chatError } = await supabaseAdmin
      .from('chats')
      .delete()
      .eq('id', chatId)
      .eq('user_id', userId)

    if (chatError) {
      console.error('❌ Error deleting chat:', chatError)
      return NextResponse.json({ error: `Failed to delete chat: ${chatError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error in chat deletion:', error)
    return NextResponse.json(
      { error: 'Failed to delete chat' },
      { status: 500 }
    )
  }
} 