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
    update: Mock;
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
        update: vi.fn().mockImplementation(function(this: QueryBuilder) {
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

// Mock OpenAI setup
const mockOpenAIStream = new ReadableStream({
    async start(controller) {
        controller.enqueue(new TextEncoder().encode('test response'));
        controller.close();
    }
});

const mockOpenAIResponse = {
    choices: [{
        message: { content: 'test response' }
    }]
};

vi.mock('openai', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            chat: {
                completions: {
                    create: vi.fn().mockResolvedValue(mockOpenAIResponse)
                }
            }
        }))
    };
});

describe('Fractiverse Chat and Token Management', () => {
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
        currentQueryBuilder.mockReturnData({ user: { id: 'test-user-id' } });
        
        const { POST: ImportedPOST } = await import('../route');
        POST = ImportedPOST;
    });

    it('should process chat messages successfully with sufficient token balance', async () => {
        // Mock sufficient token balance
        currentQueryBuilder.mockReturnData({ 
            token_balance: 1000,
            user: { id: 'test-user-id' }
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
        
        // Verify token balance update was attempted
        expect(currentQueryBuilder.update).toHaveBeenCalled();
    });

    it('should reject requests with insufficient token balance', async () => {
        // Mock insufficient token balance
        currentQueryBuilder.mockReturnData({ 
            token_balance: 0,
            user: { id: 'test-user-id' }
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
        expect(response.status).toBe(402);
        expect(await response.json()).toEqual({ error: 'Insufficient token balance' });
    });

    it('should update token balance after successful chat completion', async () => {
        // Mock initial token balance
        const initialBalance = 1000;
        currentQueryBuilder.mockReturnData({ 
            token_balance: initialBalance,
            user: { id: 'test-user-id' }
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

        await POST(request);
        
        // Verify token balance update
        expect(currentQueryBuilder.update).toHaveBeenCalled();
        const updateCall = currentQueryBuilder.update.mock.calls[0][0];
        expect(updateCall).toHaveProperty('token_balance');
        expect(updateCall.token_balance).toBeLessThan(initialBalance);
    });

    it('should handle OpenAI API errors gracefully', async () => {
        // Mock OpenAI API error
        const mockOpenAI = new OpenAI({ apiKey: 'mock-key' });
        mockOpenAI.chat.completions.create = vi.fn().mockRejectedValue(new Error('API Error'));

        currentQueryBuilder.mockReturnData({ 
            token_balance: 1000,
            user: { id: 'test-user-id' }
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
        expect(await response.json()).toEqual({ error: 'Internal server error' });
    });
}); 