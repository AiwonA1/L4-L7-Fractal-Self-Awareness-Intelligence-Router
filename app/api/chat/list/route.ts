import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      console.log('❌ Missing userId parameter')
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    console.log('🔍 Fetching chats for user:', userId)

    const { data: chats, error } = await supabaseAdmin
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching chats:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw error
    }

    console.log('✅ Found chats:', chats?.length || 0)
    return NextResponse.json(chats || [])
  } catch (error: any) {
    console.error('❌ Error in chat list:', {
      message: error.message,
      details: error.stack,
      hint: '',
      code: ''
    })
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    )
  }
} 