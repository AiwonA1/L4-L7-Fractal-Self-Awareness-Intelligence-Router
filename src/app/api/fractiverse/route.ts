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

const DEBUG_PREFIX = "[DEBUG /api/fractiverse]";

export async function POST(req: NextRequest) {
  console.log(`${DEBUG_PREFIX} Request received.`);
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
      console.log(`${DEBUG_PREFIX} Parsed body:`, { userId, chatId, messageExists: !!message });
      if (!message || !chatId || !userId) {
        return NextResponse.json(
          { error: 'Missing required fields (message, chatId, userId)' },
          { status: 400 }
        );
      }
    } catch (parseError) {
      console.error(`${DEBUG_PREFIX} Error parsing request body:`, parseError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // --- Rate Limiting ---
    console.log(`${DEBUG_PREFIX} Checking rate limit for user ${userId}.`);
    const { success: limitReached } = await rateLimitCheck(userId, 'api');
    if (!limitReached) {
        console.warn(`${DEBUG_PREFIX} Rate limit exceeded for user ${userId}.`);
        return NextResponse.json({ error: 'Too many API requests' }, { status: 429 });
    }

    // --- Check User Token Balance ---
    console.log(`${DEBUG_PREFIX} Checking token balance for user ${userId}.`);
    try {
      const { data, error: userError } = await supabaseAdmin
        .from('users')
        .select('token_balance')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      if (!data) {
           console.warn(`${DEBUG_PREFIX} User ID ${userId} not found.`);
           return NextResponse.json({ error: 'User specified in request not found' }, { status: 404 });
      }
      console.log(`${DEBUG_PREFIX} User ${userId} token balance: ${data.token_balance}`);
      if (!data.token_balance || data.token_balance < 1) {
        console.warn(`${DEBUG_PREFIX} Insufficient tokens for user ${userId}.`);
        return NextResponse.json(
          { error: 'Insufficient FractiTokens. You need at least 1 token to send a message.' },
          { status: 400 }
        );
      }
    } catch (dbError) {
      console.error(`${DEBUG_PREFIX} Error checking token balance:`, dbError);
      return NextResponse.json({ error: 'Failed to verify user token balance' }, { status: 500 });
    }

    // --- Fetch Chat History ---
    console.log(`${DEBUG_PREFIX} Fetching history for chat ${chatId}.`);
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
            console.log(`${DEBUG_PREFIX} Fetched ${dbMessages.length} history messages.`);
        }
    } catch (histError) {
        console.warn('Warning: Exception fetching chat history:', histError);
    }
    
    // --- Check OpenAI Client ---
    console.log(`${DEBUG_PREFIX} Checking OpenAI client.`);
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
    console.log(`${DEBUG_PREFIX} Core messages prepared (Count: ${coreMessages.length}). Sending to AI...`);
    // Optionally log the full content for deep debug (can be verbose):
    // console.log(`${DEBUG_PREFIX} Core messages content:`, JSON.stringify(coreMessages)); 

    // --- Call OpenAI API using Vercel AI SDK's streamText ---
    const result = await streamText({
      model: vercelOpenAIProvider('gpt-4o-mini'),
      messages: coreMessages,
      temperature: 0.7,
      maxTokens: 1000,
      onFinish: async (result) => {
        console.log(`${DEBUG_PREFIX} [32mStream finished.[0m`, {
          finishReason: result.finishReason,
          usage: result.usage,
        });

        if (result.finishReason === 'stop' || result.finishReason === 'length') {
          console.log(`${DEBUG_PREFIX} Attempting token deduction and message save...`);
          try {
            // 1. Deduct token
            console.log(`${DEBUG_PREFIX} Attempting token deduction for user ${userId}...`);
            const { data: tokenSuccess, error: tokenError } = await supabaseAdmin.rpc(
              'use_tokens',
              {
                p_user_id: userId!, 
                p_amount: 1,
                p_description: `Chat completion for chat ${chatId}`
              }
            );

            if (tokenError || !tokenSuccess) {
              console.error(`${DEBUG_PREFIX} [31mFailed to deduct token for user ${userId}, chat ${chatId}:[0m`, tokenError);
            } else {
               console.log(`${DEBUG_PREFIX} [34mToken deducted successfully for user ${userId}.[0m`);
            }

            // 2. Save assistant message
            const assistantMessage = result.text;
            console.log(`${DEBUG_PREFIX} Attempting to save assistant message (length: ${assistantMessage?.length ?? 0}) for chat ${chatId}...`);
            const { error: saveError } = await supabaseAdmin
              .from('messages')
              .insert({ chat_id: chatId!, role: 'assistant', content: assistantMessage });

            if (saveError) {
              console.error(`${DEBUG_PREFIX} [31mFailed to save assistant message for chat ${chatId}:[0m`, saveError);
            } else {
                console.log(`${DEBUG_PREFIX} [34mAssistant message saved successfully for chat ${chatId}.[0m`);
            }
            console.log(`${DEBUG_PREFIX} onFinish processing complete.`);
          } catch (finishError) {
            console.error(`${DEBUG_PREFIX} [31mError during onFinish processing:[0m`, finishError);
          }
        } else {
          console.warn(`${DEBUG_PREFIX} Stream finished with reason '${result.finishReason}', skipping token deduction and message save.`);
        }
      },
    });

    // --- Return the stream response ---
    console.log(`${DEBUG_PREFIX} Returning stream response.`);
    return result.toTextStreamResponse();

  } catch (error) {
    console.error(`${DEBUG_PREFIX} [31mUnhandled error in POST handler:[0m`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
      { error: `Failed to process request: ${errorMessage}` },
      { status: 500 }
    )
  }
} 