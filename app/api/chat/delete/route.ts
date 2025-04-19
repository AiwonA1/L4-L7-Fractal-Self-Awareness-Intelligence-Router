import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const session = await supabase.auth.getSession();
    
    if (!session.data.session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.data.session.user.id;
    const url = new URL(req.url);
    const chatId = url.searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    // Delete chat messages first (due to foreign key constraint)
    const { error: messageError } = await supabase
      .from('chat_history')
      .delete()
      .eq('chat_id', chatId)
      .eq('user_id', userId);

    if (messageError) {
      return NextResponse.json({ error: messageError.message }, { status: 400 });
    }

    // Then delete the chat
    const { error: chatError } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId)
      .eq('user_id', userId);

    if (chatError) {
      return NextResponse.json({ error: chatError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 