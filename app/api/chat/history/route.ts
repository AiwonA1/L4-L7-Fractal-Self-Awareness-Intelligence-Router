import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  console.log('🔍 Chat History API called')
  try {
    const supabase = createServerSupabaseClient()
    
    const { searchParams } = new URL(req.url)
    const chatId = searchParams.get('chatId')
    const userId = searchParams.get('userId')

    if (!chatId || !userId) {
      console.log('❌ Missing required parameters')
      return NextResponse.json({ error: 'Missing chatId or userId' }, { status: 400 })
    }

    // First verify chat ownership
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', userId)
      .single()

    if (chatError || !chat) {
      console.error('❌ Chat verification error:', chatError)
      return NextResponse.json({ error: 'Chat not found or unauthorized' }, { status: 404 })
    }

    // Get all messages for this chat
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('❌ Error fetching messages:', messagesError)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    // Get or create chat history entry
    const { data: history, error: historyError } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .eq('id', chatId)
      .single()

    if (historyError) {
      if (historyError.code === 'PGRST116') {
        // Create new history entry
        const { error: createError } = await supabase
          .from('chat_history')
          .insert([{
            id: chatId,
            user_id: userId,
            title: chat.title,
            messages: messages || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (createError) {
          console.error('❌ Error creating chat history:', createError)
          // Don't fail the request, just log the error
          console.log('⚠️ Failed to create chat history')
        }
      } else {
        console.error('❌ Error fetching chat history:', historyError)
        // Don't fail the request, just log the error
        console.log('⚠️ Failed to fetch chat history')
      }
    } else if (history) {
      // Update history if messages have changed
      const { error: updateError } = await supabase
        .from('chat_history')
        .update({
          messages: messages || [],
          title: chat.title,
          updated_at: new Date().toISOString()
        })
        .eq('id', chatId)
        .eq('user_id', userId)

      if (updateError) {
        console.error('❌ Error updating chat history:', updateError)
        // Don't fail the request, just log the error
        console.log('⚠️ Failed to update chat history')
      }
    }

    // Format messages for response
    const formattedMessages = messages?.map(msg => ({
      role: msg.role,
      content: msg.content
    })) || []

    return NextResponse.json({ messages: formattedMessages })

  } catch (error) {
    console.error('❌ Unexpected error in chat history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 