import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // 1. Test Auth/Session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw new Error(`Session error: ${sessionError.message}`)

    // 2. Test Profiles Table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
    if (profilesError) throw new Error(`Profiles error: ${profilesError.message}`)

    // 3. Test Chats Table
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .limit(5)
    if (chatsError) throw new Error(`Chats error: ${chatsError.message}`)

    // 4. Test Messages Table
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(5)
    if (messagesError) throw new Error(`Messages error: ${messagesError.message}`)

    // 5. Test Token Transactions Table
    const { data: transactions, error: transactionsError } = await supabase
      .from('token_transactions')
      .select('*')
      .limit(5)
    if (transactionsError) throw new Error(`Transactions error: ${transactionsError.message}`)

    // Return all test results
    return NextResponse.json({
      success: true,
      data: {
        session: session ? 'Active' : 'No active session',
        profiles: {
          count: profiles?.length || 0,
          sample: profiles
        },
        chats: {
          count: chats?.length || 0,
          sample: chats
        },
        messages: {
          count: messages?.length || 0,
          sample: messages
        },
        transactions: {
          count: transactions?.length || 0,
          sample: transactions
        }
      }
    })

  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
} 