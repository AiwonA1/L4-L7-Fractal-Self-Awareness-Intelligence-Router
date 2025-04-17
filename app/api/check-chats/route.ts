import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    console.log('🔍 Checking Supabase chats')
    
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