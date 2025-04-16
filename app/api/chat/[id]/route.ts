import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { Prisma } from '@prisma/client'

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
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user?.email) {
      console.log(`[PUT /api/chat/${params.id}] Unauthorized - no session`)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      console.log(`[PUT /api/chat/${params.id}] User not found: ${session.user.email}`)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check token balance
    if (user.token_balance <= 0) {
      console.log(`[PUT /api/chat/${params.id}] User out of FractiTokens: ${user.token_balance}`)
      return NextResponse.json(
        { error: 'Insufficient FractiTokens. Please purchase more tokens to continue.' },
        { status: 402 }
      )
    }

    // Get chat
    const chat = await prisma.chat.findUnique({
      where: {
        id: params.id,
        user_id: user.id
      }
    })

    if (!chat) {
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
      await prisma.transaction.create({
        data: {
          user_id: user.id,
          type: 'CHAT',
          amount: 1,
          description: 'Chat message',
          status: 'COMPLETED',
          input_tokens: usage.prompt_tokens,
          output_tokens: usage.completion_tokens,
          total_tokens: usage.total_tokens,
          cost: llmCost
        }
      })

      // Deduct 1 FractiToken for the command
      const newBalance = user.token_balance - 1
      await prisma.user.update({
        where: { id: user.id },
        data: { token_balance: newBalance }
      })

      // Add assistant's response to messages
      const updatedMessages = [
        ...messages,
        {
          role: 'assistant',
          content: completion.choices[0].message.content
        }
      ]

      // Update chat with new messages
      await prisma.chat.update({
        where: { id: params.id },
        data: { 
          last_message: completion.choices[0].message.content.slice(0, 100),
          updated_at: new Date()
        }
      })

      console.log(`[PUT /api/chat/${params.id}] Chat updated successfully`)
      console.log(`[PUT /api/chat/${params.id}] New FractiToken balance: ${newBalance}`)

      return NextResponse.json({
        messages: updatedMessages,
        token_balance: newBalance
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
  try {
    // Get Supabase session
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete chat
    await prisma.chat.delete({
      where: {
        id: params.id,
        user_id: user.id
      }
    })

    return NextResponse.json({ message: 'Chat deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting chat:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
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
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update chat
    const updatedChat = await prisma.chat.update({
      where: {
        id: params.id,
        user_id: user.id
      },
      data: body
    })

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
  try {
    // Get Supabase session
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get chat
    const chat = await prisma.chat.findUnique({
      where: {
        id: params.id,
        user_id: user.id
      }
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    return NextResponse.json(chat)
  } catch (error: any) {
    console.error('Error getting chat:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 