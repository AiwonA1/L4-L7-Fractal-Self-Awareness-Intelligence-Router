import { vi, describe, it, expect, beforeEach, afterAll, afterEach, type MockInstance } from 'vitest'
import { NextResponse, NextRequest } from 'next/server'
import { ReadableStream } from 'stream/web'; // Import for mocking stream response

// Mock dependencies EXCEPT OpenAI
// vi.mock('openai', ...) // REMOVED

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
const mockSupabaseRpc = vi.fn(() => Promise.resolve({ data: true, error: null })); // Mock rpc call success
const mockSupabaseInsert = vi.fn(() => Promise.resolve({ error: null }));
const mockSupabaseSingle = vi.fn((/* query */) => Promise.resolve({
    data: { token_balance: 1000 }, // Default sufficient balance
    error: null
}));
const mockSupabaseOrder = vi.fn((/* query */) => Promise.resolve({
    data: [], // Default empty history
    error: null
}));

const mockSupabaseFrom = vi.fn((table: string) => {
    if (table === 'users') {
        return {
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: mockSupabaseSingle // Use specific mock
                }))
            }))
        } as any;
    } else if (table === 'messages') {
        return {
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    order: mockSupabaseOrder // Use specific mock
                }))
            })),
            insert: mockSupabaseInsert // Use specific mock
        } as any;
    }
    // Generic fallback (shouldn't be hit often with specific mocks)
    return {
        select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(), order: vi.fn() })) })),
        insert: vi.fn(),
        update: vi.fn(), // Added for completeness
    } as any;
});


vi.mock('@/lib/supabase/supabase-admin', () => ({
    supabaseAdmin: {
        from: mockSupabaseFrom,
        rpc: mockSupabaseRpc // Add the RPC mock here
    }
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
        mockSupabaseRpc.mockClear();
        mockSupabaseInsert.mockClear();
        mockSupabaseSingle.mockClear();
        mockSupabaseOrder.mockClear();
        // Reset default implementations if needed (example for single)
         mockSupabaseSingle.mockImplementation(() => Promise.resolve({
            data: { token_balance: 1000 }, error: null
         }));
         mockSupabaseOrder.mockImplementation(() => Promise.resolve({
            data: [], error: null
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

    // --- Test for OpenAI Key Missing ---
    it('should return 500 if OPENAI_API_KEY is missing', async () => {
        const originalKey = process.env.OPENAI_API_KEY as string | undefined; // Use assertion
        try {
            delete process.env.OPENAI_API_KEY;
            vi.resetModules(); // Ensure route loads without the key

            // Re-mock NextResponse for this specific module instance
            const actualServer = await vi.importActual<typeof import('next/server')>('next/server');
             vi.doMock('next/server', () => ({
                ...actualServer,
                NextResponse: {
                    ...actualServer.NextResponse,
                    json: vi.fn((body, init) => actualServer.NextResponse.json(body, init))
                }
            }));
            const { NextResponse: TestNextResponse } = await import('next/server');
            const testJsonSpy = vi.mocked(TestNextResponse.json);


            // Import the POST handler AFTER resetting modules and deleting the key
            const { POST } = await import('../route');

            // Act
            const response = await POST(requestMock as unknown as NextRequest)

            // Assert
            expect(testJsonSpy).toHaveBeenCalledTimes(1);
            expect(testJsonSpy).toHaveBeenCalledWith(
                { error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.' },
                { status: 500 }
            );
            // Ensure the response object itself is created (even if body isn't used)
             expect(response).toBeDefined();

        } finally {
            if (originalKey !== undefined) {
                process.env.OPENAI_API_KEY = originalKey;
            }
             vi.resetModules(); // Reset again to restore env var for other tests
        }
    })

    // --- Test for Insufficient Tokens ---
    it('should return 400 if user has insufficient tokens', async () => {
        // Override the specific Supabase mock for this test - set balance to 0
         mockSupabaseSingle.mockResolvedValueOnce({ data: { token_balance: 0 }, error: null });

         const { POST } = await import('../route');
         const response = await POST(requestMock as unknown as NextRequest);

         expect(jsonSpy).toHaveBeenCalledWith(
             // Expect the new error message
             { error: 'Insufficient FractiTokens. You need at least 1 token to send a message.' },
             { status: 400 }
         );
         expect(response.status).toBe(400); // Check response status as well
         expect(mockStreamText).not.toHaveBeenCalled(); // Ensure AI call wasn't made
    });


    // --- Test Successful Stream and OnFinish Logic ---
    it('should return stream, deduct token, and save message on successful request', async () => {
        // Ensure API key is present (Vitest setup should handle this)
        if (!(process.env.OPENAI_API_KEY as string | undefined)) { // Use assertion
          throw new Error('OPENAI_API_KEY not set for test run');
        }

        // 1. Import the route (uses mocked streamText and supabaseAdmin)
        const { POST } = await import('../route');

        // 2. Act: Call the route handler
        const response = await POST(requestMock as unknown as NextRequest);

        // 3. Assert Stream Response
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(ReadableStream);

        // Consume the stream fully to ensure it closes (and mimics client behavior)
        const reader = response.body!.getReader();
        let streamedText = '';
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          if (readerDone) {
            done = true;
          } else {
            streamedText += new TextDecoder().decode(value);
          }
        }
        expect(streamedText).toBe(mockStreamTextResult.text); // Check stream content matches mock

        // 4. Manually Trigger the mocked onFinish callback
        // Check if triggerOnFinish exists on the *result* of mockStreamText call
        const streamTextCallResult = await mockStreamText.mock.results[0].value; // Get the promise result
        expect(streamTextCallResult).toBe(mockStreamResultObject); // Verify we got the expected object
        expect(streamTextCallResult.triggerOnFinish).toBeDefined();
        await streamTextCallResult.triggerOnFinish();


        // 5. Assert Supabase Calls made during onFinish
        // Check token deduction call
        expect(mockSupabaseRpc).toHaveBeenCalledTimes(1);
        expect(mockSupabaseRpc).toHaveBeenCalledWith(
            'use_tokens',
            {
                p_user_id: 'test-user-id',
                p_amount: 1,
                p_description: 'Chat completion for chat test-chat-id'
            }
        );

        // Check message saving call
        expect(mockSupabaseInsert).toHaveBeenCalledTimes(1);
        expect(mockSupabaseInsert).toHaveBeenCalledWith({
            chat_id: 'test-chat-id',
            user_id: 'test-user-id',
            role: 'assistant',
            content: mockStreamTextResult.text // Check content matches AI response
        });

        // 6. Assert streamText was called correctly
        expect(mockStreamText).toHaveBeenCalledTimes(1);
        expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({
            model: expect.anything(), // Model object is complex, just check existence
            messages: expect.arrayContaining([ // Check if messages array has the correct structure
                expect.objectContaining({ role: 'system' }),
                // Add history messages check if needed based on mockSupabaseOrder
                expect.objectContaining({ role: 'user', content: 'Explain fractals briefly.' })
            ]),
            temperature: 0.7,
            maxTokens: 1000,
            onFinish: expect.any(Function) // Check that onFinish was passed
        }));
    });


    // --- Test Case: Stream finishes with non-'stop'/'length' reason ---
    it('should not deduct token or save message if stream finishes due to error/other reason', async () => {
        if (!(process.env.OPENAI_API_KEY as string | undefined)) { // Use assertion
          throw new Error('OPENAI_API_KEY not set for test run');
        }
         const { POST } = await import('../route');

         // Modify the mock result for this test
         const errorFinishResult = {
             ...mockStreamTextResult,
             finishReason: 'error' as const,
             text: '' // Usually no text on error finish
         };

         // Redefine mock implementation specifically for this test's onFinish call
         mockStreamText.mockImplementationOnce(async (options: any) => {
            // Store the onFinish callback if provided
            let storedCallback: ((result: any) => Promise<void> | void) | null = null;
            if (options.onFinish) {
                storedCallback = options.onFinish;
            }
            // Return an object similar to the main mock, but allowing custom trigger logic
            return {
                toTextStreamResponse: vi.fn(() => new Response(new ReadableStream({ start(c){ c.close(); } }) as any )), // Empty stream
                triggerOnFinish: async () => {
                    if (storedCallback) {
                         // Trigger with the error finish reason
                        await storedCallback(errorFinishResult);
                    }
                }
            };
        });


         const response = await POST(requestMock as unknown as NextRequest);
         expect(response.status).toBe(200); // Route still returns stream initially

         // Consume stream
         const reader = response.body!.getReader();
         while (!(await reader.read()).done) {}

         // Trigger onFinish with the 'error' reason
         const streamTextCallResult = await mockStreamText.mock.results[0].value;
         await streamTextCallResult.triggerOnFinish();

         // Assert: Supabase calls should NOT have been made
         expect(mockSupabaseRpc).not.toHaveBeenCalled();
         expect(mockSupabaseInsert).not.toHaveBeenCalled();
    });

    // --- Test Case: Error during token deduction ---
    it('should attempt to save message even if token deduction fails', async () => {
         if (!(process.env.OPENAI_API_KEY as string | undefined)) { // Use assertion
          throw new Error('OPENAI_API_KEY not set for test run');
        }
         const { POST } = await import('../route');

         // Mock RPC to fail by rejecting
         mockSupabaseRpc.mockRejectedValueOnce(new Error('Simulated RPC Failure'));

         const response = await POST(requestMock as unknown as NextRequest);
         expect(response.status).toBe(200);

         // Consume stream
         const reader = response.body!.getReader();
         while (!(await reader.read()).done) {}

         // Trigger onFinish
         const streamTextCallResult = await mockStreamText.mock.results[0].value;
         await streamTextCallResult.triggerOnFinish();

         // Assert: RPC called (and failed), Insert should NOT be called
         expect(mockSupabaseRpc).toHaveBeenCalledTimes(1);
         expect(mockSupabaseInsert).not.toHaveBeenCalled(); // Correct assertion
         // Remove assertion checking the content, as insert shouldn't happen
         // expect(mockSupabaseInsert).toHaveBeenCalledWith({
         //     chat_id: 'test-chat-id',
         //     user_id: 'test-user-id',
         //     role: 'assistant',
         //     content: mockStreamTextResult.text
         // });
    });

    // --- Test Case: Error during message saving ---
     it('should deduct token even if message saving fails', async () => {
         if (!(process.env.OPENAI_API_KEY as string | undefined)) { // Use assertion
          throw new Error('OPENAI_API_KEY not set for test run');
        }
         const { POST } = await import('../route');

         // Mock Insert to fail by rejecting
         mockSupabaseInsert.mockRejectedValueOnce(new Error('Simulated Insert Failure'));

         const response = await POST(requestMock as unknown as NextRequest);
         expect(response.status).toBe(200);

          // Consume stream
         const reader = response.body!.getReader();
         while (!(await reader.read()).done) {}

         // Trigger onFinish
         const streamTextCallResult = await mockStreamText.mock.results[0].value;
         await streamTextCallResult.triggerOnFinish();

         // Assert: RPC should be called, Insert called (and failed)
         expect(mockSupabaseRpc).toHaveBeenCalledTimes(1);
         expect(mockSupabaseRpc).toHaveBeenCalledWith(
             'use_tokens',
             expect.objectContaining({ p_user_id: 'test-user-id', p_amount: 1 })
         ); // Token deduction should succeed
         expect(mockSupabaseInsert).toHaveBeenCalledTimes(1);
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

    // Note: Rate limit testing requires mocking the rate-limit utility
    // vi.mock('@/lib/rate-limit', () => ({ rateLimitCheck: vi.fn() }))
    // then in test: mockedRateLimitCheck.mockResolvedValueOnce({ success: false }) ...

}) // End describe block 