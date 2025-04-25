import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createClient, User } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { ReadableStream } from 'stream/web'

// Mock user data
const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
}

// Mock chat data
const mockChatHistory = [
    { role: 'user', content: 'Previous question', chat_id: 'test-chat-id', user_id: mockUser.id },
    { role: 'assistant', content: 'Previous answer', chat_id: 'test-chat-id', user_id: mockUser.id }
];

// Mock query builder with improved type safety
const createMockQueryBuilder = () => {
    const builder = {
        data: null as any,
        error: null as Error | null,
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockImplementation((data) => Promise.resolve({ data, error: null })),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => Promise.resolve({ data: builder.data, error: builder.error })),
        order: vi.fn().mockReturnThis(),
        setData: (data: any) => {
            builder.data = data;
            builder.error = null;
            return builder;
        },
        setError: (error: Error) => {
            builder.data = null;
            builder.error = error;
            return builder;
        }
    };
    return builder;
};

// Mock Supabase client with auth focus
const mockQueryBuilder = createMockQueryBuilder();
const mockSupabaseClient = {
    from: vi.fn().mockReturnValue(mockQueryBuilder),
    auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        setSession: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null })
    },
    rpc: vi.fn().mockImplementation((name: string) => {
        if (name === 'use_tokens') {
            return Promise.resolve({ data: { tokens_used: 1 }, error: null });
        }
        return Promise.resolve({ data: null, error: null });
    })
};

// Mock OpenAI with simplified streaming
const mockOpenAIStream = (content: string) => new ReadableStream({
    start(controller) {
        controller.enqueue({ choices: [{ delta: { content }, finish_reason: null }] });
        controller.enqueue({ choices: [{ delta: {}, finish_reason: 'stop' }] });
        controller.close();
    }
});

vi.mock('openai', () => ({
    default: vi.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: vi.fn().mockImplementation(() => ({
                    body: mockOpenAIStream('Test response')
                }))
            }
        }
    }))
}));

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn().mockImplementation(() => mockSupabaseClient)
}));

describe('Authentication Flow', () => {
    let POST: (req: NextRequest) => Promise<Response>;
    
    beforeEach(async () => {
        vi.resetModules();
        vi.clearAllMocks();
        process.env.OPENAI_API_KEY = 'test-key';
        const routeModule = await import('../route');
        POST = routeModule.POST;
    });

    describe('Session Validation', () => {
        it('should reject requests without auth token', async () => {
            const request = new NextRequest('http://localhost/api/fractiverse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const response = await POST(request);
            expect(response.status).toBe(401);
            expect(await response.json()).toEqual({ error: 'Unauthorized' });
        });

        it('should reject expired sessions', async () => {
            mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
                data: { user: null },
                error: new Error('Token expired')
            });

            const request = new NextRequest('http://localhost/api/fractiverse', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer expired-token',
                    'Content-Type': 'application/json'
                }
            });

            const response = await POST(request);
            expect(response.status).toBe(401);
        });

        it('should validate user ID matches session user', async () => {
            const request = new NextRequest('http://localhost/api/fractiverse', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer valid-token',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'Hello' }],
                    userId: 'different-user-id',
                    chatId: 'test-chat-id'
                })
            });

            const response = await POST(request);
            expect(response.status).toBe(401);
        });
    });

    describe('Token Management', () => {
        it('should check token balance before processing request', async () => {
            mockQueryBuilder.setData({ token_balance: 100 });
            
            const request = new NextRequest('http://localhost/api/fractiverse', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer valid-token',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'Hello' }],
                    userId: mockUser.id,
                    chatId: 'test-chat-id'
                })
            });

            await POST(request);
            expect(mockQueryBuilder.select).toHaveBeenCalled();
            expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('use_tokens', expect.any(Object));
        });

        it('should reject requests with insufficient tokens', async () => {
            mockQueryBuilder.setData({ token_balance: 0 });

            const request = new NextRequest('http://localhost/api/fractiverse', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer valid-token',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'Hello' }],
                    userId: mockUser.id,
                    chatId: 'test-chat-id'
                })
            });

            const response = await POST(request);
            expect(response.status).toBe(402);
        });
    });
});

describe('Chat Operations', () => {
    let POST: (req: NextRequest) => Promise<Response>;
    
    beforeEach(async () => {
        vi.resetModules();
        vi.clearAllMocks();
        process.env.OPENAI_API_KEY = 'test-key';
        mockQueryBuilder.setData({ token_balance: 100 });
        const routeModule = await import('../route');
        POST = routeModule.POST;
    });

    describe('Message Handling', () => {
        it('should process new messages with chat history', async () => {
            // Set up chat history
            mockQueryBuilder.setData(mockChatHistory);

            const request = new NextRequest('http://localhost/api/fractiverse', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer valid-token',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'Follow-up question' }],
                    userId: mockUser.id,
                    chatId: 'test-chat-id'
                })
            });

            const response = await POST(request);
            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(ReadableStream);
            
            // Verify history was queried and message was saved
            expect(mockQueryBuilder.select).toHaveBeenCalled();
            expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    chat_id: 'test-chat-id',
                    user_id: mockUser.id
                })
            );
        });

        it('should handle message validation', async () => {
            const request = new NextRequest('http://localhost/api/fractiverse', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer valid-token',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [{ invalid: 'format' }],
                    userId: mockUser.id,
                    chatId: 'test-chat-id'
                })
            });

            const response = await POST(request);
            expect(response.status).toBe(400);
            expect(await response.json()).toEqual({ error: 'Invalid message format' });
        });

        it('should handle database errors gracefully', async () => {
            mockQueryBuilder.setError(new Error('Database error'));

            const request = new NextRequest('http://localhost/api/fractiverse', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer valid-token',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'Hello' }],
                    userId: mockUser.id,
                    chatId: 'test-chat-id'
                })
            });

            const response = await POST(request);
            expect(response.status).toBe(500);
        });
    });

    describe('Chat History', () => {
        it('should properly merge chat history with new messages', async () => {
            mockQueryBuilder.setData(mockChatHistory);
            
            const request = new NextRequest('http://localhost/api/fractiverse', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer valid-token',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'New question' }],
                    userId: mockUser.id,
                    chatId: 'test-chat-id'
                })
            });

            await POST(request);
            
            // Verify OpenAI was called with combined history
            const openai = (await import('openai')).default;
            expect(openai).toHaveBeenCalled();
            expect(mockQueryBuilder.select).toHaveBeenCalled();
            expect(mockQueryBuilder.order).toHaveBeenCalled();
        });
    });
}); 