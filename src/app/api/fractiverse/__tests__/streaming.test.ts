import { vi, describe, it, expect, beforeEach, type SpyInstance } from 'vitest';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Mock } from 'vitest';
import OpenAI from 'openai';

// Mock user data
const mockUser = {
    id: 'test-user-id',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
};

interface QueryBuilder {
    select: Mock;
    eq: Mock;
    single: Mock;
    insert: Mock;
    _mockResult: any;
    mockReturnData: (data: any) => QueryBuilder;
}

function createQueryBuilder(initialData: any = null): QueryBuilder {
    const builder = {
        _mockResult: { data: initialData, error: null },
        select: vi.fn().mockImplementation(function(this: QueryBuilder) { return this; }),
        eq: vi.fn().mockImplementation(function(this: QueryBuilder) { return this; }),
        single: vi.fn().mockImplementation(function(this: QueryBuilder) {
            return Promise.resolve(this._mockResult);
        }),
        insert: vi.fn().mockImplementation(function(this: QueryBuilder) {
            return Promise.resolve(this._mockResult);
        }),
        mockReturnData(data: any) {
            this._mockResult = { data, error: null };
            return this;
        }
    };
    return builder;
}

// Mock Supabase client setup
const mockSupabaseAuth = {
    getUser: vi.fn().mockImplementation(async () => ({ data: { user: mockUser }, error: null }))
};

const mockSupabaseClient = {
    from: vi.fn().mockImplementation(() => createQueryBuilder()),
    auth: mockSupabaseAuth
};

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => mockSupabaseClient)
}));

// Helper function to create a mock streaming response
function createMockStream(messages: string[], delay: number = 100): ReadableStream {
    return new ReadableStream({
        async start(controller) {
            for (const message of messages) {
                const chunk = {
                    choices: [{
                        delta: { content: message }
                    }]
                };
                const encoded = new TextEncoder().encode(
                    'data: ' + JSON.stringify(chunk) + '\n\n'
                );
                controller.enqueue(encoded);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            controller.close();
        }
    });
}

describe('Fractiverse Streaming Response Handling', () => {
    let POST: (req: NextRequest) => Promise<Response>;
    let currentQueryBuilder: QueryBuilder;
    let consoleErrorSpy: SpyInstance;

    beforeEach(async () => {
        vi.resetModules();
        vi.clearAllMocks();
        
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        currentQueryBuilder = createQueryBuilder();
        mockSupabaseClient.from.mockImplementation(() => currentQueryBuilder);
        
        // Default successful auth setup
        mockSupabaseAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
        currentQueryBuilder.mockReturnData({ 
            token_balance: 1000,
            user: { id: 'test-user-id' }
        });
        
        const { POST: ImportedPOST } = await import('../route');
        POST = ImportedPOST;
    });

    it('should stream responses and save messages correctly', async () => {
        // Mock OpenAI streaming response
        const mockMessages = ['Hello', ' world', '!'];
        const mockStream = createMockStream(mockMessages);
        
        const mockOpenAI = new OpenAI({ apiKey: 'mock-key' });
        mockOpenAI.chat.completions.create = vi.fn().mockResolvedValue({
            response: mockStream
        });

        const request = new NextRequest('http://localhost:3000/api/fractiverse', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer valid-token'
            }),
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'test message' }],
                userId: 'test-user-id',
                chatId: 'test-chat-id'
            })
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(ReadableStream);

        // Verify message was saved
        expect(currentQueryBuilder.insert).toHaveBeenCalledWith({
            chat_id: 'test-chat-id',
            role: 'assistant',
            content: expect.any(String),
            user_id: 'test-user-id'
        });
    });

    it('should handle streaming errors gracefully', async () => {
        // Mock a stream that errors
        const errorStream = new ReadableStream({
            start(controller) {
                controller.error(new Error('Stream error'));
            }
        });
        
        const mockOpenAI = new OpenAI({ apiKey: 'mock-key' });
        mockOpenAI.chat.completions.create = vi.fn().mockResolvedValue({
            response: errorStream
        });

        const request = new NextRequest('http://localhost:3000/api/fractiverse', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer valid-token'
            }),
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'test message' }],
                userId: 'test-user-id',
                chatId: 'test-chat-id'
            })
        });

        const response = await POST(request);
        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ error: 'Stream processing failed' });
    });

    it('should handle message saving errors', async () => {
        // Mock successful stream but failed message save
        const mockMessages = ['Test response'];
        const mockStream = createMockStream(mockMessages);
        
        const mockOpenAI = new OpenAI({ apiKey: 'mock-key' });
        mockOpenAI.chat.completions.create = vi.fn().mockResolvedValue({
            response: mockStream
        });

        currentQueryBuilder.insert.mockRejectedValue(new Error('Database error'));

        const request = new NextRequest('http://localhost:3000/api/fractiverse', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer valid-token'
            }),
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'test message' }],
                userId: 'test-user-id',
                chatId: 'test-chat-id'
            })
        });

        const response = await POST(request);
        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ error: 'Failed to save message' });
    });

    it('should handle concurrent streaming requests', async () => {
        // Mock two concurrent streams
        const stream1 = createMockStream(['Stream 1 response']);
        const stream2 = createMockStream(['Stream 2 response']);
        
        const mockOpenAI = new OpenAI({ apiKey: 'mock-key' });
        mockOpenAI.chat.completions.create = vi.fn()
            .mockResolvedValueOnce({ response: stream1 })
            .mockResolvedValueOnce({ response: stream2 });

        const createRequest = (chatId: string) => new NextRequest(
            'http://localhost:3000/api/fractiverse',
            {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer valid-token'
                }),
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'test message' }],
                    userId: 'test-user-id',
                    chatId
                })
            }
        );

        const [response1, response2] = await Promise.all([
            POST(createRequest('chat-1')),
            POST(createRequest('chat-2'))
        ]);

        expect(response1.status).toBe(200);
        expect(response2.status).toBe(200);
        expect(response1.body).toBeInstanceOf(ReadableStream);
        expect(response2.body).toBeInstanceOf(ReadableStream);

        // Verify both messages were saved
        expect(currentQueryBuilder.insert).toHaveBeenCalledTimes(2);
    });
}); 