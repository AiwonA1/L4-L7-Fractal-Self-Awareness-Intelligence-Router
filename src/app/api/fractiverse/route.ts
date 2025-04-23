import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const DEBUG_PREFIX = '[/api/fractiverse]';

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Error response helper
const errorResponse = (message: string, status: number = 500, error?: Error | unknown) => {
  console.error(`${DEBUG_PREFIX} ${message}`, error ? error : '');
  return NextResponse.json({ error: message }, { status });
};

// Verify user session and token balance
async function verifyUserAccess(userId: string) {
  // Check session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  // Check token balance
  const { data: user } = await supabase
    .from('users')
    .select('fracti_token_balance')
    .eq('id', userId)
    .single();

  if (!user || user.fracti_token_balance < 1) {
    throw new Error('Insufficient token balance');
  }

  return true;
}

export async function POST(req: Request) {
  console.log(`${DEBUG_PREFIX} POST request received`);
  
  try {
    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return errorResponse('OpenAI API key is not configured');
    }

    // Parse request
    const { messages, userId, chatId } = await req.json();
    
    // Validate required fields
    if (!messages || !userId || !chatId) {
      return errorResponse('Missing required fields', 400);
    }

    // Validate message format
    if (!Array.isArray(messages) || !messages.every(msg => 
      msg && typeof msg === 'object' && 
      typeof msg.role === 'string' && 
      ['user', 'assistant', 'system'].includes(msg.role) && 
      typeof msg.content === 'string'
    )) {
      return errorResponse('Invalid message format', 400);
    }

    // Verify user access
    try {
      await verifyUserAccess(userId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Access verification failed';
      let statusCode = 500;
      if (error instanceof Error) {
        if (error.message === 'Unauthorized') {
          statusCode = 401;
        } else if (error.message === 'Insufficient token balance') {
          statusCode = 402;
        }
      }
      return errorResponse(errorMessage, statusCode);
    }

    // --- Fetch Chat History ---
    let historyMessages: any[] = [];
    try {
      const { data: fetchedMessages, error: historyError } = await supabase
        .from('messages')
        .select('role, content') // Select only necessary fields
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (historyError) {
        throw historyError;
      }
      historyMessages = fetchedMessages || [];
    } catch (error) {
      return errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch chat history',
        500,
        error
      );
    }
    // --- End Fetch Chat History ---

    // Combine history with new messages
    const combinedMessages = [
      ...historyMessages.map(({ role, content }) => ({ role, content })), 
      ...messages // Assuming messages from request are already {role, content}
    ];

    // Prepare messages for OpenAI (use combined messages)
    const coreMessages = combinedMessages.map(({ role, content }: any) => ({
      role,
      content,
    }));

    try {
      // Initialize OpenAI client (moved here to catch initialization errors)
      let openaiClient: OpenAI;
      try {
        openaiClient = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY!,
        });
      } catch (error) {
        return errorResponse(
          error instanceof Error ? error.message : 'OpenAI initialization failed',
          500
        );
      }

      // Create chat completion with streaming
      let response;
      try {
        response = await openaiClient.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: coreMessages,
          stream: true,
          temperature: 0.7,
        });
      } catch (error) {
        return errorResponse(
          error instanceof Error ? error.message : 'OpenAI API Error',
          500
        );
      }

      let fullContent = '';
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of response) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                controller.enqueue(new TextEncoder().encode(content));
              }
            }

            // After stream completes, save message and deduct token in parallel
            try {
              await Promise.all([
                // Save message
                supabase
                  .from('messages')
                  .insert({
                    chat_id: chatId,
                    role: 'assistant',
                    content: fullContent,
                    user_id: userId
                  }),
                
                // Deduct token
                supabase.rpc('use_tokens', {
                  p_user_id: userId,
                  p_amount: 1
                })
              ]);
              controller.close();
            } catch (error) {
              console.error(`${DEBUG_PREFIX} Error in post-processing:`, error);
              controller.error(error);
            }
          } catch (error) {
            console.error(`${DEBUG_PREFIX} Error in stream processing:`, error);
            controller.error(error);
          }
        }
      });

      return new Response(stream);
    } catch (error) {
      return errorResponse(
        error instanceof Error ? error.message : 'Error processing request',
        500
      );
    }
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Error processing request',
      500
    );
  }
}