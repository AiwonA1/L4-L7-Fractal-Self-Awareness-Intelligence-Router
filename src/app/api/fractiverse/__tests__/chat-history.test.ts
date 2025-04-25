import { vi, describe, it, expect, beforeEach, afterEach, type SpyInstance } from 'vitest';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Mock cookie store implementation
const mockCookieStore = new Map<string, string>();

// Mock user data
const mockUser = {
    id: 'test-user-id',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
};

// Mock history data
const mockHistory = [
    { 
        role: 'user', 
        content: 'Previous question',
        chat_id: 'test-chat-id',
        created_at: new Date(Date.now() - 1000).toISOString()
    },
    { 
        role: 'assistant', 
        content: 'Previous answer',
        chat_id: 'test-chat-id',
        created_at: new Date(Date.now() - 500).toISOString()
    }
];

// Mock Supabase client setup
const mockSupabaseClient = {
    from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { token_balance: 10 }, error: null }),
        insert: vi.fn().mockResolvedValue({ data: [{}], error: null })
    }),
    auth: {
        getUser: vi.fn().mockResolvedValue({ 
            data: { user: mockUser }, 
            error: null 
        }),
        getSession: vi.fn().mockResolvedValue({
            data: {
                session: {
                    access_token: 'test-token',
                    refresh_token: 'test-refresh-token',
                    expires_in: 3600,
                    user: mockUser
                }
            },
            error: null
        }),
        setSession: vi.fn().mockResolvedValue({
            data: { session: null },
            error: null
        })
    }
};

// Mock OpenAI setup with streaming support
const mockOpenAIStream = async function* () {
    yield { choices: [{ delta: { content: 'Test ' } }] };
    yield { choices: [{ delta: { content: 'response' } }] };
    yield { choices: [{ delta: {}, finish_reason: 'stop' }] };
};

const mockOpenAICompletionsCreate = vi.fn().mockImplementation(() => ({
    [Symbol.asyncIterator]: mockOpenAIStream
}));

// Mock OpenAI Client
class MockOpenAI {
    chat = {
        completions: {
            create: mockOpenAICompletionsCreate
        }
    };
}

// Mock modules
vi.mock('@supabase/supabase-js', () => ({
    createClient: () => mockSupabaseClient
}));

vi.mock('openai', () => ({
    default: vi.fn(() => new MockOpenAI()),
    OpenAI: vi.fn(() => new MockOpenAI())
}));

describe('Chat History Management', () => {
    let POST: any;
    let requestMock: NextRequest;
    let consoleErrorSpy: SpyInstance;
    let deleteSpy: SpyInstance; // Spy for delete
    let matchSpy: SpyInstance; // Spy for match

    beforeEach(async () => {
        vi.resetModules();
        vi.clearAllMocks();

        // Define spies
        deleteSpy = vi.fn().mockReturnThis();
        matchSpy = vi.fn().mockResolvedValue({ data: null, error: null });

        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        // Mock environment variables
        process.env.OPENAI_API_KEY = 'test-key';
        process.env.SUPABASE_URL = 'http://localhost:54321';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

        // Set up authentication
        const testToken = 'test-token';
        mockCookieStore.set('sb-access-token', testToken);

        // Default request setup
        const requestBody = {
            messages: [{ role: 'user', content: 'new message' }],
            userId: mockUser.id,
            chatId: 'test-chat-id'
        };

        requestMock = new NextRequest('http://localhost:3000/api/fractiverse', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${testToken}`,
                'Cookie': `sb-access-token=${testToken}`
            }),
            body: JSON.stringify(requestBody)
        });

        // Reset Supabase mocks with default success responses and spies
        mockSupabaseClient.from.mockReturnValue({
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { token_balance: 10 }, error: null }),
            insert: vi.fn().mockResolvedValue({ data: [{}], error: null }),
            delete: deleteSpy, // Use the spy
            match: matchSpy   // Use the spy
        });

        mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: mockUser },
            error: null
        });

        mockSupabaseClient.auth.getSession.mockResolvedValue({
            data: {
                session: {
                    access_token: testToken,
                    refresh_token: 'test-refresh-token',
                    expires_in: 3600,
                    user: mockUser
                }
            },
            error: null
        });

        // Import the module under test
        const routeModule = await import('../route');
        POST = routeModule.POST;
    });

    afterEach(() => {
        vi.clearAllMocks();
        mockCookieStore.clear(); // Clear cookies too
        // Rely on vi.resetModules() in beforeEach for env var isolation
    });

    it('should fetch and include chat history', async () => {
        // Setup history mock
        mockSupabaseClient.from().order.mockResolvedValueOnce({ 
            data: mockHistory,
            error: null 
        });

        const response = await POST(requestMock);
        expect(response.status).toBe(200);

        // Verify history was fetched
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('messages');
        expect(mockSupabaseClient.from().order).toHaveBeenCalled();

        // Verify OpenAI was called with combined history and new message
        expect(mockOpenAICompletionsCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                messages: expect.arrayContaining([
                    { role: 'user', content: 'Previous question' },
                    { role: 'assistant', content: 'Previous answer' },
                    { role: 'user', content: 'new message' }
                ])
            })
        );
    });

    it('should handle empty chat history', async () => {
        // Setup empty history mock
        mockSupabaseClient.from().order.mockResolvedValueOnce({ 
            data: [],
            error: null 
        });

        const response = await POST(requestMock);
        expect(response.status).toBe(200);

        // Verify OpenAI was called with just the new message
        expect(mockOpenAICompletionsCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                messages: expect.arrayContaining([
                    { role: 'user', content: 'new message' }
                ])
            })
        );
    });

    it('should handle history fetch errors', async () => {
        // Setup history fetch error
        const fetchError = new Error('Failed to fetch history');
        mockSupabaseClient.from().order.mockRejectedValueOnce(fetchError);

        const response = await POST(requestMock);
        expect(response.status).toBe(500);
        
        // Read the stream data
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Response body is null');
        
        let result = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
                result += new TextDecoder().decode(value);
            }
        }

        // Parse the SSE data
        const dataMatch = result.match(/data: (.*)/);
        const data = dataMatch ? JSON.parse(dataMatch[1]) : null;
        expect(data).toEqual({ error: 'OpenAI API error' });
        
        // Verify error was logged
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('[/api/fractiverse] Error:'),
            fetchError
        );
    });

    it('should save assistant messages after successful completion', async () => {
        // Setup successful history fetch
        mockSupabaseClient.from().order.mockResolvedValueOnce({ 
            data: [],
            error: null 
        });

        // Mock OpenAI response
        const mockOpenAIResponse = {
            choices: [{ delta: { content: 'Test response' } }]
        };

        // Update OpenAI mock to return a proper async iterator
        mockOpenAICompletionsCreate.mockImplementation(() => ({
            [Symbol.asyncIterator]: async function* () {
                yield mockOpenAIResponse;
                yield { choices: [{ delta: {} }] };
            }
        }));

        const response = await POST(requestMock);
        expect(response.status).toBe(200);

        // Wait for stream to complete
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Response body is null');
        
        let result = '';
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value instanceof Uint8Array) {
                result += decoder.decode(value, { stream: true });
            }
        }
        // Flush the decoder
        result += decoder.decode(undefined, { stream: false });

        // Wait for error handling to complete (increased from 10ms to 100ms)
        await new Promise(resolve => setTimeout(resolve, 100));

        // Parse the SSE data
        const messages = result
            .split('\n\n')
            .filter(chunk => chunk.startsWith('data: '))
            .map(chunk => {
                const data = chunk.replace('data: ', '');
                return data === '[DONE]' ? { done: true } : JSON.parse(data);
            });

        // Verify message was saved
        expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith(expect.objectContaining({
            chat_id: 'test-chat-id',
            role: 'assistant',
            content: 'Test response',
            user_id: mockUser.id,
            status: 'complete'
        }));
    });

    it.skip('should handle message save errors', async () => {
        // Setup successful history fetch
        mockSupabaseClient.from().order.mockResolvedValueOnce({
            data: [],
            error: null
        });

        // Mock OpenAI response - throw error during stream
        const mockOpenAIResponse = {
            choices: [{ delta: { content: 'Test response' } }]
        };
        mockOpenAICompletionsCreate.mockImplementation(() => ({
            [Symbol.asyncIterator]: async function* () {
                yield mockOpenAIResponse;
                // Don't yield the final delta, keeping status as 'incomplete'
                throw new Error('Stream error');
            }
        }));

        const response = await POST(requestMock);
        expect(response.status).toBe(200); // Initial response is still OK

        // Wait for stream to complete (or error out)
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Response body is null');

        let result = '';
        const decoder = new TextDecoder();
        let streamError: Error | null = null;

        while (true) {
            try {
                const { done, value } = await reader.read();
                if (done) break;
                if (value instanceof Uint8Array) {
                    result += decoder.decode(value, { stream: true });
                }
            } catch (err: any) {
                streamError = err;
                console.warn("Error reading stream in test:", err);
                break; // Exit loop on reader error
            }
        }
        // Flush the decoder
        result += decoder.decode(undefined, { stream: false });

        // Wait for potential async error handling
        await new Promise(resolve => setTimeout(resolve, 100));

        // Parse the SSE data (even if there was a stream error)
        const messages = result
            .split('\n\n')
            .filter(chunk => chunk && chunk.startsWith('data: '))
            .map(chunk => {
                const data = chunk.replace('data: ', '');
                try {
                  return data === '[DONE]' ? { done: true } : JSON.parse(data);
                } catch (e) {
                  console.warn('Failed to parse SSE data chunk:', data, e);
                  return { error: 'Failed to parse chunk' };
                }
            });

        // Verify error was logged by the route handler
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('[/api/fractiverse] Streaming error:'),
            expect.any(Error)
        );

        // Verify cleanup was called using spies from beforeEach
        expect(deleteSpy).toHaveBeenCalled();
        expect(matchSpy).toHaveBeenCalledWith({
            chat_id: 'test-chat-id',
            user_id: mockUser.id,
            status: 'incomplete'
        });

        // Verify error message was sent in the stream
        const errorMessage = messages.find(msg => msg && typeof msg === 'object' && 'error' in msg);
        console.log("Captured stream messages:", messages); // Add logging
        console.log("Found error message:", errorMessage); // Add logging
        expect(errorMessage).toEqual({ error: 'Error processing stream' });
    });
}); 