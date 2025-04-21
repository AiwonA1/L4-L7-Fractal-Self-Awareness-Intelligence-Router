import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase-admin'
import fs from 'fs'
import path from 'path'

// Initialize OpenAI with the provided API key
const openai = new OpenAI({
  // Use environment variable for API key, fall back to an empty string if not set
  apiKey: process.env.OPENAI_API_KEY || '',
  // Allow running in test environment that might appear browser-like
  dangerouslyAllowBrowser: true 
})

// Load the FractiVerse prompt from the file
const promptFilePath = path.join(process.cwd(), 'src/lib/fractiverse-prompt.txt')
const FRACTIVERSE_PROMPT = fs.readFileSync(promptFilePath, 'utf-8')

export async function POST(req: Request) {
  // Check if the API key is actually configured
  if (!openai.apiKey) {
    console.error('OpenAI API key is not configured')
    return NextResponse.json(
      { error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.' },
      { status: 500 }
    )
  }

  try {
    const { message, chatId, userId } = await req.json()

    if (!message || !chatId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user's token balance
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('token_balance')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      console.error('Error fetching user data:', userError)
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    // Check if user has enough tokens (minimum 10 tokens required)
    if (userData.token_balance < 10) {
      return NextResponse.json(
        { error: 'Insufficient tokens. Minimum 10 tokens required.' },
        { status: 400 }
      )
    }

    // Get chat history
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('Error fetching chat history:', messagesError)
      return NextResponse.json(
        { error: 'Failed to fetch chat history' },
        { status: 500 }
      )
    }

    // Format messages for OpenAI
    const formattedMessages = messages?.map(msg => ({
      role: msg.role,
      content: msg.content
    })) || []

    // Add system message with FractiVerse prompt and current user message
    const apiMessages = [
      {
        role: "system",
        content: FRACTIVERSE_PROMPT
      },
      ...formattedMessages,
      {
        role: "user",
        content: message
      }
    ]

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 1000,
    })

    if (!completion.choices[0]?.message?.content) {
      throw new Error('No response from OpenAI')
    }

    // Calculate token usage - each model has different token costs
    const promptTokens = completion.usage?.prompt_tokens || 0
    const completionTokens = completion.usage?.completion_tokens || 0
    const totalTokens = promptTokens + completionTokens
    
    // Deduct tokens from user's balance (minimum 10 tokens, or actual usage if higher)
    const tokensToDeduct = Math.max(10, totalTokens)
    
    // Call the token usage API
    const tokenResponse = await fetch(new URL('/api/tokens/use', req.url).href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        amount: tokensToDeduct,
        description: `ChatID: ${chatId} - OpenAI API call`
      }),
    })
    
    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.json()
      console.error('Error deducting tokens:', tokenError)
      return NextResponse.json(
        { error: 'Failed to process token deduction' },
        { status: 500 }
      )
    }

    // Store the message in history
    const { error: insertError } = await supabaseAdmin
      .from('messages')
      .insert([
        {
          chat_id: chatId,
          user_id: userId,
          role: 'user',
          content: message
        },
        {
          chat_id: chatId,
          user_id: userId,
          role: 'assistant',
          content: completion.choices[0].message.content
        }
      ])

    if (insertError) {
      console.error('Error storing messages:', insertError)
      // Don't fail the request if message storage fails
    }

    // Return the response with token usage information
    return NextResponse.json({
      role: 'assistant',
      content: completion.choices[0].message.content,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens,
        tokensDeducted: tokensToDeduct
      }
    })
  } catch (error) {
    console.error('Error in FractiVerse API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to process request: ${errorMessage}` },
      { status: 500 }
    )
  }
} 