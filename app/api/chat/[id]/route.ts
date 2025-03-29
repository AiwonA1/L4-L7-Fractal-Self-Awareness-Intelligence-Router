import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
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
    
    const session = await getServerSession()
    if (!session?.user?.email) {
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
    if (user.tokenBalance <= 0) {
      console.log(`[PUT /api/chat/${params.id}] User out of FractiTokens: ${user.tokenBalance}`)
      return NextResponse.json(
        { error: 'Insufficient FractiTokens. Please purchase more tokens to continue.' },
        { status: 402 }
      )
    }

    // Get chat
    const chat = await prisma.chat.findUnique({
      where: {
        id: params.id,
        userId: user.id
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
        model: "gpt-4-0125-preview",
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
      await prisma.usage.create({
        data: {
          userId: user.id,
          chatId: chat.id,
          inputTokens: usage.prompt_tokens,
          outputTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          cost: llmCost,
          fractiTokensUsed: 1
        }
      })

      // Deduct 1 FractiToken for the command
      const newBalance = user.tokenBalance - 1
      await prisma.user.update({
        where: { id: user.id },
        data: { tokenBalance: newBalance }
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
          messages: JSON.stringify(updatedMessages),
          updatedAt: new Date()
        }
      })

      console.log(`[PUT /api/chat/${params.id}] Chat updated successfully`)
      console.log(`[PUT /api/chat/${params.id}] New FractiToken balance: ${newBalance}`)

      return NextResponse.json({
        messages: updatedMessages,
        usage: {
          inputTokens: usage.prompt_tokens,
          outputTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          llmCost: llmCost,
          fractiTokensUsed: 1
        },
        balance: newBalance
      })
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  } catch (error) {
    console.error(`[PUT /api/chat/${params.id}] Error:`, error)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out. Please try again.' },
          { status: 504 }
        )
      }
      return NextResponse.json(
        { error: error.message || 'Failed to process chat request' },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const chat = await prisma.chat.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    if (chat.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.chat.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting chat:', error)
    return NextResponse.json(
      { error: 'Failed to delete chat' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title } = await request.json()

    const chat = await prisma.chat.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    if (chat.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updatedChat = await prisma.chat.update({
      where: { id: params.id },
      data: { title }
    })

    return NextResponse.json(updatedChat)
  } catch (error) {
    console.error('Error updating chat:', error)
    return NextResponse.json(
      { error: 'Failed to update chat' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[GET /api/chat/${params.id}] Starting request`)
    
    const session = await getServerSession()
    if (!session?.user?.email) {
      console.log(`[GET /api/chat/${params.id}] Unauthorized - no session`)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      console.log(`[GET /api/chat/${params.id}] User not found: ${session.user.email}`)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get chat with messages
    console.log(`[GET /api/chat/${params.id}] Fetching chat`)
    const chat = await prisma.chat.findUnique({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!chat) {
      console.log(`[GET /api/chat/${params.id}] Chat not found`)
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // Parse messages if they're stored as a string
    let messages: ChatMessage[] = []
    if (typeof chat.messages === 'string') {
      try {
        messages = JSON.parse(chat.messages)
      } catch (error) {
        console.error(`[GET /api/chat/${params.id}] Error parsing messages:`, error)
      }
    } else if (Array.isArray(chat.messages)) {
      // Apply proper type validation to ensure they are ChatMessages
      const jsonMessages = chat.messages as any[];
      messages = jsonMessages.filter(msg => 
        typeof msg === 'object' && 
        msg !== null &&
        'role' in msg && 
        'content' in msg &&
        typeof msg.role === 'string' &&
        typeof msg.content === 'string'
      ) as ChatMessage[];
    }

    console.log(`[GET /api/chat/${params.id}] Chat found, messages count:`, messages.length)
    console.log(`[GET /api/chat/${params.id}] First message:`, messages[0] ? JSON.stringify(messages[0]).slice(0, 100) + '...' : 'No messages')

    // Return formatted chat data
    return NextResponse.json({
      id: chat.id,
      title: chat.title,
      messages: messages,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    })
  } catch (error) {
    console.error(`[GET /api/chat/${params.id}] Error:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch chat' },
      { status: 500 }
    )
  }
} 