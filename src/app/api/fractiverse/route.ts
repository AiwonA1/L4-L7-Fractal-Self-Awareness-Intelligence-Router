import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

const DEBUG_PREFIX = '[/api/fractiverse]';

// Initialize OpenAI Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  console.log(`${DEBUG_PREFIX} POST request received`);
  
  try {
    const { messages, userId, chatId } = await req.json();
    console.log(`${DEBUG_PREFIX} Request parsed:`, { userId, chatId });

    // Check session
    console.log(`${DEBUG_PREFIX} Checking session`);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error(`${DEBUG_PREFIX} No session found`);
      return new Response('Unauthorized', { status: 401 });
    }

    // Verify token balance
    console.log(`${DEBUG_PREFIX} Verifying token balance`);
    const { data: user } = await supabase
      .from('users')
      .select('fracti_token_balance')
      .eq('id', userId)
      .single();

    if (!user || user.fracti_token_balance < 1) {
      console.error(`${DEBUG_PREFIX} Insufficient token balance`);
      return new Response('Insufficient token balance', { status: 402 });
    }

    // Prepare messages for OpenAI
    console.log(`${DEBUG_PREFIX} Preparing messages for OpenAI`);
    const coreMessages = messages.map(({ role, content }: any) => ({
      role,
      content,
    }));
    console.log(`${DEBUG_PREFIX} Core messages prepared:`, coreMessages);

    // Create chat completion with streaming
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: coreMessages,
      stream: true,
      temperature: 0.7,
    });

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

          // After stream completes, save message and deduct token
          console.log(`${DEBUG_PREFIX} Stream completed, saving message`);
          const { error: messageError } = await supabase
            .from('messages')
            .insert({
              chat_id: chatId,
              role: 'assistant',
              content: fullContent,
              user_id: userId
            });

          if (messageError) {
            console.error(`${DEBUG_PREFIX} Error saving message:`, messageError);
          }

          console.log(`${DEBUG_PREFIX} Deducting tokens`);
          const { error: tokenError } = await supabase.rpc('use_tokens', {
            p_user_id: userId,
            p_amount: 1
          });

          if (tokenError) {
            console.error(`${DEBUG_PREFIX} Error deducting tokens:`, tokenError);
          }

          controller.close();
        } catch (error) {
          console.error(`${DEBUG_PREFIX} Error in stream processing:`, error);
          controller.error(error);
        }
      }
    });

    // Return streaming response
    return new Response(stream);
  } catch (error) {
    console.error(`${DEBUG_PREFIX} Error in POST handler:`, error);
    return new Response('Error processing request', { status: 500 });
  }
}