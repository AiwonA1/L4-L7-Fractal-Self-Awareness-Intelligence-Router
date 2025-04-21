import { NextResponse, NextRequest } from 'next/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase/supabase-admin'
import fs from 'fs'
import path from 'path'
import { rateLimitCheck } from '@/lib/rate-limit'

// Initialize OpenAI instance (apiKey will be checked before use)
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      // dangerouslyAllowBrowser: true // REMOVED: Unsafe for backend code
    });
  } else {
    // Added explicit warning if key is missing during initialization
    console.warn("OpenAI API key not found in environment variables. OpenAI client not initialized.");
  }
} catch (error) {
  console.error("Failed to initialize OpenAI client:", error);
  openai = null;
}

// Load the FractiVerse prompt from the file
let FRACTIVERSE_PROMPT = 'Default system prompt if file reading fails.';
try {
  const promptFilePath = path.join(process.cwd(), 'src/lib/fractiverse-prompt.txt');
  FRACTIVERSE_PROMPT = fs.readFileSync(promptFilePath, 'utf-8');
} catch (error) {
   console.error("Failed to read fractiverse-prompt.txt:", error);
   // Keep the default prompt
}


export async function POST(req: NextRequest) {
  let userId: string | null = null;
  let chatId: string | null = null;
  let message: string | null = null;
  let tokensToDeduct: number = 10; // Default minimum
  let tokenResponse: Response | undefined = undefined;

  try {
    // 1. Parse Request Body & Get userId (Moved up)
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

    // --- Rate Limiting (Authenticated User via userId in body) (Moved up) ---
    const { success: limitReached } = await rateLimitCheck(userId, 'api'); // userId is guaranteed non-null here
    if (!limitReached) {
        return NextResponse.json({ error: 'Too many API requests' }, { status: 429 });
    }
    // --- End Rate Limiting ---

    // 2. Check User Token Balance (Moved up)
    let userData;
    try {
      const { data, error: userError } = await supabaseAdmin
        .from('users')
        .select('token_balance')
        .eq('id', userId) // userId is guaranteed non-null here
        .single();

      if (userError) throw userError; // Propagate error to outer catch
      if (!data) {
           // Handle case where userId from request body doesn't exist in DB
           console.warn(`User ID ${userId} provided in request not found in database.`);
           return NextResponse.json({ error: 'User specified in request not found' }, { status: 404 });
      }
      userData = data;

      if (userData.token_balance < 10) {
        return NextResponse.json(
          { error: 'Insufficient tokens. Minimum 10 tokens required.' },
          { status: 400 }
        );
      }
    } catch (dbError) {
      console.error('Error checking user token balance:', dbError);
      // Distinguish DB error from user not found or insufficient tokens
      return NextResponse.json({ error: 'Failed to verify user token balance' }, { status: 500 });
    }

    // 3. Fetch Chat History (Remains here - happens before OpenAI call)
    let formattedMessages: Array<{role: string, content: string}> = [];
    try {
      const { data: messages, error: messagesError } = await supabaseAdmin
        .from('messages')
        .select('role, content') // Select only needed fields
        .eq('chat_id', chatId) // chatId is guaranteed non-null here
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.warn('Warning: Error fetching chat history:', messagesError);
      } else if (messages) {
        formattedMessages = messages.map(msg => ({ 
          role: msg.role as string, // Assume role is string
          content: msg.content as string // Assume content is string
        })); 
      }
    } catch (histError) {
       console.warn('Warning: Exception fetching chat history:', histError);
    }

    // Check if OpenAI client initialized successfully (Moved down - check just before use)
    if (!openai || !openai.apiKey) {
        console.error('OpenAI client not initialized or API key missing. Cannot proceed with API call.')
        // Check OPENAI_API_KEY env var existence for a more specific error message
        const errorMsg = process.env.OPENAI_API_KEY
            ? 'OpenAI client initialization failed despite API key presence. Check constructor/logs.'
            : 'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.';
        return NextResponse.json(
          { error: errorMsg },
          { status: 500 }
        )
    }

    // 4. Call OpenAI API (Remains here)
    let completion;
    let promptTokens = 0;
    let completionTokens = 0;
    let totalTokens = 0;
    try {
      const apiMessages = [
        { role: "system", content: FRACTIVERSE_PROMPT },
        ...formattedMessages,
        { role: "user", content: message }
      ];

      completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: apiMessages as OpenAI.Chat.ChatCompletionMessageParam[],
        temperature: 0.7,
        max_tokens: 1000,
      });

      if (!completion?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response structure from OpenAI');
      }

      promptTokens = completion.usage?.prompt_tokens || 0;
      completionTokens = completion.usage?.completion_tokens || 0;
      totalTokens = promptTokens + completionTokens;
      tokensToDeduct = Math.max(10, totalTokens);

    } catch (openaiError) {
      console.error('Error calling OpenAI API:', openaiError);
      const errorMessage = openaiError instanceof Error ? openaiError.message : 'Unknown OpenAI error';
      return NextResponse.json(
        { error: `OpenAI API request failed: ${errorMessage}` },
        { status: 502 } // Use 502 Bad Gateway for upstream errors
      );
    }
    
    // 5. Deduct Tokens
    let tokenDeductionSuccess = false;
    try {
      tokenResponse = await fetch(new URL('/api/tokens/use', req.url).href, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount: tokensToDeduct, description: `ChatID: ${chatId} - OpenAI API call` }),
      });

      if (tokenResponse.ok) {
        tokenDeductionSuccess = true;
      } else {
        let tokenErrorBody = { error: 'Unknown deduction error' };
        try { tokenErrorBody = await tokenResponse.json(); } catch { /* ignore parsing error */ }
        console.error('Error deducting tokens:', { status: tokenResponse.status, body: tokenErrorBody });
        // CRITICAL: Failed to deduct tokens after successful OpenAI call.
        // Return an error to the user instead of proceeding.
        return NextResponse.json(
          { 
            error: `AI response generated, but failed to deduct tokens: ${tokenErrorBody.error}. Please contact support.`,
            // Optionally include AI response here if needed for retry/support
            // generatedContent: completion.choices[0].message.content 
          },
          // Use 500 or a more specific code like 402 Payment Required or 409 Conflict
          { status: 500 } 
        );
      }
    } catch (fetchError) {
        console.error(`CRITICAL: Exception during token deduction fetch for user ${userId}:`, fetchError);
        // Return an error to the user instead of proceeding.
        return NextResponse.json(
          { error: 'AI response generated, but encountered an error during token deduction. Please contact support.' },
          { status: 500 }
        );
    }

    // Ensure deduction succeeded before proceeding (redundant check, but safe)
    if (!tokenDeductionSuccess) {
        // This should ideally not be reached due to returns above, but acts as a failsafe
        console.error(`CRITICAL: Token deduction flag was false after fetch block for user ${userId}.`);
        return NextResponse.json(
          { error: 'Internal server error during token processing finalization.' },
          { status: 500 }
        );
    }

    // 6. Store Messages (Optional, proceed even if it fails)
    try {
      const assistantContent = completion.choices[0].message.content;
      const { error: insertError } = await supabaseAdmin
        .from('messages')
        .insert([
          { chat_id: chatId, user_id: userId, role: 'user', content: message },
          { chat_id: chatId, user_id: userId, role: 'assistant', content: assistantContent }
        ]);

      if (insertError) {
        console.warn('Warning: Error storing messages:', insertError);
      }
    } catch (storeError) {
       console.warn('Warning: Exception storing messages:', storeError);
    }

    // 7. Return Success Response
    return NextResponse.json({
      role: 'assistant',
      content: completion.choices[0].message.content,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens,
        tokensDeducted: tokensToDeduct
      }
    });

  } catch (error) {
    // General catch block for unexpected errors not caught above
    console.error('Unhandled error in FractiVerse API POST handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to process request due to unexpected server error: ${errorMessage}` },
      { status: 500 }
    )
  }
} 