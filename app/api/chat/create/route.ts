import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  console.log('🔍 Chat creation API called')
  try {
    const supabase = createServerSupabaseClient()
    
    const body = await req.json()
    console.log('📦 Request body:', body)
    const { userId } = body
    
    if (!userId) {
      console.log('❌ No user ID provided')
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    console.log('👤 Creating chat for user:', userId)

    const timestamp = new Date().toISOString()

    // Create the chat with default title
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert([
        {
          user_id: userId,
          title: 'Untitled Chat',
          last_message: null,
          created_at: timestamp,
          updated_at: timestamp
        }
      ])
      .select()
      .single()

    if (chatError) {
      console.error('❌ Chat creation error:', chatError)
      return NextResponse.json({ error: `Chat creation failed: ${chatError.message}` }, { status: 500 })
    }

    console.log('✅ Chat created:', chat)
    return NextResponse.json(chat)
  } catch (error) {
    console.error('❌ Unexpected error in chat creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 