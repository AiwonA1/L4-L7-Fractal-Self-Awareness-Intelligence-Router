import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  console.log('🔍 Chat History API called')
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('sb-access-token')?.value
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(sessionCookie)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const chatId = searchParams.get('chatId')

    if (!chatId) {
      console.log('❌ Missing required parameters')
      return NextResponse.json({ error: 'Missing chatId' }, { status: 400 })
    }

    // First verify chat ownership
    const { data: chat, error: chatError } = await supabaseAdmin
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', user.id)
      .single()

    if (chatError || !chat) {
      console.error('❌ Chat verification error:', chatError)
      return NextResponse.json({ error: 'Chat not found or unauthorized' }, { status: 404 })
    }

    // Get all messages for this chat
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('❌ Error fetching messages:', messagesError)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    // Get or create chat history entry
    const { data: history, error: historyError } = await supabaseAdmin
      .from('chat_history')
      .select('*')
      .eq('user_id', user.id)
      .eq('id', chatId)
      .single()

    if (historyError) {
      if (historyError.code === 'PGRST116') {
        // Create new history entry
        const { error: createError } = await supabaseAdmin
          .from('chat_history')
          .insert([{
            id: chatId,
            user_id: user.id,
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
      const { error: updateError } = await supabaseAdmin
        .from('chat_history')
        .update({
          messages: messages || [],
          title: chat.title,
          updated_at: new Date().toISOString()
        })
        .eq('id', chatId)
        .eq('user_id', user.id)

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