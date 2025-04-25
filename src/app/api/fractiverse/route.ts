import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import keys from '../../../../config/keys.json';

// Helper function to get auth token from request
function getAuthToken(req: Request): string | null {
    // Try Authorization header first
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    // Try cookie fallback
    const cookies = req.headers.get('Cookie');
    if (cookies) {
        const tokenMatch = cookies.match(/sb-access-token=([^;]+)/);
        if (tokenMatch) {
            return tokenMatch[1];
        }
    }

    return null;
}

// Helper function to create Supabase client
function getSupabaseClient(authToken?: string) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    if (authToken) {
        supabase.auth.setSession({ 
            access_token: authToken, 
            refresh_token: '' 
        });
    }
    return supabase;
}

// Helper function to verify user access
async function verifyUserAccess(req: Request, userId: string): Promise<boolean> {
    try {
        const authToken = getAuthToken(req);
        if (!authToken) {
            return false;
        }

        const supabase = getSupabaseClient(authToken);
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user || user.id !== userId) {
            console.error('[/api/fractiverse] Auth verification failed:', error || 'User ID mismatch');
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('[/api/fractiverse] Auth error:', error);
        return false;
    }
}

// Add new helper for stream error handling
function createErrorStream(error: Error): ReadableStream {
    return new ReadableStream({
        start(controller) {
            const errorMessage = JSON.stringify({ error: error.message });
            controller.enqueue(new TextEncoder().encode(errorMessage));
            controller.close();
        }
    });
}

export async function POST(req: NextRequest) {
    const cleanup = async (userId: string, chatId: string) => {
        try {
            const supabase = getSupabaseClient(getAuthToken(req)!);
            await supabase
                .from('messages')
                .delete()
                .match({
                    chat_id: chatId,
                    user_id: userId,
                    status: 'incomplete'
                });
        } catch (error) {
            console.error('[/api/fractiverse] Cleanup error:', error);
        }
    };

    try {
        // Parse request body
        const body = await req.json();
        const { messages, userId, chatId } = body;

        // Validate required fields
        if (!messages || !userId || !chatId) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400 }
            );
        }

        // Validate message format
        if (!Array.isArray(messages) || !messages.every(msg => 
            typeof msg === 'object' && 
            msg !== null && 
            'role' in msg && 
            'content' in msg
        )) {
            return new Response(
                JSON.stringify({ error: 'Invalid message format' }),
                { status: 400 }
            );
        }

        // Verify user access
        const isAuthorized = await verifyUserAccess(req, userId);
        if (!isAuthorized) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401 }
            );
        }

        // Get auth token and create Supabase client
        const authToken = getAuthToken(req);
        const supabase = getSupabaseClient(authToken!);

        // Check token balance
        const { data: userData, error: balanceError } = await supabase
            .from('users')
            .select('token_balance')
            .eq('id', userId)
            .single();

        if (balanceError) {
            return new Response(
                JSON.stringify({ error: 'Database error checking token balance' }),
                { 
                    status: 500,
                    headers: {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive'
                    }
                }
            );
        }

        if (!userData || userData.token_balance < 1) {
            return new Response(
                JSON.stringify({ error: 'Insufficient token balance' }),
                { 
                    status: 402,
                    headers: {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive'
                    }
                }
            );
        }

        // Fetch chat history
        try {
            const { data: historyData, error: historyError } = await supabase
                .from('messages')
                .select('*')
                .eq('chat_id', chatId)
                .order('created_at', { ascending: true });

            if (historyError) {
                throw new Error('Failed to fetch history');
            }

            // Prepend history to messages
            const fullHistory = [
                {
                    role: 'system',
                    content: keys['test@example.com'].key
                },
                ...(historyData || []).map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                ...messages
            ];

            // Initialize OpenAI client
            if (!process.env.OPENAI_API_KEY) {
                return new Response(
                    JSON.stringify({ error: 'OpenAI API key missing' }),
                    { status: 500 }
                );
            }

            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });

            // Create chat completion
            const completion = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: fullHistory,
                stream: true,
                temperature: 0.7
            });

            let fullContent = '';
            let messageStatus = 'incomplete';

            const stream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of completion) {
                            if (chunk.choices && chunk.choices[0]?.delta?.content) {
                                const content = chunk.choices[0].delta.content;
                                fullContent += content;
                                
                                // Wrap chunk in a data event for EventSource compatibility
                                controller.enqueue(`data: ${JSON.stringify({ content })}\n\n`);
                            }
                        }
                        messageStatus = 'complete';
                        controller.enqueue(`data: [DONE]\n\n`);
                        controller.close();

                        // Save assistant message and deduct token
                        const finalMessage = {
                            chat_id: chatId,
                            role: 'assistant',
                            content: fullContent,
                            user_id: userId,
                            status: messageStatus,
                            created_at: new Date().toISOString()
                        };

                        const { error: insertError } = await supabase
                            .from('messages')
                            .insert(finalMessage);

                        if (insertError) {
                            throw new Error('Failed to save message');
                        }

                        const { error: tokenError } = await supabase
                            .rpc('use_tokens', {
                                p_user_id: userId,
                                p_amount: 1,
                                p_description: 'Chat completion'
                            });

                        if (tokenError) {
                            throw new Error('Failed to deduct token');
                        }
                    } catch (error) {
                        console.error('[/api/fractiverse] Streaming error:', error);
                        if (messageStatus === 'incomplete') {
                            await cleanup(userId, chatId);
                        }
                        try {
                             // Explicitly try to enqueue the error message
                             controller.enqueue(`data: ${JSON.stringify({ error: 'Error processing stream' })}\n\n`);
                        } catch (enqueueError) {
                             console.error("Failed to enqueue error message:", enqueueError);
                        } finally {
                             // Always try to close the controller
                             try { controller.close(); } catch (closeError) { /* Ignore */ }
                        }
                    }
                },
                cancel() {
                    // Handle client disconnection
                    cleanup(userId, chatId).catch(console.error);
                }
            });

            return new Response(stream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache, no-transform',
                    'Connection': 'keep-alive',
                    'X-Accel-Buffering': 'no',
                    'Transfer-Encoding': 'chunked'
                }
            });
        } catch (error) {
            console.error('[/api/fractiverse] Error:', error);
            return new Response(
                `data: ${JSON.stringify({ error: 'OpenAI API error' })}\n\n`,
                { 
                    status: 500,
                    headers: {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache, no-transform',
                        'Connection': 'keep-alive',
                        'X-Accel-Buffering': 'no'
                    }
                }
            );
        }

    } catch (error: any) {
        console.error('[/api/fractiverse] Request processing error:', error);
        const status = error.message === 'Insufficient token balance' ? 402 : 500;
        return new Response(
            createErrorStream(error).pipeThrough(new TextEncoderStream()),
            {
                status,
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache'
                }
            }
        );
    }
}