import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import type { Database } from '@/types/supabase'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

function isChatMessage(obj: any): obj is ChatMessage {
  return typeof obj === 'object' && 
         typeof obj.role === 'string' && 
         ['user', 'assistant', 'system'].includes(obj.role) &&
         typeof obj.content === 'string'
}

function validateMessages(messages: any[]): ChatMessage[] {
  return messages.filter(isChatMessage)
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Read the FractiVerse prompt from a file
const FRACTIVERSE_PROMPT = fs.readFileSync(
  path.join(process.cwd(), 'lib/fractiverse-prompt.txt'),
  'utf-8'
)

type Chat = Database['public']['Tables']['chats']['Row']
type User = Database['public']['Tables']['users']['Row']

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[PUT /api/chat/${params.id}] Starting request`)
    
    // Get request body
    const body = await request.json()
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    
    const messages = validateMessages(body.messages)
    if (messages.length === 0) {
      return NextResponse.json({ error: 'No valid messages found' }, { status: 400 })
    }

    // Get Supabase session
    const cookieStore = cookies()
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user?.email) {
      console.log(`[PUT /api/chat/${params.id}] Unauthorized - no session`)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (userError || !user) {
      console.log(`[PUT /api/chat/${params.id}] User not found: ${session.user.email}`)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check token balance
    const currentBalance = user.token_balance ?? 0
    if (currentBalance <= 0) {
      console.log(`[PUT /api/chat/${params.id}] User out of FractiTokens: ${currentBalance}`)
      return NextResponse.json(
        { error: 'Insufficient FractiTokens. Please purchase more tokens to continue.' },
        { status: 402 }
      )
    }

    // Get chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (chatError || !chat) {
      console.log(`[PUT /api/chat/${params.id}] Chat not found`)
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // Get the last message
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || !lastMessage.content) {
      console.log(`[PUT /api/chat/${params.id}] No valid message content found`)
      return NextResponse.json(
        { error: 'No valid message content found' },
        { status: 400 }
      )
    }

    // Call OpenAI API with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      console.log(`[PUT /api/chat/${params.id}] Request timed out`)
    }, 60000) // 60 second timeout

    try {
      console.log(`[PUT /api/chat/${params.id}] Calling OpenAI API with message:`, lastMessage.content.slice(0, 100))
      
      // Get existing messages and ensure system prompt is present
      const validatedMessages = validateMessages(messages)
      let apiMessages: Message[] = validatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      if (!validatedMessages.some(msg => msg.role === 'system')) {
        apiMessages = [
          { role: 'system', content: FRACTIVERSE_PROMPT },
          ...apiMessages
        ]
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
      }, { signal: controller.signal })

      clearTimeout(timeoutId)

      if (!completion.choices[0]?.message?.content) {
        console.log(`[PUT /api/chat/${params.id}] No response content received`)
        throw new Error('No response content received from OpenAI')
      }

      console.log(`[PUT /api/chat/${params.id}] Received response from OpenAI API`)
      console.log(`[PUT /api/chat/${params.id}] Response:`, 
        completion.choices[0].message.content.slice(0, 200) + '...'
      )

      // Calculate LLM token usage for tracking purposes
      const usage = completion.usage
      if (!usage) {
        throw new Error('No usage information received from OpenAI')
      }

      const llmCost = (usage.prompt_tokens * 0.03 + usage.completion_tokens * 0.06) / 1000

      // Create usage record with both LLM tokens and FractiToken
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'CHAT',
          amount: 1,
          description: `Chat message with ${usage.total_tokens} tokens`,
          status: 'COMPLETED'
        })

      if (transactionError) throw transactionError

      // Deduct 1 FractiToken for the command
      const newBalance = currentBalance - 1
      const { error: updateError } = await supabase
        .from('users')
        .update({ token_balance: newBalance })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Add assistant's response to messages
      const updatedMessages = [
        ...messages,
        {
          role: 'assistant',
          content: completion.choices[0].message.content
        }
      ]

      // Update chat with new messages
      const { error: chatUpdateError } = await supabase
        .from('chats')
        .update({ 
          last_message: completion.choices[0].message.content.slice(0, 100),
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)

      if (chatUpdateError) throw chatUpdateError

      console.log(`[PUT /api/chat/${params.id}] Chat updated successfully`)
      console.log(`[PUT /api/chat/${params.id}] New FractiToken balance: ${newBalance}`)

      return NextResponse.json({
        messages: updatedMessages,
        token_balance: newBalance,
        usage: {
          total_tokens: usage.total_tokens,
          cost: llmCost
        }
      })

    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error(`[PUT /api/chat/${params.id}] Error:`, error)
      throw error
    }

  } catch (error: any) {
    console.error(`[PUT /api/chat/${params.id}] Error:`, {
      message: error.message,
      stack: error.stack
    })
    
    return NextResponse.json({
      error: error.message || 'An error occurred',
    }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient<Database>(supabaseUrl, supabaseKey)
  
  try {
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', params.id)
    
    if (error) throw error
    
    return NextResponse.json({ message: 'Chat deleted successfully' })
  } catch (error) {
    console.error('Error deleting chat:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Get Supabase session
    const cookieStore = cookies()
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update chat
    const { data: updatedChat, error: updateError } = await supabase
      .from('chats')
      .update(body)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) throw updateError
    return NextResponse.json(updatedChat)
  } catch (error: any) {
    console.error('Error updating chat:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient<Database>(supabaseUrl, supabaseKey)
  
  try {
    const { data: chat, error } = await supabase
      .from('chats')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (error) throw error
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }
    
    return NextResponse.json(chat)
  } catch (error) {
    console.error('Error fetching chat:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 