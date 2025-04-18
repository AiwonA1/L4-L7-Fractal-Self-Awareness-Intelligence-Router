import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
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

    // Get user's chats
    const { data: chats, error: chatsError } = await supabaseAdmin
      .from('chats')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (chatsError) {
      throw chatsError
    }

    return NextResponse.json({ chats: chats || [] })
  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const { title } = await request.json()

    // Create new chat
    const { data: chat, error: chatError } = await supabaseAdmin
      .from('chats')
      .insert({
        user_id: user.id,
        title: title || 'New Chat',
      })
      .select()
      .single()

    if (chatError) {
      throw chatError
    }

    return NextResponse.json({ chat })
  } catch (error) {
    console.error('Error creating chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 