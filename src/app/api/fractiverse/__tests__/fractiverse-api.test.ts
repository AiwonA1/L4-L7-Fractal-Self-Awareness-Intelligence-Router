import { vi, describe, it, expect, beforeEach, afterAll, afterEach, type MockInstance } from 'vitest'
import { NextResponse, NextRequest } from 'next/server'
import { ReadableStream } from 'stream/web'; // Import for mocking stream response

// Mock dependencies EXCEPT OpenAI
vi.mock('openai', () => ({
  OpenAI: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockImplementation(() => ({
          [Symbol.asyncIterator]: async function* () {
            yield { choices: [{ delta: { content: 'Mocked ' } }] };
            yield { choices: [{ delta: { content: 'AI ' } }] };
            yield { choices: [{ delta: { content: 'response.' } }] };
          }
        }))
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

const mockSupabaseFrom = vi.fn((table: string) => ({
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      single: mockSupabaseSingle
    }))
  })),
  insert: mockSupabaseInsert
}));

type Session = {
  user: {
    id: string;
  };
};

const mockSupabaseAuth = {
  getSession: vi.fn(() => Promise.resolve({ 
    data: { session: { user: { id: 'test-user-id' } } as Session },
    error: null 
  }))
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

        // Reset manual streamText mock state
        (mockStreamText as any).onFinishCallback = null; // Reset stored callback
        mockStreamText.mockClear();
        // Reset mock implementations if needed (though mockImplementation handles it now)
        mockStreamResultObject.toTextStreamResponse.mockClear(); 

        // Reset Supabase mocks
        mockSupabaseFrom.mockClear();
        mockSupabaseAuth.getSession.mockClear();
        mockSupabaseInsert.mockClear();
        mockSupabaseSingle.mockClear();

        // Reset default implementations if needed (example for single)
         mockSupabaseSingle.mockImplementation(() => Promise.resolve({
            data: { fracti_token_balance: 1000 }, error: null
         }));

        // Mock fetch globally first - Keep for other potential fetches, but not for token deduction
        // originalFetch = global.fetch;
        // global.fetch = vi.fn().mockResolvedValue({
        //   ok: true,
        //   json: () => Promise.resolve({ success: true }), // Mock token deduction success by default
        // });

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
                message: 'Explain fractals briefly.',
                chatId: 'test-chat-id', // Use test IDs
                userId: 'test-user-id'
            }),
            url: 'http://localhost:3000/api/fractiverse'
        }

        // Default implementation for supabaseAdmin.from for most tests - NOW HANDLED BY MODULE MOCKS ABOVE
        // mockedSupabaseFrom.mockImplementation(...)
    })

    afterEach(() => {
        // global.fetch = originalFetch; // Restore original fetch - No longer needed
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
    });

    it('should return 401 if no session', async () => {
        const { POST } = await import('../route');
        
        // Mock no session
        mockSupabaseAuth.getSession.mockResolvedValueOnce({
            data: { session: null as Session | null },
            error: null
        });

        const request = {
            json: vi.fn().mockResolvedValue({
                messages: [{ role: 'user', content: 'Test message' }],
                userId: 'test-user-id',
                chatId: 'test-chat-id'
            })
        } as unknown as NextRequest;

        const response = await POST(request);
        expect(response.status).toBe(401);
    });

    it('should return 402 if insufficient tokens', async () => {
        const { POST } = await import('../route');
        
        // Mock insufficient balance
        mockSupabaseSingle.mockResolvedValueOnce({
            data: { fracti_token_balance: 0 },
            error: null
        });

        const request = {
            json: vi.fn().mockResolvedValue({
                messages: [{ role: 'user', content: 'Test message' }],
                userId: 'test-user-id',
                chatId: 'test-chat-id'
            })
        } as unknown as NextRequest;

        const response = await POST(request);
        expect(response.status).toBe(402);
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
      requestMock.json.mockResolvedValueOnce({ chatId: 'c1', userId: 'u1' }); // Missing message
      const { POST } = await import('../route');
      const response = await POST(requestMock as unknown as NextRequest);
      expect(jsonSpy).toHaveBeenCalledWith(
        { error: 'Missing required fields (message, chatId, userId)' },
        { status: 400 }
      );
       expect(response.status).toBe(400);
    });

     it('should return 400 if chatId is missing', async () => {
      requestMock.json.mockResolvedValueOnce({ message: 'm1', userId: 'u1' }); // Missing chatId
      const { POST } = await import('../route');
      const response = await POST(requestMock as unknown as NextRequest);
      expect(jsonSpy).toHaveBeenCalledWith(
        { error: 'Missing required fields (message, chatId, userId)' },
        { status: 400 }
      );
       expect(response.status).toBe(400);
    });

     it('should return 400 if userId is missing', async () => {
      requestMock.json.mockResolvedValueOnce({ message: 'm1', chatId: 'c1' }); // Missing userId
      const { POST } = await import('../route');
      const response = await POST(requestMock as unknown as NextRequest);
      expect(jsonSpy).toHaveBeenCalledWith(
        { error: 'Missing required fields (message, chatId, userId)' },
        { status: 400 }
      );
       expect(response.status).toBe(400);
    });

    it('should return 500 if checking token balance fails', async () => {
        mockSupabaseSingle.mockRejectedValueOnce(new Error('DB Connection Error'));
        const { POST } = await import('../route');
        const response = await POST(requestMock as unknown as NextRequest);
        expect(jsonSpy).toHaveBeenCalledWith(
          { error: 'Failed to verify user token balance' },
          { status: 500 }
        );
         expect(response.status).toBe(500);
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
        expect(mockSupabaseSingle).toHaveBeenCalledWith();
        expect(mockSupabaseFrom).toHaveBeenCalledWith('users');
    });

    it('should deduct exactly one token for successful completion', async () => {
        // Set initial balance
        mockSupabaseSingle.mockResolvedValueOnce({ 
            data: { fracti_token_balance: 10 }, 
            error: null 
        });

        const { POST } = await import('../route');
        const response = await POST(requestMock as unknown as NextRequest);
        
        // Consume stream
        const reader = response.body!.getReader();
        while (!(await reader.read()).done) {}

        // Trigger onFinish with successful completion
        const streamTextCallResult = await mockStreamText.mock.results[0].value;
        await streamTextCallResult.triggerOnFinish();

        // Verify token deduction
        expect(mockSupabaseAuth.rpc).toHaveBeenCalledWith(
            'use_tokens',
            {
                p_user_id: 'test-user-id',
                p_amount: 1,
                p_description: expect.stringContaining('Chat completion for chat')
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
        expect(mockSupabaseAuth.rpc).not.toHaveBeenCalled();
    });

    it('should handle concurrent token balance checks correctly', async () => {
        // Mock initial balance check for both requests
        mockSupabaseSingle
            .mockResolvedValueOnce({ data: { fracti_token_balance: 2 }, error: null })
            .mockResolvedValueOnce({ data: { fracti_token_balance: 2 }, error: null });

        const { POST } = await import('../route');
        
        // Send two concurrent requests
        const request1 = POST(requestMock as unknown as NextRequest);
        const request2 = POST({
            ...requestMock,
            json: vi.fn().mockResolvedValue({
                message: 'Second concurrent request',
                chatId: 'test-chat-id-2',
                userId: 'test-user-id'
            })
        } as unknown as NextRequest);

        // Wait for both to complete
        const [response1, response2] = await Promise.all([request1, request2]);
        
        // Both should succeed initially (as balance was sufficient)
        expect(response1.status).toBe(200);
        expect(response2.status).toBe(200);

        // Complete both streams
        const reader1 = response1.body!.getReader();
        const reader2 = response2.body!.getReader();
        while (!(await reader1.read()).done) {}
        while (!(await reader2.read()).done) {}

        // Trigger onFinish for both
        const stream1Result = await mockStreamText.mock.results[0].value;
        const stream2Result = await mockStreamText.mock.results[1].value;
        await stream1Result.triggerOnFinish();
        await stream2Result.triggerOnFinish();

        // Verify both token deductions were attempted
        expect(mockSupabaseAuth.rpc).toHaveBeenCalledTimes(2);
    });

    // Note: Rate limit testing requires mocking the rate-limit utility
    // vi.mock('@/lib/rate-limit', () => ({ rateLimitCheck: vi.fn() }))
    // then in test: mockedRateLimitCheck.mockResolvedValueOnce({ success: false }) ...

}) // End describe block 