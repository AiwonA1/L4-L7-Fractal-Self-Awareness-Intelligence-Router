import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  console.log('🔍 Message API called')
  try {
    const body = await req.json()
    console.log('📦 Request body:', body)
    const { chatId, userId, content, role } = body
    
    if (!chatId || !userId || !content || !role) {
      console.log('❌ Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify chat ownership
    const { data: chat, error: chatError } = await supabaseAdmin
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', userId)
      .single()

    if (chatError || !chat) {
      console.error('❌ Chat verification error:', chatError)
      return NextResponse.json({ error: 'Chat not found or unauthorized' }, { status: 404 })
    }

    // Get existing messages count before creating new message
    const { count: messageCount, error: countError } = await supabaseAdmin
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('chat_id', chatId)

    if (countError) {
      console.error('❌ Error counting messages:', countError)
      return NextResponse.json({ error: 'Failed to check message count' }, { status: 500 })
    }

    // Create new message
    const { data: message, error: messageError } = await supabaseAdmin
      .from('messages')
      .insert([
        {
          chat_id: chatId,
          role,
          content,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (messageError) {
      console.error('❌ Message creation error:', messageError)
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
    }

    // Update chat's last_message and title if it's the first user message
    const updates: any = {
      last_message: content,
      updated_at: new Date().toISOString()
    }

    // Update title if this is the first user message to be more descriptive
    if (messageCount === 0 && role === 'user') {
      // Create a meaningful title from the first message
      updates.title = content.length > 30 
        ? content.slice(0, 27) + '...'
        : content
    }

    const { error: updateError } = await supabaseAdmin
      .from('chats')
      .update(updates)
      .eq('id', chatId)
      .eq('user_id', userId)

    if (updateError) {
      console.error('❌ Chat update error:', updateError)
      // Don't fail the request if update fails, but log it
      console.log('⚠️ Failed to update chat title/last message')
    }

    return NextResponse.json({ 
      message,
      chatUpdated: !updateError,
      newTitle: updates.title
    })
  } catch (error) {
    console.error('❌ Unexpected error in message creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 