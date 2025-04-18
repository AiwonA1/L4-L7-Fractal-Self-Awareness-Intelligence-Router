import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Database } from '@/types/supabase'

type Chat = Database['public']['Tables']['chats']['Row']

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: chats, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(chats)
  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title } = body

    const { data: chat, error } = await supabase
      .from('chats')
      .insert({
        title,
        user_id: session.user.id,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(chat)
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 