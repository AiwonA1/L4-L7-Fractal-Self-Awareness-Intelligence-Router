import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('sb-access-token')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionCookie);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const chatId = url.searchParams.get('chatId');

    // If chatId is provided, fetch specific chat history
    if (chatId) {
      const { data: messages, error: messageError } = await supabase
        .from('chat_history')
        .select('*')
        .eq('chat_id', chatId)
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true });

      if (messageError) {
        return NextResponse.json({ error: messageError.message }, { status: 400 });
      }

      return NextResponse.json({ messages });
    }

    // Otherwise fetch all chats
    const { data: chats, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (chatError) {
      return NextResponse.json({ error: chatError.message }, { status: 400 });
    }

    return NextResponse.json({ chats });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 