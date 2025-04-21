import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('🔍 Checking Supabase chats')
    
    const supabase = createServerSupabaseClient()
    
    // Get all chats
    const { data: chats, error } = await supabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Found chats:', chats?.length || 0)
    
    return NextResponse.json({ success: true, count: chats?.length || 0 })
  } catch (error: any) {
    console.error('❌ Unexpected error:', {
      message: error.message,
      details: error.stack,
      hint: '',
      code: ''
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 