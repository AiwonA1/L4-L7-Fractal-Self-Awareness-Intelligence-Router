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
    const debugPrefix = '[/api/fractiverse]';
    console.log(`${debugPrefix} POST request received`);
    
    // Log headers safely by converting to object
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'authorization') { // Don't log auth token
            headers[key] = value;
        } else {
            headers[key] = 'Bearer [REDACTED]';
        }
    });
    console.log(`${debugPrefix} Request headers:`, headers);
    
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

        console.log('[/api/fractiverse] Request body:', {
            messageCount: messages?.length,
            userId,
            chatId
        });

        // Validate required fields
        if (!messages || !userId || !chatId) {
            console.error('[/api/fractiverse] Missing required fields:', { messages, userId, chatId });
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
            console.error('[/api/fractiverse] Invalid message format:', messages);
            return new Response(
                JSON.stringify({ error: 'Invalid message format' }),
                { status: 400 }
            );
        }

        // Verify user access
        console.log(`${debugPrefix} Verifying user access for:`, userId);
        const authToken = getAuthToken(req);
        console.log(`${debugPrefix} Auth token present:`, !!authToken);
        
        const isAuthorized = await verifyUserAccess(req, userId);
        console.log(`${debugPrefix} Authorization result:`, isAuthorized);
        
        if (!isAuthorized) {
            console.error('[/api/fractiverse] Unauthorized access attempt for user:', userId);
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401 }
            );
        }

        // Get auth token and create Supabase client
        const supabase = getSupabaseClient(authToken!);

        // Check token balance
        console.log(`${debugPrefix} Checking token balance for user:`, userId);
        const { data: userData, error: balanceError } = await supabase
            .from('users')
            .select('token_balance')
            .eq('id', userId)
            .single();

        if (balanceError) {
            console.error('[/api/fractiverse] Balance check error:', balanceError);
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
            console.error('[/api/fractiverse] Insufficient token balance for user:', userId);
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
                console.error('[/api/fractiverse] History fetch error:', historyError);
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

            console.log('[/api/fractiverse] Preparing OpenAI request:', {
                messageCount: fullHistory.length,
                lastMessage: messages[messages.length - 1]?.content?.slice(0, 50) + '...'
            });

            // Initialize OpenAI client
            console.log(`${debugPrefix} Initializing OpenAI client`);
            if (!process.env.OPENAI_API_KEY) {
                console.error(`${debugPrefix} OpenAI API key missing`);
                return new Response(
                    JSON.stringify({ error: 'OpenAI API key not configured' }),
                    { status: 500 }
                );
            }

            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });

            // Create chat completion
            console.log(`${debugPrefix} Creating chat completion with message count:`, fullHistory.length);
            console.log(`${debugPrefix} Last user message:`, messages[messages.length - 1]?.content?.slice(0, 100) + '...');
            console.log(`${debugPrefix} Model being used: gpt-4-turbo-preview`);
            
            const completion = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: fullHistory,
                stream: true,
                temperature: 0.7
            });

            console.log(`${debugPrefix} OpenAI stream started`);
            
            let fullContent = '';
            let messageStatus = 'incomplete';
            let chunkCount = 0;

            const stream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of completion) {
                            chunkCount++;
                            if (chunk.choices && chunk.choices[0]?.delta?.content) {
                                const content = chunk.choices[0].delta.content;
                                fullContent += content;
                                
                                if (chunkCount % 10 === 0) {
                                    console.log(`${debugPrefix} Processed ${chunkCount} chunks. Current length: ${fullContent.length}`);
                                }
                                
                                // Wrap chunk in a data event for EventSource compatibility
                                controller.enqueue(`data: ${JSON.stringify({ content })}\n\n`);
                            }
                        }
                        messageStatus = 'complete';
                        controller.enqueue(`data: [DONE]\n\n`);
                        controller.close();

                        console.log(`${debugPrefix} Stream completed. Total chunks:`, chunkCount);
                        console.log(`${debugPrefix} Final message length:`, fullContent.length);

                        // Save assistant message and deduct token
                        const finalMessage = {
                            chat_id: chatId,
                            role: 'assistant',
                            content: fullContent,
                            user_id: userId,
                            status: messageStatus,
                            created_at: new Date().toISOString()
                        };

                        console.log(`${debugPrefix} Saving message to database...`);
                        const { error: insertError } = await supabase
                            .from('messages')
                            .insert(finalMessage);

                        if (insertError) {
                            console.error(`${debugPrefix} Message save error:`, insertError);
                            throw new Error('Failed to save message');
                        }

                        console.log(`${debugPrefix} Deducting token...`);
                        const { error: tokenError } = await supabase
                            .rpc('use_tokens', {
                                p_user_id: userId,
                                p_amount: 1,
                                p_description: 'Chat completion'
                            });

                        if (tokenError) {
                            console.error(`${debugPrefix} Token deduction error:`, tokenError);
                            throw new Error('Failed to deduct token');
                        }

                        console.log(`${debugPrefix} Message saved and token deducted successfully`);
                    } catch (error) {
                        console.error(`${debugPrefix} Stream processing error:`, error);
                        if (messageStatus === 'incomplete') {
                            console.log(`${debugPrefix} Cleaning up incomplete message...`);
                            await cleanup(userId, chatId);
                        }
                        controller.error(error);
                    }
                },
                cancel() {
                    console.log(`${debugPrefix} Stream cancelled by client. Cleaning up...`);
                    cleanup(userId, chatId).catch(error => 
                        console.error(`${debugPrefix} Cleanup error:`, error)
                    );
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
            console.error(`${debugPrefix} Request processing error:`, error);
            return new Response(
                createErrorStream(error instanceof Error ? error : new Error('Unknown error')),
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
        console.error(`${debugPrefix} Top-level error:`, error);
        const status = error.message === 'Insufficient token balance' ? 402 : 500;
        return new Response(
            createErrorStream(error instanceof Error ? error : new Error('Unknown error')),
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