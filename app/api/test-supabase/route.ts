import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { PostgrestError } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('🔍 Testing Supabase connection')
    
    // Test connection by querying chats table
    const { data: chats, error } = await supabaseAdmin
      .from('chats')
      .select('*')
      .limit(5)

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Supabase connection successful')
    console.log('📊 Chats data:', chats)
    
    return NextResponse.json({ success: true, chats })
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 