import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { chatId, userId, title, created_at } = body

    if (!chatId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Build update object based on provided fields
    const updateData: { title?: string; created_at?: string } = {}
    if (title) updateData.title = title
    if (created_at) updateData.created_at = created_at

    const { data: chat, error } = await supabaseAdmin
      .from('chats')
      .update(updateData)
      .eq('id', chatId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating chat:', error)
      throw error
    }

    return NextResponse.json(chat)
  } catch (error) {
    console.error('❌ Error in chat update:', error)
    return NextResponse.json(
      { error: 'Failed to update chat' },
      { status: 500 }
    )
  }
} 