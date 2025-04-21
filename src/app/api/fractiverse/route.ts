import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/app/lib/supabase/supabase-admin'
import fs from 'fs'
import path from 'path'

// Initialize OpenAI instance (apiKey will be checked before use)
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Allow in test environment
    });
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


export async function POST(req: Request) {
  // Check if OpenAI client initialized successfully
  if (!openai) {
    console.error('OpenAI client not initialized. Check API Key and constructor.')
    return NextResponse.json(
      { error: 'OpenAI client initialization failed. Please check server logs.' },
      { status: 500 }
    )
  }
  // Double-check the key just in case (belt and suspenders)
  if (!openai.apiKey) {
     console.error('OpenAI API key is not configured even after initialization attempt.')
    return NextResponse.json(
      { error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.' },
      { status: 500 }
    )
  }

  let userId: string | null = null;
  let chatId: string | null = null;
  let message: string | null = null;
  let tokensToDeduct: number = 10; // Default minimum
  let tokenResponse: Response | undefined = undefined;

  try {
    // 1. Parse Request Body
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

    // 2. Check User Token Balance
    let userData;
    try {
      const { data, error: userError } = await supabaseAdmin
        .from('users')
        .select('token_balance')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      if (!data) throw new Error('User not found');
      userData = data;

      if (userData.token_balance < 10) {
        return NextResponse.json(
          { error: 'Insufficient tokens. Minimum 10 tokens required.' },
          { status: 400 }
        );
      }
    } catch (dbError) {
      console.error('Error checking user token balance:', dbError);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    // 3. Fetch Chat History (Optional, proceed even if it fails)
    let formattedMessages: Array<{role: string, content: string}> = [];
    try {
      const { data: messages, error: messagesError } = await supabaseAdmin
        .from('messages')
        .select('role, content') // Select only needed fields
        .eq('chat_id', chatId)
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

    // 4. Call OpenAI API
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
    try {
      tokenResponse = await fetch(new URL('/api/tokens/use', req.url).href, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount: tokensToDeduct, description: `ChatID: ${chatId} - OpenAI API call` }),
      });
      
      if (!tokenResponse.ok) {
        let tokenErrorBody = {};
        try { tokenErrorBody = await tokenResponse.json(); } catch { /* ignore parsing error */ }
        console.error('Error deducting tokens:', { status: tokenResponse.status, body: tokenErrorBody });
        // Do NOT return error here; proceed to store message & return response
        // Log it as a critical failure for monitoring
        console.error(`CRITICAL: Failed to deduct ${tokensToDeduct} tokens for user ${userId} after successful OpenAI call.`);
      }
    } catch (fetchError) {
        console.error(`CRITICAL: Exception during token deduction fetch for user ${userId}:`, fetchError);
         // Do NOT return error here either.
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