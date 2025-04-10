import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { PostgrestError } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('\n=== Starting Comprehensive Supabase System Test ===\n')
    
    // Test 1: Basic Supabase connection and auth
    console.log('1. Testing Supabase Connection and Auth...')
    const { data: { session }, error: authError } = await supabaseAdmin.auth.getSession()
    if (authError) throw new Error(`Auth error: ${authError.message}`)
    console.log('✓ Supabase connection and auth successful:', session ? 'Session active' : 'No active session')

    // Test 2: Check if all required tables exist
    console.log('\n2. Checking Database Tables...')
    const requiredTables = ['users', 'chats', 'messages', 'transactions']
    const tablePromises = requiredTables.map(table => 
      supabaseAdmin
        .from(table)
        .select('count(*)')
        .limit(1)
    )
    
    try {
      await Promise.all(tablePromises)
      console.log('✓ All required tables exist:', requiredTables)
    } catch (error) {
      const pgError = error as PostgrestError
      throw new Error(`Tables check error: ${pgError.message}`)
    }

    // Test 3: Get user data with token balance
    console.log('\n3. Checking User Data and Tokens...')
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'paradisepru@icloud.com')
      .single()
    if (userError) throw new Error(`User data error: ${userError.message}`)
    console.log('✓ User found:', {
      email: user?.email,
      name: user?.name,
      fract_tokens: user?.fract_tokens,
      tokens_used: user?.tokens_used,
      token_balance: user?.token_balance
    })

    // Test 4: Create a test chat
    console.log('\n4. Testing Chat Creation...')
    const { data: newChat, error: chatError } = await supabaseAdmin
      .from('chats')
      .insert([{
        title: 'Test Chat ' + new Date().toISOString(),
        user_id: user.id,
      }])
      .select()
      .single()
    if (chatError) throw new Error(`Chat creation error: ${chatError.message}`)
    console.log('✓ Created test chat:', newChat)

    // Test 5: Add test messages
    console.log('\n5. Testing Message Creation...')
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .insert([
        {
          chat_id: newChat.id,
          content: 'Test user message',
          role: 'user',
        },
        {
          chat_id: newChat.id,
          content: 'Test assistant response',
          role: 'assistant',
        }
      ])
      .select()
    if (messagesError) throw new Error(`Messages creation error: ${messagesError.message}`)
    console.log('✓ Created test messages:', messages)

    // Test 6: Get all user's chats with messages
    console.log('\n6. Checking Chat History...')
    const { data: allChats, error: allChatsError } = await supabaseAdmin
      .from('chats')
      .select(`
        *,
        messages:messages(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (allChatsError) throw new Error(`Chat history error: ${allChatsError.message}`)
    console.log('✓ Found', allChats?.length, 'chats')
    console.log('✓ Latest chat messages:', allChats?.[0]?.messages)

    // Test 7: Clean up test data
    console.log('\n7. Cleaning up test data...')
    const { data: deletedChat, error: deleteError } = await supabaseAdmin
      .from('chats')
      .delete()
      .eq('id', newChat.id)
      .select()
      .single()
    if (deleteError) throw new Error(`Delete error: ${deleteError.message}`)
    console.log('✓ Deleted test chat:', deletedChat.id)

    // Test 8: Verify deletion
    const { data: verifyDeleted, error: verifyError } = await supabaseAdmin
      .from('chats')
      .select()
      .eq('id', newChat.id)
      .single()
    if (verifyError && verifyError.code !== 'PGRST116') {
      throw new Error(`Verify deletion error: ${verifyError.message}`)
    }
    console.log('✓ Verify deletion (should be null):', verifyDeleted)
    
    console.log('\n=== System Test Complete ===\n')

    return NextResponse.json({
      success: true,
      message: 'All system tests completed successfully',
      results: {
        supabaseConnection: { success: true, hasSession: !!session },
        tables: requiredTables,
        userData: {
          email: user?.email,
          name: user?.name,
          fract_tokens: user?.fract_tokens,
          tokens_used: user?.tokens_used,
          token_balance: user?.token_balance
        },
        chatHistory: {
          totalChats: allChats?.length || 0,
          testChat: {
            created: newChat,
            messages: messages,
            deleted: deletedChat,
            verifyDeleted: verifyDeleted
          }
        }
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      errorDetails: error instanceof Error ? {
        name: error.name,
        stack: error.stack
      } : {},
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 