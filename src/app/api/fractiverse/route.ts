import { NextResponse, NextRequest } from 'next/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase/supabase-admin'
import fs from 'fs'
import path from 'path'
import { rateLimitCheck } from '@/lib/rate-limit'
// Import the core streamText utility and the OpenAI provider
import { streamText, CoreMessage } from 'ai';
import { openai as vercelOpenAIProvider } from '@ai-sdk/openai'; // Use the provider from the AI SDK

// Get OpenAI API key from environment variables
const openaiApiKey = process.env.OPENAI_API_KEY as string | undefined;

// Initialize OpenAI instance (apiKey will be checked before use)
// We still need the OpenAI client for checks, but will use the Vercel provider for the stream call
let openaiClientCheck: OpenAI | null = null;
try {
  if (openaiApiKey) {
    openaiClientCheck = new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: true
    });
  } else {
    console.warn("OpenAI API key not found in environment variables. OpenAI client not initialized.");
  }
} catch (error) {
  console.error("Failed to initialize OpenAI client:", error);
  openaiClientCheck = null;
}

// Load the FractiVerse prompt from the file
let FRACTIVERSE_PROMPT = 'Default system prompt if file reading fails.';
try {
  const promptFilePath = path.join(process.cwd(), 'src/lib/fractiverse-prompt.txt');
  FRACTIVERSE_PROMPT = fs.readFileSync(promptFilePath, 'utf-8');
} catch (error) {
   console.error("Failed to read fractiverse-prompt.txt:", error);
}


export async function POST(req: NextRequest) {
  // NOTE: Keep initial checks for userId, chatId, message, rate limiting, token balance etc.
  // These should return standard JSON errors *before* attempting the stream.
  let userId: string | null = null;
  let chatId: string | null = null;
  let message: string | null = null;

  try {
    // 1. Parse Request Body & Get userId
    try {
      const body = await req.json();
      message = body.message;
      chatId = body.chatId;
      userId = body.userId;
      if (!message || !chatId || !userId) {
        return NextResponse.json(
          { error: 'Missing required fields (message, chatId, userId)' },
          { status: 400 }
        );
      }
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // --- Rate Limiting ---
    const { success: limitReached } = await rateLimitCheck(userId, 'api');
    if (!limitReached) {
        return NextResponse.json({ error: 'Too many API requests' }, { status: 429 });
    }

    // --- Check User Token Balance ---
    try {
      const { data, error: userError } = await supabaseAdmin
        .from('users')
        .select('token_balance')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      if (!data) {
           console.warn(`User ID ${userId} provided in request not found in database.`);
           return NextResponse.json({ error: 'User specified in request not found' }, { status: 404 });
      }
      if (!data.token_balance || data.token_balance < 1) {
        return NextResponse.json(
          { error: 'Insufficient FractiTokens. You need at least 1 token to send a message.' },
          { status: 400 }
        );
      }
    } catch (dbError) {
      console.error('Error checking user token balance:', dbError);
      return NextResponse.json({ error: 'Failed to verify user token balance' }, { status: 500 });
    }

    // --- Fetch Chat History ---
    let dbMessages: Array<{ role: string; content: string }> = [];
    try {
        const { data, error: messagesError } = await supabaseAdmin
            .from('messages')
            .select('role, content')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });

        if (messagesError) {
            console.warn('Warning: Error fetching chat history:', messagesError);
        } else if (data) {
            // Ensure content is always treated as string for simplicity here
            dbMessages = data.map(msg => ({ 
                role: msg.role as string, 
                content: msg.content as string 
            })); 
        }
    } catch (histError) {
        console.warn('Warning: Exception fetching chat history:', histError);
    }
    
    // --- Check OpenAI Client ---
    if (!openaiClientCheck || !openaiApiKey) {
        console.error('OpenAI client check failed or API key missing. Cannot proceed with API call.')
        const errorMsg = openaiApiKey
            ? 'OpenAI client initialization failed despite API key presence. Check constructor/logs.'
            : 'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.';
        return NextResponse.json(
          { error: errorMsg },
          { status: 500 }
        )
    }

    // --- Prepare Core Messages for Vercel AI SDK ---
    const historyMessages: CoreMessage[] = dbMessages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant') // Filter for valid roles
        .map(msg => ({ 
            role: msg.role as 'user' | 'assistant', // Cast to specific roles
            content: msg.content // Assuming content is always string here
        }));

    const coreMessages: CoreMessage[] = [
        { role: "system", content: FRACTIVERSE_PROMPT },
        ...historyMessages,
        { role: "user", content: message }
    ];

    // --- Call OpenAI API using Vercel AI SDK's streamText ---
    const result = await streamText({
      model: vercelOpenAIProvider('gpt-4o-mini'),
      messages: coreMessages,
      temperature: 0.7,
      maxTokens: 1000,
      // Add onFinish callback to log completion details
      onFinish: async (result) => {
        console.log("\\u001b[32mBackend: Stream finished.\\u001b[0m", {
          finishReason: result.finishReason,
          usage: result.usage,
          // text: result.text // Contains full text if needed
        });

        // Token deduction and message saving logic
        if (result.finishReason === 'stop' || result.finishReason === 'length') {
          try {
            // 1. Deduct 1 token using the use_tokens RPC
            const { data: tokenSuccess, error: tokenError } = await supabaseAdmin.rpc(
              'use_tokens',
              {
                p_user_id: userId!, // Assert non-null as it's checked earlier
                p_amount: 1,       // Deduct 1 token
                p_description: `Chat completion for chat ${chatId}`
              }
            );

            if (tokenError || !tokenSuccess) {
              console.error(`Failed to deduct token for user ${userId}, chat ${chatId}:`, tokenError);
              // Decide if we should proceed with saving message despite token failure
            } else {
               console.log(`\\u001b[34mBackend: Token deducted successfully for user ${userId}.\\u001b[0m`);
            }

            // 2. Save the assistant's message
            const assistantMessage = result.text; // Get the full text response
            const { error: saveError } = await supabaseAdmin
              .from('messages')
              .insert({
                chat_id: chatId!, // Assert non-null
                role: 'assistant',
                content: assistantMessage
              });

            if (saveError) {
              console.error(`Failed to save assistant message for chat ${chatId}:`, saveError);
              // Handle message saving error (e.g., log, notify)
            } else {
                console.log(`\\u001b[34mBackend: Assistant message saved successfully for chat ${chatId}.\\u001b[0m`);
            }

          } catch (finishError) {
            console.error('Error during onFinish processing (token deduction/message save):', finishError);
          }
        } else {
          console.warn(`Stream finished with reason '${result.finishReason}', skipping token deduction and message save.`);
        }
      },
    });

    // --- Return the stream response ---
    return result.toTextStreamResponse();

    /* === COMMENTED OUT - Needs rework for streaming ===
      Token deduction & Message Saving Logic
      MOVED TO onFinish callback
    */

  } catch (error) {
    // --- General Error Handling for non-streaming errors ---
    console.error('Unhandled error in FractiVerse API POST handler (before stream):', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error before streaming';
    return NextResponse.json(
      { error: `Failed to process request: ${errorMessage}` },
      { status: 500 }
    )
  }
} 