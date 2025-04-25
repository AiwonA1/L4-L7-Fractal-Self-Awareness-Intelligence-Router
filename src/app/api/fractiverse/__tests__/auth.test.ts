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

// Mock session data
const mockSession = {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    user: mockUser
};

interface QueryBuilder {
    select: Mock;
    eq: Mock;
    single: Mock;
    order: Mock;
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
        order: vi.fn().mockImplementation(function(this: QueryBuilder) {
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
    getUser: vi.fn().mockImplementation(async () => ({ data: { user: mockUser }, error: null })),
    setSession: vi.fn().mockResolvedValue({ data: null, error: null }),
    getSession: vi.fn().mockImplementation(async () => ({ data: { session: mockSession }, error: null }))
};

const mockSupabaseClient = {
    from: vi.fn().mockImplementation(() => createQueryBuilder()),
    auth: mockSupabaseAuth,
    rpc: vi.fn().mockResolvedValue({ data: true, error: null })
};

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => mockSupabaseClient)
}));

// Mock OpenAI setup
const mockStream = new ReadableStream({
    start(controller) {
        controller.enqueue(new TextEncoder().encode('test response'));
        controller.close();
    }
});

vi.mock('openai', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            chat: {
                completions: {
                    create: vi.fn().mockResolvedValue({
                        response: mockStream
                    })
                }
            }
        }))
    };
});

describe('Fractiverse Authentication', () => {
    let POST: (req: NextRequest) => Promise<Response>;
    let currentQueryBuilder: QueryBuilder;
    let consoleErrorSpy: SpyInstance;

    beforeEach(async () => {
        vi.resetModules();
        vi.clearAllMocks();
        
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        currentQueryBuilder = createQueryBuilder();
        mockSupabaseClient.from.mockImplementation(() => currentQueryBuilder);
        
        // Set OpenAI API key
        process.env.OPENAI_API_KEY = 'test-key';
        
        // Default successful auth setup
        mockSupabaseAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
        
        // Mock user ID check
        currentQueryBuilder.single
            .mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null })
            // Mock token balance check
            .mockResolvedValueOnce({ data: { token_balance: 100 }, error: null });
            
        // Mock empty chat history
        currentQueryBuilder.order.mockResolvedValue({ data: [], error: null });
        
        const { POST: ImportedPOST } = await import('../route');
        POST = ImportedPOST;
    });

    it('should authenticate valid users', async () => {
        const request = new NextRequest('http://localhost:3000/api/fractiverse', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer valid-token'
            }),
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'test' }],
                userId: 'test-user-id',
                chatId: 'test-chat-id'
            })
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(ReadableStream);
    });

    it('should reject requests without auth token', async () => {
        const request = new NextRequest('http://localhost:3000/api/fractiverse', {
            method: 'POST',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'test' }],
                userId: 'test-user-id',
                chatId: 'test-chat-id'
            })
        });

        const response = await POST(request);
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('should reject expired sessions', async () => {
        mockSupabaseAuth.getUser.mockResolvedValueOnce({ 
            data: { user: null }, 
            error: new Error('Token expired') 
        });

        const request = new NextRequest('http://localhost:3000/api/fractiverse', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer expired-token'
            }),
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'test' }],
                userId: 'test-user-id',
                chatId: 'test-chat-id'
            })
        });

        const response = await POST(request);
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('should reject user ID mismatch', async () => {
        currentQueryBuilder.single.mockResolvedValueOnce({ 
            data: { user: { id: 'different-user-id' } }, 
            error: null 
        });

        const request = new NextRequest('http://localhost:3000/api/fractiverse', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer valid-token'
            }),
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'test' }],
                userId: 'test-user-id',
                chatId: 'test-chat-id'
            })
        });

        const response = await POST(request);
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });
}); 