import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      console.error('Auth error:', sessionError);
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { messages, chatId, title } = await req.json();
    const userId = session.user.id;

    // If chatId is provided, update existing chat
    if (chatId) {
      // First verify chat ownership
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .select('id')
        .eq('id', chatId)
        .eq('user_id', userId)
        .single();

      if (chatError || !chat) {
        console.error('Chat verification error:', chatError);
        return NextResponse.json({ error: 'Chat not found or access denied' }, { status: 403 });
      }

      // Update chat title and timestamp
      const { error: updateError } = await supabase
        .from('chats')
        .update({ 
          title,
          updated_at: new Date().toISOString()
        })
        .eq('id', chatId)
        .eq('user_id', userId);

      if (updateError) {
        console.error('Chat update error:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }

      // Insert new messages
      if (messages && messages.length > 0) {
        const { error: messageError } = await supabase
          .from('messages')
          .insert(
            messages.map((msg: any) => ({
              chat_id: chatId,
              role: msg.role,
              content: msg.content,
              created_at: msg.timestamp || new Date().toISOString()
            }))
          );

        if (messageError) {
          console.error('Message insert error:', messageError);
          return NextResponse.json({ error: messageError.message }, { status: 400 });
        }
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
        console.error('Chat creation error:', chatError);
        return NextResponse.json({ error: chatError?.message || 'Failed to create chat' }, { status: 400 });
      }

      // Insert initial messages
      if (messages && messages.length > 0) {
        const { error: messageError } = await supabase
          .from('messages')
          .insert(
            messages.map((msg: any) => ({
              chat_id: chatData.id,
              role: msg.role,
              content: msg.content,
              created_at: msg.timestamp || new Date().toISOString()
            }))
          );

        if (messageError) {
          console.error('Message insert error:', messageError);
          // Delete the chat if message insertion fails
          await supabase.from('chats').delete().eq('id', chatData.id);
          return NextResponse.json({ error: messageError.message }, { status: 400 });
        }
      }

      return NextResponse.json({ chatId: chatData.id });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 