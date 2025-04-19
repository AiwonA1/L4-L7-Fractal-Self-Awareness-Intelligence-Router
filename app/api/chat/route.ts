import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { Message } from '@/types/chat';

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const session = await supabase.auth.getSession();
    
    if (!session.data.session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.data.session.user.id;
    const { messages, chatId, title } = await req.json();

    // If chatId is provided, update existing chat
    if (chatId) {
      const { error: chatError } = await supabase
        .from('chats')
        .update({ 
          title,
          updated_at: new Date().toISOString()
        })
        .eq('id', chatId)
        .eq('user_id', userId);

      if (chatError) {
        return NextResponse.json({ error: chatError.message }, { status: 400 });
      }

      const { error: messageError } = await supabase
        .from('chat_history')
        .insert(
          messages.map((msg: Message) => ({
            chat_id: chatId,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            user_id: userId
          }))
        );

      if (messageError) {
        return NextResponse.json({ error: messageError.message }, { status: 400 });
      }
    } else {
      // Create new chat
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert({
          user_id: userId,
          title: title || 'New Chat',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (chatError || !chatData) {
        return NextResponse.json({ error: chatError?.message || 'Failed to create chat' }, { status: 400 });
      }

      const { error: messageError } = await supabase
        .from('chat_history')
        .insert(
          messages.map((msg: Message) => ({
            chat_id: chatData.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            user_id: userId
          }))
        );

      if (messageError) {
        return NextResponse.json({ error: messageError.message }, { status: 400 });
      }

      return NextResponse.json({ chatId: chatData.id });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 