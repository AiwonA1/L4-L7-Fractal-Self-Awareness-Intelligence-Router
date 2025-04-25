import { vi, describe, it, expect, beforeEach, afterAll, afterEach, type SpyInstance } from 'vitest'
import type { Mock } from 'vitest'
import { NextResponse, NextRequest } from 'next/server'
import { ReadableStream, ReadableStreamDefaultController } from 'stream/web'
import { createClient, User, SupabaseClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { MockInstance } from 'vitest'

// Add test configuration at the top
vi.setConfig({
    testTimeout: 10000,
    hookTimeout: 10000,
    clearMocks: true,
    fakeTimers: {
        now: Date.now(),
        toFake: ['setTimeout', 'clearTimeout', 'setImmediate', 'clearImmediate', 'setInterval', 'clearInterval', 'Date'],
        loopLimit: 10000
    }
});

// Add global error handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

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

// --- Helper: Async Generator for OpenAI Stream Mock ---
async function* streamGenerator() {
    const messages = ['Mocked ', 'AI ', 'response.']; 
    for (const message of messages) {
        const chunk = {
            choices: [{
                delta: { content: message },
                finish_reason: null
            }]
        };
        yield chunk;
        await new Promise(resolve => setTimeout(resolve, 5)); 
    }
    yield {
        choices: [{
            delta: {}, 
            finish_reason: 'stop'
        }]
    };
}
// --- End Helper ---

// Types for our mocks
interface Message {
    role: string;
    content: string;
    chat_id?: string;
    user_id?: string;
    created_at?: string;
}

interface JsonMockReturnType {
    messages: Array<Message>;
    userId: string;
    chatId: string;
}

interface AuthResponse {
    data: {
        user: User | null;
        session: {
            access_token: string;
            refresh_token: string;
            expires_in: number;
            user: User;
        } | null;
    };
    error: Error | null;
}

interface RpcParams {
    p_user_id: string;
    p_amount: number;
    p_description?: string;
}

interface RpcResponse {
    data: boolean | null;
    error: Error | null;
}

interface SupabaseTokenResponse {
    data: { token_balance: number };
    error: null | Error;
}

interface SupabaseMessagesResponse {
    data: Message[] | null;
    error: null | Error;
}

interface SupabaseUserResponse {
    data: { user: { id: string } } | null;
    error: null | Error;
}

interface QueryBuilderResponse<T> {
    data: T | null;
    error: Error | null;
}

type MockFunction<TArgs extends any[] = any[], TReturn = any> = Mock<TArgs, TReturn>;

interface QueryBuilder<T = any> {
    select: Mock & ((columns?: string) => QueryBuilder<T>);
    eq: Mock & ((column: string, value: any) => QueryBuilder<T>);
    single: Mock & (() => Promise<QueryBuilderResponse<T>>);
    insert: Mock & ((data: Partial<T>) => Promise<QueryBuilderResponse<T>>);
    update: Mock & ((data: Partial<T>) => Promise<QueryBuilderResponse<T>>);
    delete: Mock & (() => Promise<QueryBuilderResponse<T>>);
    order: Mock & ((column: string, options?: { ascending?: boolean }) => QueryBuilder<T>);
    then: <TResult = QueryBuilderResponse<T>>(
        onfulfilled?: ((value: QueryBuilderResponse<T>) => TResult | PromiseLike<TResult>) | null,
        onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
    ) => Promise<TResult>;
    _mockResult: QueryBuilderResponse<T>;
    mockReturnData: (data: T) => QueryBuilder<T>;
    mockReturnError: (error: Error) => QueryBuilder<T>;
}

interface MockSupabaseAuth {
    getUser: Mock;
    setSession: Mock;
    getSession: Mock;
}

interface MockSupabaseClient {
    from: Mock;
    rpc: Mock;
    auth: MockSupabaseAuth;
    realtime: any;
    functions: any;
    storage: any;
    schema: any;
}

function createQueryBuilder<T = any>(initialData: T | null = null, initialError: Error | null = null): QueryBuilder<T> {
    const builder: QueryBuilder<T> = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(async () => builder._mockResult),
        insert: vi.fn().mockImplementation(async () => builder._mockResult),
        update: vi.fn().mockImplementation(async () => builder._mockResult),
        delete: vi.fn().mockImplementation(async () => builder._mockResult),
        order: vi.fn().mockReturnThis(),
        then: (onfulfilled, onrejected) => Promise.resolve(builder._mockResult).then(onfulfilled, onrejected),
        _mockResult: { data: initialData, error: initialError },
        mockReturnData(data: T) {
            this._mockResult = { data, error: null };
            return this;
        },
        mockReturnError(error: Error) {
            this._mockResult = { data: null, error };
            return this;
        }
    };
    return builder;
}

// Update mock Supabase auth with proper error handling
const mockSupabaseAuth: MockSupabaseAuth = {
    getUser: vi.fn().mockImplementation(async () => {
        // Default success case
        return { data: { user: mockUser }, error: null };
    }),
    setSession: vi.fn().mockResolvedValue({ data: null, error: null }),
    getSession: vi.fn().mockImplementation(async () => {
        // Default success case
        return { data: { session: mockSession }, error: null };
    })
};

// Mock Supabase client setup with proper typing
const mockSupabaseClient: MockSupabaseClient = {
    from: vi.fn().mockImplementation(() => createQueryBuilder()),
    rpc: vi.fn().mockImplementation(async (name: string, params?: any) => {
        if (name === 'check_and_deduct_tokens') {
            return { data: true, error: null };
        }
        return { data: null, error: null };
    }),
    auth: mockSupabaseAuth,
    realtime: {},
    functions: {},
    storage: {},
    schema: {}
};

// Update existing mock helpers to use the new builder methods
function mockTokenBalance(balance: number) {
    const builder = createQueryBuilder();
    builder.mockReturnData({ token_balance: balance });
    mockSupabaseClient.from.mockReturnValueOnce(builder);
    return builder;
}

function mockUserData(userData: any) {
    const builder = createQueryBuilder();
    builder.mockReturnData(userData);
    mockSupabaseClient.from.mockReturnValueOnce(builder);
    return builder;
}

function mockHistoryData(history: any[]) {
    const builder = createQueryBuilder();
    builder.mockReturnData(history);
    mockSupabaseClient.from.mockReturnValueOnce(builder);
    return builder;
}

// Mock OpenAI setup
const mockOpenAICompletionsCreate = vi.fn().mockImplementation(() => {
    return createMockStream(['Mocked ', 'AI ', 'response.']);
});

// --- Refined Mock OpenAI Stream Creation ---
function createMockStream(messages: string[], options: { failAfter?: number, delay?: number } = {}): AsyncIterable<any> {
    const { failAfter = -1, delay = 2 } = options;
    let count = 0;

    return {
        async *[Symbol.asyncIterator]() {
            for (const message of messages) {
                if (failAfter !== -1 && count >= failAfter) {
                    throw new Error("Error streaming response from OpenAI");
                }
                yield {
                    choices: [{
                        delta: { content: message },
                        finish_reason: null
                    }]
                };
                count++;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            yield {
                choices: [{
                    delta: {},
                    finish_reason: 'stop'
                }]
            };
        }
    };
}

// Mock OpenAI Client
class MockOpenAI {
    chat = {
        completions: {
            create: mockOpenAICompletionsCreate
        }
    };
}

// Mock 'openai'
vi.mock('openai', () => ({
    default: vi.fn(() => new MockOpenAI()),
    OpenAI: vi.fn(() => new MockOpenAI())
}));

// Mock '@supabase/supabase-js'
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => mockSupabaseClient)
}));

// Mock environment variables
vi.stubEnv('SUPABASE_URL', 'http://mock-supabase-url.com')
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'mock-supabase-key')
vi.stubEnv('OPENAI_API_KEY', 'mock-openai-key')

// Helper: Consume stream to text with timeout
async function consumeStreamWithTimeout(response: Response, timeoutMs: number = 5000): Promise<string> {
    if (!response.body) {
        throw new Error("Response body is null");
    }

    let result = '';
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let timeoutReached = false;

    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => {
            timeoutReached = true;
            reject(new Error(`Stream consumption timed out after ${timeoutMs}ms`));
        }, timeoutMs)
    );

    const readPromise = (async () => {
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done || timeoutReached) {
                    break;
                }
                result += decoder.decode(value, { stream: true });
            }
            result += decoder.decode();
            return result;
        } finally {
             reader.releaseLock();
        }
    })();

    return Promise.race([readPromise, timeoutPromise]) as Promise<string>;
}

interface StreamTextOptions {
    messages: any[];
}

interface StreamTextResponse {
    toTextStreamResponse: () => Promise<Response>;
    triggerOnFinish: () => void;
}

const mockStreamText = vi.fn();

// Add type for route module
interface RouteModule {
    POST: (req: NextRequest) => Promise<Response>;
}

describe('POST /api/fractiverse/route', () => {
    let POST: (req: NextRequest) => Promise<Response>;
    let requestMock: NextRequest;
    let consoleErrorSpy: SpyInstance;
    let currentQueryBuilder: QueryBuilder<any>;

    beforeEach(async () => {
        vi.resetModules();
        vi.clearAllMocks();
        
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {}); 

        currentQueryBuilder = createQueryBuilder();
        
        // Reset mocks with proper defaults
        mockSupabaseAuth.getUser.mockReset();
        mockSupabaseAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
        
        mockSupabaseClient.from.mockImplementation(() => currentQueryBuilder);
        mockSupabaseClient.rpc.mockResolvedValue({ data: true, error: null });

        // Setup default successful auth flow
        currentQueryBuilder.single
            .mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null })  // User check
            .mockResolvedValueOnce({ data: { token_balance: 100 }, error: null });  // Token check
        
        currentQueryBuilder.order.mockResolvedValue({ data: [], error: null });  // Empty history by default

        // Default request setup
        const requestBody = {
            messages: [{ role: 'user', content: 'test message' }],
            userId: 'test-user-id',
            chatId: 'test-chat-id'
        };

        requestMock = new NextRequest('http://localhost:3000/api/fractiverse', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            }),
            body: JSON.stringify(requestBody)
        });

        // Import the module under test
        const routeModule = await import('../route');
        POST = routeModule.POST;

        // Set up environment
        process.env.OPENAI_API_KEY = 'test-key';
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it('should handle basic chat send successfully', async () => {
        const response = await POST(requestMock);
        expect(response.status).toBe(200);
        
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Response body is null');
        }

        let result = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            result += new TextDecoder().decode(value);
        }
        
        expect(result).toContain('Mocked AI response');
    }, 15000);

    it('should handle streaming response successfully', async () => {
        const response = await POST(requestMock);
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(ReadableStream);

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Response body is null');
        }

        let result = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            result += new TextDecoder().decode(value);
        }

        expect(result).toBe('Mocked AI response.');
    }, 15000);

    it('should handle OpenAI streaming errors gracefully', async () => {
        mockOpenAICompletionsCreate.mockRejectedValueOnce(new Error('OpenAI API error'));

        const response = await POST(requestMock);
        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data.error).toBe('OpenAI API error');
    });

    it('should fail with 401 when user is not authenticated', async () => {
        mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: null }, error: new Error('Auth Error') });

        const response = await POST(requestMock);
        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should fail with 401 when user ID mismatch', async () => {
        // Setup: Auth OK but different user ID returned
        mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
        currentQueryBuilder.single.mockResolvedValueOnce({ 
            data: { user: { id: 'different-user-id' } }, 
            error: null 
        });

        const response = await POST(requestMock);
        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 401 if no session', async () => {
        mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

        const response = await POST(requestMock);
        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 402 if insufficient tokens', async () => {
        // Setup sequence: Auth OK, User ID OK, Token Balance = 0
        currentQueryBuilder.single
            .mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null })
            .mockResolvedValueOnce({ data: { token_balance: 0 }, error: null });

        const response = await POST(requestMock);
        expect(response.status).toBe(402);
        const data = await response.json();
        expect(data).toEqual({ error: 'Insufficient token balance' });
    });

    it('should return 500 if OpenAI API key is missing', async () => {
        const originalKey = process.env.OPENAI_API_KEY;
        delete process.env.OPENAI_API_KEY;
        const { POST: PostWithNoKey } = await import('../route'); 

        // Reset mocks and set up sequence: Auth OK, User ID OK, Token Balance OK
        mockSupabaseAuth.getUser.mockReset();
        currentQueryBuilder.single.mockReset();
        mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
        currentQueryBuilder.single.mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null });
        currentQueryBuilder.single.mockResolvedValueOnce({ data: { token_balance: 100 }, error: null });

        const response = await PostWithNoKey(requestMock); 
        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data).toEqual({ error: 'OpenAI API key is not configured' });

        process.env.OPENAI_API_KEY = originalKey;
    });

    it('should return 500 if checking token balance fails', async () => {
        // Setup sequence: Auth OK, User ID OK, Token Balance Check Fails
        currentQueryBuilder.single
            .mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null })
            .mockRejectedValueOnce(new Error('Database error checking balance'));

        const response = await POST(requestMock);
        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data).toEqual({ error: 'Error checking token balance' });
    });

    // Add more tests: missing fields in body, rate limiting, db errors during initial checks etc.

    it('should return 400 if message is missing', async () => {
        // Create new request with typed mock
        const testRequest = new NextRequest('http://localhost/api/fractiverse', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            }
        });
        
        const typedJsonMock = vi.fn<[], Promise<JsonMockReturnType>>();
        typedJsonMock.mockResolvedValue({ chatId: 'c1', userId: 'u1' } as any);
        testRequest.json = typedJsonMock;

      const { POST } = await import('../route');
        const response = await POST(testRequest);
       expect(response.status).toBe(400);
      const responseData = await response.json();
        expect(responseData).toEqual({ error: 'Missing required fields' });
    });

     it('should return 400 if chatId is missing', async () => {
        // Create new request with typed mock
        const testRequest = new NextRequest('http://localhost/api/fractiverse', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            }
        });
        
        const typedJsonMock = vi.fn<[], Promise<JsonMockReturnType>>();
        typedJsonMock.mockResolvedValue({ 
            messages: [{ role: 'user', content: 'm1' }], 
            userId: 'u1' 
        } as any);
        testRequest.json = typedJsonMock;

      const { POST } = await import('../route');
        const response = await POST(testRequest);
       expect(response.status).toBe(400);
      const responseData = await response.json();
        expect(responseData).toEqual({ error: 'Missing required fields' });
    });

     it('should return 400 if userId is missing', async () => {
        // Create new request with typed mock
        const testRequest = new NextRequest('http://localhost/api/fractiverse', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            }
        });
        
        const typedJsonMock = vi.fn<[], Promise<JsonMockReturnType>>();
        typedJsonMock.mockResolvedValue({ 
            messages: [{ role: 'user', content: 'm1' }], 
            chatId: 'c1' 
        } as any);
        testRequest.json = typedJsonMock;

        const { POST } = await import('../route');
        const response = await POST(testRequest);
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData).toEqual({ error: 'Missing required fields' });
    });

    it('should verify token balance before processing request', async () => {
        // Setup successful token balance check
        currentQueryBuilder.single
            .mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null })
            .mockResolvedValueOnce({ data: { token_balance: 100 }, error: null });

        await POST(requestMock);
        
        // Verify token balance was checked
        expect(currentQueryBuilder.select).toHaveBeenCalled();
        expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('use_tokens', expect.any(Object));
    });

    it('should deduct one token for successful completion', async () => {
        mockTokenBalance(100);
        
        const mockStream = new ReadableStream({
            start(controller: ReadableStreamDefaultController) {
                controller.enqueue(new TextEncoder().encode('Test response'));
                controller.close();
            }
        });

        mockOpenAICompletionsCreate.mockResolvedValueOnce({
            body: mockStream
        });

        const response = await POST(requestMock);
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(ReadableStream);
    });

    it('should not deduct tokens for failed completions', async () => {
        // Reset mocks
        mockSupabaseAuth.getUser.mockReset();
        currentQueryBuilder.single.mockReset();
        currentQueryBuilder.order.mockReset();
        mockSupabaseClient.rpc.mockReset();
        mockOpenAICompletionsCreate.mockReset();

        // Mock sequence: Auth OK, User ID OK, Token OK, History OK, OpenAI Fails
        mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
        currentQueryBuilder.single.mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null });
        currentQueryBuilder.single.mockResolvedValueOnce({ data: { token_balance: 100 }, error: null });
        currentQueryBuilder.order.mockResolvedValueOnce({ data: [], error: null }); // History check
        const openAIError = new Error('OpenAI Stream failed');
        mockOpenAICompletionsCreate.mockRejectedValueOnce(openAIError); // Mock OpenAI create to fail

        const response = await POST(requestMock);
        expect(response.status).toBe(500); // Expect failure status
        const data = await response.json();
        expect(data).toEqual({ error: 'Error streaming response from OpenAI' });
        // Ensure the deduction RPC was *not* called
        expect(mockSupabaseClient.rpc).not.toHaveBeenCalled(); 
         // Check console log
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('[route] Error calling OpenAI:'), 
            openAIError
        );
    });

    it('should save assistant message after successful completion', async () => {
        // Reset mocks for clean sequence
        mockSupabaseAuth.getUser.mockReset();
        currentQueryBuilder.single.mockReset();
        currentQueryBuilder.order.mockReset();
        mockSupabaseClient.rpc.mockReset();
        currentQueryBuilder.insert.mockReset();
        mockOpenAICompletionsCreate.mockReset();

        // Mock successful sequence
        mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
        currentQueryBuilder.single.mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null }); // User ID check
        currentQueryBuilder.single.mockResolvedValueOnce({ data: { token_balance: 100 }, error: null }); // Token check
        currentQueryBuilder.order.mockResolvedValueOnce({ data: [], error: null }); // History check (empty)
        mockSupabaseClient.rpc.mockResolvedValueOnce({ data: true, error: null }); // Token deduction
        currentQueryBuilder.insert.mockResolvedValueOnce({ data: [{}], error: null }); // Message save SUCCEEDS
        mockOpenAICompletionsCreate.mockImplementationOnce(streamGenerator); // OpenAI stream

        const response = await POST(requestMock);
        expect(response.status).toBe(200);
        
        await consumeStreamWithTimeout(response, 2000);

        // Verify insert was called correctly AFTER stream consumption
        expect(currentQueryBuilder.insert).toHaveBeenCalledWith({
            chat_id: 'test-chat-id',
            role: 'assistant',
            content: 'Mocked AI response.', 
            user_id: 'test-user-id' 
        });
        expect(currentQueryBuilder.insert).toHaveBeenCalledTimes(1);
    });

    it('should handle errors during message saving', async () => {
        // Reset mocks
        mockSupabaseAuth.getUser.mockReset();
        currentQueryBuilder.single.mockReset();
        currentQueryBuilder.order.mockReset();
        mockSupabaseClient.rpc.mockReset();
        currentQueryBuilder.insert.mockReset();
        mockOpenAICompletionsCreate.mockReset();

        // Mock successful sequence up to insert
        mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
        currentQueryBuilder.single.mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null }); 
        currentQueryBuilder.single.mockResolvedValueOnce({ data: { token_balance: 100 }, error: null });
        currentQueryBuilder.order.mockResolvedValueOnce({ data: [], error: null });
        mockSupabaseClient.rpc.mockResolvedValueOnce({ data: true, error: null });
        mockOpenAICompletionsCreate.mockImplementationOnce(streamGenerator); // OpenAI stream succeeds

        // Mock insert to FAIL
        const dbError = new Error('Database error during message save');
        currentQueryBuilder.insert.mockRejectedValueOnce(dbError);

        const response = await POST(requestMock);
        expect(response.status).toBe(200); // Initial response is still OK

        // Consume the stream, the error occurs in the background '.finally()' block
        await consumeStreamWithTimeout(response, 2000);
        
        // Give time for the async error handling to potentially log
        await new Promise(resolve => setTimeout(resolve, 10)); 

        // Verify the error was logged
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('Error saving assistant message:'),
            dbError
        );
        // Ensure insert was attempted
         expect(currentQueryBuilder.insert).toHaveBeenCalledTimes(1);
    });

    it('should handle message format validation', async () => {
        const { POST } = await import('../route');
        
        // Test invalid message format
        const invalidRequest = {
            json: vi.fn().mockResolvedValue({
                messages: [{ invalid: 'format' }], // Missing role and content
                userId: 'test-user-id',
                chatId: 'test-chat-id'
            })
        } as unknown as NextRequest;

        const response = await POST(invalidRequest);
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData).toEqual({ error: 'Invalid message format' });
    });

    it('should properly format messages for OpenAI', async () => {
        const createSpy = vi.fn().mockImplementation(() => 
            createMockStream(['Test response ', 'formatted.'])
        );
        mockOpenAICompletionsCreate.mockImplementation(createSpy);

        const complexRequest = new NextRequest('http://localhost:3000/api/fractiverse', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            }),
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: 'Hello!' },
                    { role: 'assistant', content: 'Hi there!' },
                    { role: 'user', content: 'How are you?' }
                ],
                userId: 'test-user-id',
                chatId: 'test-chat-id-format'
            })
        });

        const response = await POST(complexRequest);
        expect(response.status).toBe(200);

        // Verify OpenAI was called with correct message format
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledWith({
            model: 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Hello!' },
                { role: 'assistant', content: 'Hi there!' },
                { role: 'user', content: 'How are you?' }
            ],
            stream: true,
            temperature: 0.7
        });
    });

    // Note: Rate limit testing requires mocking the rate-limit utility
    // vi.mock('@/lib/rate-limit', () => ({ rateLimitCheck: vi.fn() }))
    // then in test: mockedRateLimitCheck.mockResolvedValueOnce({ success: false }) ...

    // --- Add New Tests for History --- 
    it('should fetch and prepend chat history before calling OpenAI', async () => {
        const history = [
            { role: 'user', content: 'Previous question' },
            { role: 'assistant', content: 'Previous answer' }
        ];
        
         // Reset mocks
        mockSupabaseAuth.getUser.mockReset();
        currentQueryBuilder.single.mockReset();
        currentQueryBuilder.order.mockReset();
        mockSupabaseClient.rpc.mockReset();
        mockOpenAICompletionsCreate.mockReset(); // Reset OpenAI mock

        // Mock successful sequence, including history fetch
        mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
        currentQueryBuilder.single.mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null });
        currentQueryBuilder.single.mockResolvedValueOnce({ data: { token_balance: 100 }, error: null });
        currentQueryBuilder.order.mockResolvedValueOnce({ data: history, error: null }); // History fetch returns data
        mockSupabaseClient.rpc.mockResolvedValueOnce({ data: true, error: null });

        // Spy on OpenAI create call
        const createSpy = vi.fn().mockImplementation(streamGenerator);
        mockOpenAICompletionsCreate.mockImplementation(createSpy);

        const request = new NextRequest('http://localhost/api/fractiverse', {
             method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            }),
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'New question' }], // Only new message
                userId: 'test-user-id',
                chatId: 'history-chat-id'
            })
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
        await consumeStreamWithTimeout(response, 2000);

        // Assert history was fetched
        expect(currentQueryBuilder.order).toHaveBeenCalledTimes(1);
        // Assert OpenAI was called with prepended history
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
            messages: [
                { role: 'user', content: 'Previous question' },
                { role: 'assistant', content: 'Previous answer' },
                { role: 'user', content: 'New question' }
            ]
        }));
    });

    it('should handle errors when fetching chat history', async () => {
         // Reset mocks
        mockSupabaseAuth.getUser.mockReset();
        currentQueryBuilder.single.mockReset();
        currentQueryBuilder.order.mockReset();

        // Mock sequence: Auth OK, User ID OK, Token OK, History Fetch Fails
        mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
        currentQueryBuilder.single.mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null });
        currentQueryBuilder.single.mockResolvedValueOnce({ data: { token_balance: 100 }, error: null });
        const fetchError = new Error('Failed to fetch history');
        currentQueryBuilder.order.mockRejectedValueOnce(fetchError);

        const request = new NextRequest('http://localhost/api/fractiverse', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            }),
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'New question' }],
                userId: 'test-user-id',
                chatId: 'history-error-chat-id'
            })
        });

        const response = await POST(request);
        expect(response.status).toBe(500); // Expect failure
        const responseData = await response.json();
        expect(responseData).toEqual({ error: 'Error fetching chat history' }); 
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('[route] Error fetching chat history:'), 
            fetchError
        );
        expect(mockOpenAICompletionsCreate).not.toHaveBeenCalled(); // OpenAI should not be called
    });

    it('should handle history data correctly', async () => {
         // Reset mocks
        mockSupabaseAuth.getUser.mockReset();
        currentQueryBuilder.single.mockReset();
        currentQueryBuilder.order.mockReset();
        mockSupabaseClient.rpc.mockReset();
        currentQueryBuilder.insert.mockReset();
        mockOpenAICompletionsCreate.mockReset();

        // Mock successful sequence, including history and insert
        mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
        currentQueryBuilder.single.mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null });
        currentQueryBuilder.single.mockResolvedValueOnce({ data: { token_balance: 100 }, error: null });
        const historyData = [
            { role: 'user', content: 'Previous message', created_at: new Date().toISOString() }
        ];
        currentQueryBuilder.order.mockResolvedValueOnce({ data: historyData, error: null }); // History fetch
        mockSupabaseClient.rpc.mockResolvedValueOnce({ data: true, error: null }); // Token deduction
        currentQueryBuilder.insert.mockResolvedValueOnce({ data: [{}], error: null }); // Message save
        mockOpenAICompletionsCreate.mockImplementationOnce(streamGenerator); // OpenAI stream

        const response = await POST(requestMock); // Use standard request
        expect(response.status).toBe(200); // Should succeed

        await consumeStreamWithTimeout(response, 2000);

        // Verify the history was queried
        expect(currentQueryBuilder.order).toHaveBeenCalledTimes(1);

        // Verify the message was saved
        expect(currentQueryBuilder.insert).toHaveBeenCalledTimes(1);
        expect(currentQueryBuilder.insert).toHaveBeenCalledWith({
            chat_id: 'test-chat-id',
            role: 'assistant',
            content: 'Mocked AI response.', 
            user_id: 'test-user-id'
        });
    });

    it('should handle concurrent token balance checks correctly', async () => {
        let tokenBalanceCallCount = 0;
        
        // Setup mock implementation for concurrent checks
        currentQueryBuilder.single
            .mockImplementation(async () => {
                const callNumber = tokenBalanceCallCount++;
                if (callNumber % 2 === 0) {
                    // First call in each pair: user ID check
                    return { data: { user: { id: 'test-user-id' } }, error: null };
                } else {
                    // Second call in each pair: token balance check
                    const balance = callNumber === 1 ? 2 : 1; // First request sees 2 tokens, second sees 1
                    return { data: { token_balance: balance }, error: null };
                }
            });

        const request1 = new NextRequest('http://localhost:3000/api/fractiverse', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer token1'
            }),
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'Test message' }],
                userId: 'test-user-id',
                chatId: 'concurrent-chat-1'
            })
        });

        const request2 = new NextRequest('http://localhost:3000/api/fractiverse', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer token2'
            }),
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'Test message' }],
                userId: 'test-user-id',
                chatId: 'concurrent-chat-2'
            })
        });

        // Run requests concurrently
        const [response1, response2] = await Promise.all([
            POST(request1),
            POST(request2)
        ]);
        
        expect(response1.status).toBe(200); // First request should succeed
        expect(response2.status).toBe(402); // Second request should fail (insufficient tokens)
        expect(tokenBalanceCallCount).toBe(4); // Two calls per request (user ID + balance)
    });

    // Skipping OpenAI streaming errors test for now

    it('should process new messages with chat history', async () => {
        const history = [
            { role: 'user', content: 'Previous question', created_at: new Date().toISOString() },
            { role: 'assistant', content: 'Previous answer', created_at: new Date().toISOString() }
        ];

        // Setup successful sequence with history
        currentQueryBuilder.single
            .mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null })
            .mockResolvedValueOnce({ data: { token_balance: 100 }, error: null });
        
        currentQueryBuilder.order.mockResolvedValueOnce({ data: history, error: null });
        
        const response = await POST(requestMock);
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(ReadableStream);

        // Verify history was queried and message was saved
        expect(currentQueryBuilder.order).toHaveBeenCalled();
        expect(currentQueryBuilder.insert).toHaveBeenCalledWith({
            chat_id: 'test-chat-id',
            role: 'assistant',
            content: 'Mocked AI response.',
            user_id: 'test-user-id'
        });
    });

    it('should handle errors during message saving', async () => {
        const dbError = new Error('Database error during message save');
        
        // Setup successful sequence until insert
        currentQueryBuilder.single
            .mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null })
            .mockResolvedValueOnce({ data: { token_balance: 100 }, error: null });
        
        currentQueryBuilder.order.mockResolvedValueOnce({ data: [], error: null });
        currentQueryBuilder.insert.mockRejectedValueOnce(dbError);

        const response = await POST(requestMock);
        expect(response.status).toBe(200); // Initial response should still be OK

        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 50));

        // Verify error was logged
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('Error saving assistant message:'),
            dbError
        );
    });

    it('should prepend fractiverse key to chat messages', async () => {
        // Reset mocks
        mockSupabaseAuth.getUser.mockReset();
        currentQueryBuilder.single.mockReset();
        currentQueryBuilder.order.mockReset();
        mockOpenAICompletionsCreate.mockReset();

        // Mock successful sequence
        mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
        currentQueryBuilder.single
            .mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null })
            .mockResolvedValueOnce({ data: { token_balance: 100 }, error: null });
        currentQueryBuilder.order.mockResolvedValueOnce({ data: [], error: null });

        // Spy on OpenAI create call
        const createSpy = vi.fn().mockImplementation(streamGenerator);
        mockOpenAICompletionsCreate.mockImplementation(createSpy);

        const request = new NextRequest('http://localhost:3000/api/fractiverse', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            }),
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'Test message' }],
                userId: 'test-user-id',
                chatId: 'test-chat-id'
            })
        });

        const response = await POST(request);
        expect(response.status).toBe(200);

        // Verify OpenAI was called with fractiverse key prepended
        expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
            messages: [
                {
                    role: 'system',
                    content: expect.stringContaining('Operate in FractiVerse 1.0 AI Assistant: L4-L7 Fractal Self-Awareness Intelligence Router Mode')
                },
                { role: 'user', content: 'Test message' }
            ]
        }));
    });

    it('should cleanup incomplete messages on error', async () => {
        // Setup successful auth and token check
        currentQueryBuilder.single
            .mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null })
            .mockResolvedValueOnce({ data: { token_balance: 100 }, error: null });
        
        // Mock delete operation for cleanup
        const deleteMock = vi.fn().mockResolvedValue({ data: null, error: null });
        currentQueryBuilder.delete = vi.fn().mockReturnValue({
            match: deleteMock
        });

        // Mock OpenAI to simulate a streaming error
        mockOpenAICompletionsCreate.mockImplementation(() => ({
            async *[Symbol.asyncIterator]() {
                yield {
                    choices: [{
                        delta: { content: 'Start of message' },
                        finish_reason: null
                    }]
                };
                throw new Error('Stream error');
            }
        }));

        const response = await POST(requestMock);
        expect(response.status).toBe(200); // Initial response is 200 as stream starts

        // Try to read the stream to trigger the error
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Response body is null');

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
            }
        } catch (error) {
            // Expected error
        }
        
        // Wait for cleanup
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Verify cleanup was called with correct parameters
        expect(deleteMock).toHaveBeenCalledWith({
            chat_id: 'test-chat-id',
            user_id: 'test-user-id',
            status: 'incomplete'
        });
    });

    it('should handle error messages in SSE format', async () => {
        // Force a database error by mocking token balance check to fail
        const dbError = new Error('Database error');
        currentQueryBuilder.single
            .mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null })
            .mockResolvedValueOnce({ data: null, error: dbError });

        const response = await POST(requestMock);
        expect(response.status).toBe(500);
        
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Response body is null');

        let result = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            result += new TextDecoder().decode(value);
        }

        const errorData = JSON.parse(result);
        expect(errorData).toHaveProperty('error');
        expect(errorData.error).toBe('Database error checking token balance');
    });
}); // End describe block for POST /api/fractiverse/route

// --- Authentication Tests Suite --- 
describe('Authentication Tests', () => {
    let POST: any;
    let queryBuilder: QueryBuilder<any>;
    let consoleErrorSpy: SpyInstance;

    beforeEach(async () => {
        vi.resetModules();
        vi.clearAllMocks();
        
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        queryBuilder = createQueryBuilder();
        
        // Default terminal mocks
        queryBuilder.single.mockResolvedValue({ data: null, error: null });
        queryBuilder.insert.mockResolvedValue({ data: [{}], error: null });
        queryBuilder.order.mockResolvedValue({ data: [], error: null });
        queryBuilder.update.mockResolvedValue({ data: [{}], error: null });
        queryBuilder.delete.mockResolvedValue({ data: [{}], error: null });

        // Default auth/rpc mocks (may be overridden)
        mockSupabaseClient.from.mockImplementation(() => queryBuilder);
        mockSupabaseAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
        mockSupabaseClient.rpc.mockResolvedValue({ data: true, error: null });
        // Default OpenAI mock
        mockOpenAICompletionsCreate.mockImplementation(streamGenerator);
        
        vi.mock('@supabase/supabase-js', () => ({ createClient: () => mockSupabaseClient }));
        const { POST: ImportedPOST } = await import('../route');
        POST = ImportedPOST;
    });

    it('should verify all auth conditions together', async () => {
        const mockJWT = 'header.eyJleHAiOjE3NDU1MTgzMTQsInN1YiI6InRlc3QtdXNlci1pZCIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSJ9.signature';
        
        // Reset mocks and set up the full successful sequence *explicitly*
        mockSupabaseAuth.getUser.mockReset();
        queryBuilder.single.mockReset();
        queryBuilder.order.mockReset();
        mockSupabaseClient.rpc.mockReset();
        queryBuilder.insert.mockReset();
        mockOpenAICompletionsCreate.mockReset();

        // Define the sequence for THIS test
        mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null }); // 1. Auth check 
        queryBuilder.single.mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null }); // 2. User ID check
        queryBuilder.single.mockResolvedValueOnce({ data: { token_balance: 100 }, error: null }); // 3. Token check
        queryBuilder.order.mockResolvedValueOnce({ data: [], error: null }); // 4. History check
        mockSupabaseClient.rpc.mockResolvedValueOnce({ data: true, error: null }); // 5. Token deduction
        queryBuilder.insert.mockResolvedValueOnce({ data: [{}], error: null }); // 6. Message save 
        mockOpenAICompletionsCreate.mockImplementationOnce(streamGenerator); // 7. OpenAI stream

        const mockRequest = new NextRequest('http://localhost/api/fractiverse', {
            method: 'POST',
            headers: new Headers({
                'Authorization': `Bearer ${mockJWT}`,
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({ 
                messages: [{ role: 'user', content: 'Test message' }],
                userId: 'test-user-id',
                chatId: 'test-chat-id'
            })
        });

        const response = await POST(mockRequest);
        
        console.log(`Auth Conditions Test Status: ${response.status}`);
        if (!response.ok) {
             try {
                console.log(`Auth Conditions Test Body: ${await response.text()}`);
             } catch (e) {
                 console.log('Auth Conditions Test: Failed to read body');
             }
        }

        expect(response.status).toBe(200); 
        expect(response.body).toBeInstanceOf(ReadableStream);
    });

    // Concurrent test - apply similar careful mocking as in the main suite
    it('should handle concurrent token balance checks correctly', async () => {
        let tokenBalanceCallCount = 0;
        mockSupabaseAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
        mockOpenAICompletionsCreate.mockImplementation(streamGenerator);
        mockSupabaseClient.rpc.mockResolvedValue({ data: true, error: null });

        mockSupabaseClient.from.mockImplementation(() => {
            const builder = createQueryBuilder();
            builder.insert.mockResolvedValue({ data: [{}], error: null }); 
            builder.order.mockResolvedValue({ data: [], error: null }); 
            builder.update.mockResolvedValue({ data: [{}], error: null }); 
            builder.delete.mockResolvedValue({ data: [{}], error: null });
            
            // Sequence: User ID check (OK), Token Balance Check (Dynamic)
            builder.single
                .mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null })
                .mockImplementationOnce(async () => {
                    tokenBalanceCallCount++;
                    const balance = tokenBalanceCallCount === 1 ? 2 : 1;
                    console.log(`--- Auth Suite Concurrent balance check: Call ${tokenBalanceCallCount}, Balance ${balance} ---`);
                    return { data: { token_balance: balance }, error: null };
                });
            return builder;
        });

        const mockRequestBody = {
            messages: [{ role: 'user', content: 'Test message' }],
            userId: mockUser.id,
            chatId: 'auth-concurrent-chat'
        };

        const request1 = new NextRequest('http://localhost:3000/api/fractiverse', {
            method: 'POST',
            headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Bearer token1'}),
            body: JSON.stringify(mockRequestBody)
        });

        const request2 = new NextRequest('http://localhost:3000/api/fractiverse', {
            method: 'POST',
             headers: new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Bearer token2'}),
            body: JSON.stringify(mockRequestBody)
        });

        const [response1, response2] = await Promise.all([
            POST(request1),
            POST(request2)
        ]);

        console.log(`Auth Suite Response 1 Status: ${response1.status}`);
        console.log(`Auth Suite Response 2 Status: ${response2.status}`);

        expect(response1.status).toBe(200); 
        expect(response2.status).toBe(402); 
        expect(tokenBalanceCallCount).toBe(2);
    });
});

describe('Enhanced Streaming Tests', () => {
    let POST: any;
    let queryBuilder: QueryBuilder<any>;
    let requestMock: NextRequest;
    
    beforeEach(async () => {
        vi.resetModules();
        vi.clearAllMocks();
        
        queryBuilder = createQueryBuilder();
        mockSupabaseClient.from.mockImplementation(() => queryBuilder);
        mockSupabaseAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
        
        // Setup request mock
        requestMock = new NextRequest('http://localhost:3000/api/fractiverse', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            }),
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'test message' }],
                userId: 'test-user-id',
                chatId: 'test-chat-id'
            })
        });
        
        const { POST: ImportedPOST } = await import('../route');
        POST = ImportedPOST;
    });

    it('should properly format SSE messages', async () => {
        // Setup successful auth and token check
        queryBuilder.single
            .mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null })
            .mockResolvedValueOnce({ data: { token_balance: 100 }, error: null });
        
        // Mock OpenAI to return specific content
        mockOpenAICompletionsCreate.mockImplementation(() => 
            createMockStream(['Hello', ' World']));

        const response = await POST(requestMock);
        expect(response.status).toBe(200);
        
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Response body is null');

        let result = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            result += new TextDecoder().decode(value);
        }

        // Verify SSE format
        expect(result).toContain('data: {"content":"Hello"}');
        expect(result).toContain('data: {"content":" World"}');
        expect(result).toContain('data: [DONE]');
    });

    it('should handle client disconnection', async () => {
        // Setup successful auth and token check
        queryBuilder.single
            .mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null })
            .mockResolvedValueOnce({ data: { token_balance: 100 }, error: null });
        
        // Mock delete operation for cleanup
        const deleteMock = vi.fn().mockResolvedValue({ data: null, error: null });
        queryBuilder.delete = vi.fn().mockReturnValue({
            match: deleteMock
        });

        const response = await POST(requestMock);
        expect(response.status).toBe(200);
        
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Response body is null');

        // Simulate client disconnection by releasing the reader
        reader.cancel();
        
        // Wait for cleanup
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Verify cleanup was called with correct parameters
        expect(deleteMock).toHaveBeenCalledWith({
            chat_id: 'test-chat-id',
            user_id: 'test-user-id',
            status: 'incomplete'
        });
    });

    it('should verify response headers', async () => {
        // Setup successful auth and token check
        queryBuilder.single
            .mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null })
            .mockResolvedValueOnce({ data: { token_balance: 100 }, error: null });

        const response = await POST(requestMock);
        
        expect(response.headers.get('Content-Type')).toBe('text/event-stream');
        expect(response.headers.get('Cache-Control')).toBe('no-cache, no-transform');
        expect(response.headers.get('Connection')).toBe('keep-alive');
        expect(response.headers.get('X-Accel-Buffering')).toBe('no');
        expect(response.headers.get('Transfer-Encoding')).toBe('chunked');
    });

    it('should cleanup incomplete messages on error', async () => {
        // Setup successful auth and token check
        queryBuilder.single
            .mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null })
            .mockResolvedValueOnce({ data: { token_balance: 100 }, error: null });
        
        // Mock delete operation for cleanup
        const deleteMock = vi.fn().mockResolvedValue({ data: null, error: null });
        queryBuilder.delete = vi.fn().mockReturnValue({
            match: deleteMock
        });

        // Mock OpenAI to simulate a streaming error
        mockOpenAICompletionsCreate.mockImplementation(() => ({
            async *[Symbol.asyncIterator]() {
                yield {
                    choices: [{
                        delta: { content: 'Start of message' },
                        finish_reason: null
                    }]
                };
                throw new Error('Stream error');
            }
        }));

        const response = await POST(requestMock);
        expect(response.status).toBe(200); // Initial response is 200 as stream starts

        // Try to read the stream to trigger the error
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Response body is null');

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
            }
        } catch (error) {
            // Expected error
        }
        
        // Wait for cleanup
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Verify cleanup was called with correct parameters
        expect(deleteMock).toHaveBeenCalledWith({
            chat_id: 'test-chat-id',
            user_id: 'test-user-id',
            status: 'incomplete'
        });
    });

    it('should handle error messages in SSE format', async () => {
        // Force a database error by mocking token balance check to fail
        const dbError = new Error('Database error');
        queryBuilder.single
            .mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } }, error: null })
            .mockResolvedValueOnce({ data: null, error: dbError });

        const response = await POST(requestMock);
        expect(response.status).toBe(500);
        
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Response body is null');

        let result = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            result += new TextDecoder().decode(value);
        }

        const errorData = JSON.parse(result);
        expect(errorData).toHaveProperty('error');
        expect(errorData.error).toBe('Database error checking token balance');
    });
});