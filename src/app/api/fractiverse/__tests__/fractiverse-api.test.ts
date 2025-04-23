import { vi, describe, it, expect, beforeEach, afterAll, afterEach, type MockInstance } from 'vitest'
import { NextResponse, NextRequest } from 'next/server'
import { ReadableStream } from 'stream/web'; // Import for mocking stream response

// --- Mock dependencies EXCEPT OpenAI ---
// Keep the existing global OpenAI mock structure
const mockOpenAICreate = vi.fn().mockImplementation(() => ({
  [Symbol.asyncIterator]: async function* () {
    yield { choices: [{ delta: { content: 'Mocked ' } }] };
    yield { choices: [{ delta: { content: 'AI ' } }] };
    yield { choices: [{ delta: { content: 'response.' } }] };
  }
}));

vi.mock('openai', () => ({
  OpenAI: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockOpenAICreate // Use the exported mock function
      }
    }
  }))
}));

// --- Mock 'ai' package ---
const mockStreamTextResult = {
  text: 'Mocked AI response.',
  finishReason: 'stop' as const,
  usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
};

// Define the object that streamText mock will resolve to
const mockStreamResultObject = {
  toTextStreamResponse: vi.fn(() => new Response(
    new ReadableStream({ // Create a mock stream
      start(controller) {
        controller.enqueue(new TextEncoder().encode(mockStreamTextResult.text));
        controller.close();
      }
    }) as any // Cast to any to resolve type mismatch
  )),
  // Function to manually trigger the stored onFinish callback
  triggerOnFinish: async () => {
    const mockFn = mockStreamText as any;
    if (mockFn.onFinishCallback) {
      await mockFn.onFinishCallback(mockStreamTextResult);
    }
  }
};

const mockStreamText = vi.fn().mockImplementation(async (options: any) => {
  // Store the onFinish callback if provided
  if (options.onFinish) {
    (mockStreamText as any).onFinishCallback = options.onFinish;
  }
  // Return the predefined result object
  return mockStreamResultObject;
});

// Store the onFinish callback on the mock function itself for access in tests
(mockStreamText as any).onFinishCallback = null as ((result: typeof mockStreamTextResult) => Promise<void> | void) | null;

vi.mock('ai', async () => {
  const actual = await vi.importActual('ai');
  return {
    ...actual,
    streamText: mockStreamText,
  };
});
// --- End Mock 'ai' package ---


// Set up a simpler mock for the supabase-admin module
// --- Mock supabaseAdmin ---
const mockSupabaseInsert = vi.fn(() => Promise.resolve({ error: null }));
const mockSupabaseSingle = vi.fn(() => Promise.resolve({
  data: { fracti_token_balance: 1000 },
    error: null
}));
const mockSupabaseRpc = vi.fn(() => Promise.resolve({ error: null }));
// Add mock for message history select with explicit type
const mockSupabaseSelectMessages = vi.fn((): Promise<{ data: { role: string; content: string }[] | null; error: any }> => Promise.resolve({ data: [], error: null }));

const mockSupabaseFrom = vi.fn((table: string) => {
    if (table === 'users') {
        return {
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: mockSupabaseSingle
                }))
            })),
            insert: mockSupabaseInsert // Keep insert mock separate if needed elsewhere
        };
    } else if (table === 'messages') {
        return {
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    order: mockSupabaseSelectMessages // Use specific mock for message history
                }))
            })),
            insert: mockSupabaseInsert // Shared insert mock
        };
    }
    // Default fallback if needed, or throw error for unexpected tables
    return { 
        select: vi.fn().mockReturnThis(), 
        insert: mockSupabaseInsert, 
        eq: vi.fn().mockReturnThis(), 
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue(new Error(`Unexpected table access: ${table}`)) 
    };
});

type Session = {
  user: {
    id: string;
  };
};

type AuthResponse = {
  data: {
    session: Session | null;
  };
  error: null;
};

const mockSupabaseAuth = {
  getSession: vi.fn(() => Promise.resolve({ 
    data: { session: { user: { id: 'test-user-id' } } },
    error: null 
  } as AuthResponse))
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
        from: mockSupabaseFrom,
    auth: mockSupabaseAuth,
    rpc: mockSupabaseRpc
  }))
}));
// --- End Mock supabaseAdmin ---


// REMOVE path mock - no longer needed as fs.readFileSync is mocked directly in beforeEach
// vi.mock('path', ...)

// Mock global fetch for the token deduction call - NO LONGER NEEDED (using RPC)
// global.fetch = vi.fn()

// Mock NextResponse to check arguments
// NextResponse mock is now handled in beforeEach due to resetModules
// vi.mock('next/server', ...)

// Import our module after all mocks are setup - MOVED to within tests where needed after resetModules
// import { POST } from '../route' // Note: Adjusted path assumption

// Import the mocked instance AFTER vi.mock
import { supabaseAdmin } from '@/lib/supabase/supabase-admin' // Keep this import if needed elsewhere

// Add Message type definition
interface Message {
    id?: string;
    chat_id?: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at?: string;
}

// Add helper function at the top level after the imports
const consumeStreamWithTimeout = async (response: Response, timeoutMs: number = 1000): Promise<string> => {
    if (!response.body) {
        throw new Error('Response has no body');
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let timeoutId: NodeJS.Timeout | undefined = undefined; // Initialize to undefined
    const streamErrored = new Error('Stream reading failed'); // Generic error for propagation

    const readLoop = async () => {
        while (true) {
            try {
                const { done, value } = await reader.read();
                if (done) break;
                if (value) chunks.push(value);
            } catch (error) {
                // If reader.read() throws (e.g., due to controller.error), re-throw
                console.error('Error reading stream chunk:', error);
                streamErrored.cause = error instanceof Error ? error : new Error(String(error));
                throw streamErrored; // Propagate a specific error
            }
        }
    };

    try {
        const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => {
                // Attempt to cancel the reader on timeout
                reader.cancel('Timeout').catch(err => console.error('Error cancelling reader on timeout:', err));
                reject(new Error('Stream timeout'));
            }, timeoutMs);
        });

        await Promise.race([readLoop(), timeoutPromise]);

        // If readLoop completed without throwing, return decoded chunks
        return new TextDecoder().decode(Buffer.concat(chunks));

    } catch (error) {
        // Re-throw timeout error or the stream error
        if (error instanceof Error && error.message === 'Stream timeout') {
            throw error; // Preserve timeout error
        } else if (error === streamErrored) {
             // Throw the original error if available, otherwise the generic one
            throw streamErrored.cause instanceof Error ? streamErrored.cause : streamErrored;
        } else {
             // Rethrow any other unexpected errors
             throw error;
        }
    } finally {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        // Ensure lock is released even if cancel fails
        reader.releaseLock();
    }
};

describe('FractiVerse API Route', () => {
    // Get the globally mocked instance (not strictly needed now with module-level mocks)
    // const mockedSupabaseFrom = vi.mocked(supabaseAdmin.from)
    // const mockedSupabaseRpc = vi.mocked(supabaseAdmin.rpc)

    let jsonSpy: MockInstance;
    let requestMock: { json: MockInstance, url: string };
    // let originalFetch: typeof global.fetch; // No longer needed

    beforeEach(async () => {
        vi.resetModules() // Reset modules to ensure clean state for imports
        vi.clearAllMocks(); // Clear calls between tests

        // Reset the global OpenAI mock to default behavior before each test
        mockOpenAICreate.mockImplementation(() => ({
            [Symbol.asyncIterator]: async function* () {
                yield { choices: [{ delta: { content: 'Mocked ' } }] };
                yield { choices: [{ delta: { content: 'AI ' } }] };
                yield { choices: [{ delta: { content: 'response.' } }] };
            }
        }));

        // Mock console.error
        vi.spyOn(console, 'error').mockImplementation(() => {});

        // Reset Supabase mocks
        mockSupabaseFrom.mockClear();
        mockSupabaseAuth.getSession.mockClear();
        mockSupabaseInsert.mockClear();
        mockSupabaseSingle.mockClear();
        mockSupabaseRpc.mockClear();
        mockSupabaseSelectMessages.mockClear(); // Clear history mock

        // Reset default implementations
         mockSupabaseSingle.mockImplementation(() => Promise.resolve({
            data: { fracti_token_balance: 1000 }, error: null
         }));
         mockSupabaseAuth.getSession.mockImplementation(() => Promise.resolve({ 
            data: { session: { user: { id: 'test-user-id' } } },
            error: null 
          } as AuthResponse));
         // Default history mock returns empty array
         mockSupabaseSelectMessages.mockImplementation(() => Promise.resolve({ data: [], error: null })); 

        // Mock NextResponse.json using doMock before any route import
        const actualServer = await vi.importActual<typeof import('next/server')>('next/server');
        vi.doMock('next/server', () => ({
            ...actualServer,
            NextResponse: {
                ...actualServer.NextResponse,
                json: vi.fn((body, init) => actualServer.NextResponse.json(body, init))
            }
        }));
        // Capture the spy AFTER mocking
        const { NextResponse } = await import('next/server');
        jsonSpy = vi.mocked(NextResponse.json);

        // Reset request mock
        requestMock = {
            json: vi.fn().mockResolvedValue({
                messages: [{ role: 'user', content: 'Explain fractals briefly.' }],
                chatId: 'test-chat-id', // Use test IDs
                userId: 'test-user-id'
            }),
            url: 'http://localhost:3000/api/fractiverse'
        }
    })

    afterEach(async () => {
        // Clean up any pending streams
        vi.clearAllTimers();
        await new Promise(resolve => setTimeout(resolve, 0)); // Flush microtasks
    })

    it('should handle streaming response successfully', async () => {
        const { POST } = await import('../route');

        const request = {
            json: vi.fn().mockResolvedValue({
                messages: [{ role: 'user', content: 'Test message' }],
                userId: 'test-user-id',
                chatId: 'test-chat-id'
            })
        } as unknown as NextRequest;

        const response = await POST(request);
        expect(response).toBeInstanceOf(Response);
        expect(response.body).toBeInstanceOf(ReadableStream);

        const streamContent = await consumeStreamWithTimeout(response, 2000);
        expect(streamContent).toBeTruthy();
        expect(streamContent).toContain('Mocked');
    });

    it('should return 401 if no session', async () => {
        const { POST } = await import('../route');

        // Mock no session
        mockSupabaseAuth.getSession.mockResolvedValueOnce({
            data: { session: null },
            error: null
        } as AuthResponse);

        const request = {
            json: vi.fn().mockResolvedValue({
                messages: [{ role: 'user', content: 'Test message' }],
                userId: 'test-user-id',
                chatId: 'test-chat-id'
            })
        } as unknown as NextRequest;

        const response = await POST(request);
        expect(response.status).toBe(401);
        const responseData = await response.json();
        expect(responseData).toEqual({ error: 'Unauthorized' });
    });

    it('should return 402 if insufficient tokens', async () => {
        const requestMock = {
            json: () => Promise.resolve({
                messages: [{ role: 'user', content: 'test' }],
                userId: 'user-insufficient-tokens',
                chatId: 'test-chat-id'
            })
        };

        // Mock getSession to return a valid session
        mockSupabaseAuth.getSession.mockResolvedValueOnce({
            data: { session: { user: { id: 'test-user-id' } } },
            error: null
        });

        // Mock users query to return insufficient tokens
        mockSupabaseSingle.mockResolvedValueOnce({
            data: { fracti_token_balance: 0 },
            error: null
        });

        const { POST } = await import('../route');
        const response = await POST(requestMock as unknown as NextRequest);
        expect(response.status).toBe(402);
        const responseData = await response.json();
        expect(responseData).toEqual({ error: 'Insufficient token balance' });
    });

    it('should return 500 if OpenAI API key is missing', async () => {
        const originalKey = process.env.OPENAI_API_KEY;
        delete process.env.OPENAI_API_KEY;
        const { POST } = await import('../route');

        const request = {
            json: vi.fn().mockResolvedValue({
                messages: [{ role: 'user', content: 'Test message' }],
                userId: 'test-user-id',
                chatId: 'test-chat-id'
            })
        } as unknown as NextRequest;

        const response = await POST(request);
        expect(response.status).toBe(500);

        process.env.OPENAI_API_KEY = originalKey;
    });

    // Add more tests: missing fields in body, rate limiting, db errors during initial checks etc.

    it('should return 400 if message is missing', async () => {
      requestMock.json.mockResolvedValueOnce({ chatId: 'c1', userId: 'u1' }); // Missing messages
      const { POST } = await import('../route');
      const response = await POST(requestMock as unknown as NextRequest);
      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData).toEqual({ error: 'Missing required fields' });
    });

    it('should return 400 if chatId is missing', async () => {
      requestMock.json.mockResolvedValueOnce({ messages: [{ role: 'user', content: 'm1' }], userId: 'u1' }); // Missing chatId
      const { POST } = await import('../route');
      const response = await POST(requestMock as unknown as NextRequest);
      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData).toEqual({ error: 'Missing required fields' });
    });

    it('should return 400 if userId is missing', async () => {
      requestMock.json.mockResolvedValueOnce({ messages: [{ role: 'user', content: 'm1' }], chatId: 'c1' }); // Missing userId
      const { POST } = await import('../route');
      const response = await POST(requestMock as unknown as NextRequest);
      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData).toEqual({ error: 'Missing required fields' });
    });

    it('should return 500 if checking token balance fails', async () => {
        const requestMock = {
            json: () => Promise.resolve({
                messages: [{ role: 'user', content: 'test' }],
                userId: 'user-db-error',
                chatId: 'test-chat-id'
            })
        };

        // Mock getSession to return a valid session
        mockSupabaseAuth.getSession.mockResolvedValueOnce({
            data: { session: { user: { id: 'test-user-id' } } },
            error: null
        });

        // Mock users query to throw a database error
        mockSupabaseSingle.mockRejectedValueOnce(new Error('Database error'));

        const { POST } = await import('../route');
        const response = await POST(requestMock as unknown as NextRequest);
        expect(response.status).toBe(500);
        const responseData = await response.json();
        expect(responseData).toEqual({ error: 'Database error' });
    });

    it('should verify token balance before processing request', async () => {
        // Mock a specific token balance
        mockSupabaseSingle.mockResolvedValueOnce({ 
            data: { fracti_token_balance: 5 }, 
            error: null 
        });

        const { POST } = await import('../route');
        await POST(requestMock as unknown as NextRequest);

        // Verify balance check was made
        expect(mockSupabaseFrom).toHaveBeenCalledWith('users');
        expect(mockSupabaseSingle).toHaveBeenCalled();
    });

    it('should deduct exactly one token for successful completion', async () => {
        mockSupabaseSingle.mockResolvedValueOnce({ 
            data: { fracti_token_balance: 10 }, 
            error: null 
        });

        const { POST } = await import('../route');
        const response = await POST(requestMock as unknown as NextRequest);
        
        await consumeStreamWithTimeout(response);

        expect(mockSupabaseRpc).toHaveBeenCalledWith(
            'use_tokens',
            {
                p_user_id: 'test-user-id',
                p_amount: 1
            }
        );
    });

    it('should not deduct tokens for failed completions', async () => {
        // Set initial balance
        mockSupabaseSingle.mockResolvedValueOnce({ 
            data: { fracti_token_balance: 10 }, 
            error: null 
        });

        // Mock stream to fail
        mockStreamText.mockImplementationOnce(async (options: any) => ({
            toTextStreamResponse: vi.fn(() => new Response(
                new ReadableStream({
                    start(controller) {
                        controller.error(new Error('Stream failed'));
                    }
                }) as any
            )),
            triggerOnFinish: async () => {
                if (options.onFinish) {
                    await options.onFinish({
                        text: '',
                        finishReason: 'error',
                        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
                    });
                }
            }
        }));

        const { POST } = await import('../route');
        await POST(requestMock as unknown as NextRequest).catch(() => {});

        // Verify no token deduction occurred
        expect(mockSupabaseRpc).not.toHaveBeenCalled();
    });

    it('should handle concurrent token balance checks correctly', async () => {
        mockSupabaseSingle
            .mockResolvedValueOnce({ data: { fracti_token_balance: 2 }, error: null })
            .mockResolvedValueOnce({ data: { fracti_token_balance: 2 }, error: null });

        const { POST } = await import('../route');
        
        const request1 = {
            json: vi.fn().mockResolvedValue({
                messages: [{ role: 'user', content: 'Test message' }],
                userId: 'test-user-id',
                chatId: 'test-chat-id'
            })
        } as unknown as NextRequest;

        const request2 = {
            json: vi.fn().mockResolvedValue({
                messages: [{ role: 'user', content: 'Second concurrent request' }],
                userId: 'test-user-id',
                chatId: 'test-chat-id-2'
            })
        } as unknown as NextRequest;

        const [response1, response2] = await Promise.all([
            POST(request1),
            POST(request2)
        ]);
        
        expect(response1.status).toBe(200);
        expect(response2.status).toBe(200);

        await Promise.all([
            consumeStreamWithTimeout(response1),
            consumeStreamWithTimeout(response2)
        ]);

        expect(mockSupabaseRpc).toHaveBeenCalledTimes(2);
    });

    it('should save assistant message after successful completion', async () => {
        const { POST } = await import('../route');
        
        mockSupabaseInsert.mockResolvedValueOnce({ error: null });
        
        const response = await POST(requestMock as unknown as NextRequest);
        const streamContent = await consumeStreamWithTimeout(response);
        
        expect(mockSupabaseFrom).toHaveBeenCalledWith('messages');
        expect(mockSupabaseInsert).toHaveBeenCalledWith({
            chat_id: 'test-chat-id',
            role: 'assistant',
            content: 'Mocked AI response.',
            user_id: 'test-user-id'
        });
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

    it('should handle errors during message saving', async () => {
        // Mock database error during message save - uses global mockSupabaseInsert
        const dbError = new Error('Database error during message save');
        mockSupabaseInsert.mockRejectedValueOnce(dbError);

        // Import POST *after* setting mock behavior for this test
        const { POST } = await import('../route');

        const response = await POST(requestMock as unknown as NextRequest);

        // Expect the stream consumption promise to reject with the specific database error
        await expect(consumeStreamWithTimeout(response, 2000)).rejects.toThrow(dbError);

        // Verify error was logged
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining('Error in post-processing:'),
            dbError
        );
    });

    it('should handle OpenAI streaming errors gracefully', async () => {
        // Modify the *global* mock's behavior for this test
        const openaiError = new Error('OpenAI API Error');
        mockOpenAICreate.mockRejectedValueOnce(openaiError);

        // Import POST *after* setting mock behavior for this test
        const { POST } = await import('../route');
        const response = await POST(requestMock as unknown as NextRequest);

        // Verify error response status and body
        expect(response.status).toBe(500);
        const responseData = await response.json();
        expect(responseData).toEqual({ error: 'OpenAI API Error' });

        // Verify console.error was NOT called for stream processing/post-processing
        expect(console.error).not.toHaveBeenCalledWith(expect.stringContaining('Error in stream processing:'), expect.any(Error));
        expect(console.error).not.toHaveBeenCalledWith(expect.stringContaining('Error in post-processing:'), expect.any(Error));
    });

    it('should properly format messages for OpenAI', async () => {
        // Reset the global mock specifically for spying in this test
        const createSpy = vi.fn().mockImplementation(() => ({
            [Symbol.asyncIterator]: async function* () {
                yield { choices: [{ delta: { content: 'Test response ' } }] };
                yield { choices: [{ delta: { content: 'formatted.' } }] };
            }
        }));
        mockOpenAICreate.mockImplementation(createSpy);

        // Import POST *after* setting mock behavior
        const { POST } = await import('../route');
        const complexRequest = {
            json: vi.fn().mockResolvedValue({
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: 'Hello!' },
                    { role: 'assistant', content: 'Hi there!' },
                    { role: 'user', content: 'How are you?' }
                ],
                userId: 'test-user-id',
                chatId: 'test-chat-id-format' // Use unique ID
            })
        } as unknown as NextRequest;

        const response = await POST(complexRequest);

        // Consume the stream fully
        await consumeStreamWithTimeout(response, 2000);

        // Verify OpenAI was called (using the spy assigned to the global mock)
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledWith({
            model: 'gpt-4-turbo-preview',
            messages: expect.arrayContaining([
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Hello!' },
                { role: 'assistant', content: 'Hi there!' },
                { role: 'user', content: 'How are you?' }
            ]),
            stream: true,
            temperature: 0.7
        });
    });

    // Note: Rate limit testing requires mocking the rate-limit utility
    // vi.mock('@/lib/rate-limit', () => ({ rateLimitCheck: vi.fn() }))
    // then in test: mockedRateLimitCheck.mockResolvedValueOnce({ success: false }) ...

    // --- Add New Tests for History --- 
    it('should fetch and prepend chat history before calling OpenAI', async () => {
        // Arrange: Mock history (type should now be inferred correctly)
        const history = [
            { role: 'user', content: 'Previous question' },
            { role: 'assistant', content: 'Previous answer' }
        ];
        mockSupabaseSelectMessages.mockResolvedValueOnce({ data: history, error: null });

        // Spy on OpenAI call
        const createSpy = vi.fn().mockImplementation(() => ({
            [Symbol.asyncIterator]: async function* () {
                yield { choices: [{ delta: { content: 'New response.' } }] };
            }
        }));
        mockOpenAICreate.mockImplementation(createSpy);

        const { POST } = await import('../route');
        const request = {
            json: vi.fn().mockResolvedValue({
                messages: [{ role: 'user', content: 'New question' }],
                userId: 'test-user-id',
                chatId: 'history-chat-id'
            })
        } as unknown as NextRequest;

        // Act
        const response = await POST(request);
        await consumeStreamWithTimeout(response); // Ensure stream finishes

        // Assert
        expect(mockSupabaseSelectMessages).toHaveBeenCalled(); // Verify history was queried
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
            messages: [
                { role: 'user', content: 'Previous question' },
                { role: 'assistant', content: 'Previous answer' },
                { role: 'user', content: 'New question' } // History + New
            ]
        }));
    });

    it('should handle errors when fetching chat history', async () => {
        // Arrange: Mock history fetch error
        const historyError = new Error('Failed to fetch history');
        mockSupabaseSelectMessages.mockRejectedValueOnce(historyError);

        const { POST } = await import('../route');
        const request = {
            json: vi.fn().mockResolvedValue({
                messages: [{ role: 'user', content: 'New question' }],
                userId: 'test-user-id',
                chatId: 'history-error-chat-id'
            })
        } as unknown as NextRequest;

        // Act
        const response = await POST(request);

        // Assert
        expect(response.status).toBe(500);
        const responseData = await response.json();
        expect(responseData).toEqual({ error: 'Failed to fetch history' });
        expect(console.error).toHaveBeenCalledWith(
            `[/api/fractiverse] Failed to fetch history`, // Use literal string prefix
            historyError // Expect the error object to be logged as the second argument
        );
        // Ensure OpenAI was not called
        expect(mockOpenAICreate).not.toHaveBeenCalled(); 
    });

    // --- End New Tests --- 

}) // End describe block 

// Mock the route module
vi.mock('../route', async () => {
  const actual = await vi.importActual('../route') as any;
  return {
    POST: actual.POST,
    verifyUserAccess: vi.fn().mockImplementation(async (userId: string) => {
      if (userId === 'user-insufficient-tokens') {
        throw new Error('Insufficient token balance');
      }
      if (userId === 'user-db-error') {
        throw new Error('Database error');
      }
      return true;
    })
  };
}); 