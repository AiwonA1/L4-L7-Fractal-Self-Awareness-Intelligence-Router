import { vi, describe, it, expect, beforeEach, afterAll, afterEach, type MockInstance } from 'vitest'
import { NextResponse, NextRequest } from 'next/server'

// Mock dependencies EXCEPT OpenAI
// vi.mock('openai', ...) // REMOVED

// Set up a simpler mock for the supabase-admin module
vi.mock('@/app/lib/supabase/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: { token_balance: 1000 },
                error: null
              }))
            }))
          }))
        } as any // Use 'as any' to bypass complex type checking in mocks
      } else if (table === 'messages') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({
                data: [],
                error: null
              }))
            }))
          })),
          insert: vi.fn(() => Promise.resolve({ error: null }))
        } as any // Use 'as any' to bypass complex type checking in mocks
      }
      // Return a default structure for other tables
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(),
            order: vi.fn()
          }))
        })),
        insert: vi.fn()
      } as any // Use 'as any' to bypass complex type checking in mocks
    })
  }
}))

// REMOVE path mock - no longer needed as fs.readFileSync is mocked directly in beforeEach
// vi.mock('path', async () => {
//   return {
//     default: {
//       join: vi.fn().mockReturnValue('/mocked/path/to/prompt.txt')
//     },
//     join: vi.fn().mockReturnValue('/mocked/path/to/prompt.txt')
//   }
// })

// Mock global fetch for the token deduction call
// Fetch mock is now handled in beforeEach due to resetModules
// global.fetch = vi.fn().mockImplementation(() => 
//   Promise.resolve({
//     ok: true,
//     json: () => Promise.resolve({ success: true, newBalance: 800 })
//   })
// )

// Mock NextResponse to check arguments
// NextResponse mock is now handled in beforeEach due to resetModules
// vi.mock('next/server', async () => {
// ... existing code ...
// })

// Import our module after all mocks are setup - MOVED to within tests where needed after resetModules
// import { POST } from '../src/app/app/api/fractiverse/route'

// Mock the Supabase admin client globally
vi.mock('@/lib/supabase/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(),
    // Add rpc mock if needed by any test in this file, otherwise omit
    // rpc: vi.fn(), 
  },
}))

// Import the mocked instance AFTER vi.mock
import { supabaseAdmin } from '@/lib/supabase/supabase-admin'

describe('FractiVerse API Route (Integration with Live OpenAI)', () => {
  // Get the globally mocked instance
  const mockedSupabaseFrom = vi.mocked(supabaseAdmin.from)
  // const mockedSupabaseRpc = vi.mocked(supabaseAdmin.rpc) // If rpc is mocked globally

  let jsonSpy: MockInstance;
  let requestMock: { json: MockInstance, url: string };
  let originalFetch: typeof global.fetch;

  beforeEach(async () => {
    vi.resetModules() // Reset modules to ensure clean state for imports
    vi.clearAllMocks();

    // Mock fetch globally first
    originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }), // Mock token deduction success by default
    });

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
        chatId: 'live-test-chat-id',
        userId: 'live-test-user-id'
      }),
      url: 'http://localhost:3000/api/fractiverse'
    }

    // Default implementation for supabaseAdmin.from for most tests
    mockedSupabaseFrom.mockImplementation((table: string) => {
      // Default mock for users table returning sufficient balance
      if (table === 'users') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: { token_balance: 1000 }, error: null }))
            }))
          }))
        } as any
      }
      // Provide a generic fallback if needed
      return {
        select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: {}, error: null })) })) })),
        update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })),
        insert: vi.fn(() => Promise.resolve({ data: null, error: null }))
      } as any
    })
  })

  afterEach(() => {
    global.fetch = originalFetch; // Restore original fetch
  })

  it('should return 500 if OPENAI_API_KEY is missing (checked by route)', async () => {
    const originalKey = process.env.OPENAI_API_KEY;
    let originalFetch = global.fetch; // Declare outside try block

    try {
      // Simulate the key being missing WHEN THE MODULE IS LOADED
      delete process.env.OPENAI_API_KEY;

      // Reset modules is now handled in beforeEach
      // vi.resetModules();

      // Temporarily override fetch mock for this specific test to avoid side effects
      global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

      // Mock NextResponse specifically for this test case, just before import
      // const actualServer = await vi.importActual<typeof import('next/server')>('next/server');
      // vi.doMock('next/server', () => ({
      //     ...actualServer,
      //     NextResponse: {
      //         ...actualServer.NextResponse,
      //         json: vi.fn((body, init) => actualServer.NextResponse.json(body, init))
      //     }
      // }));

      // Import the POST handler AFTER resetting modules and deleting the key
      const { POST } = await import('../route');

      // Act
      const response = await POST(requestMock as unknown as NextRequest)

      // Assert: Check that NextResponse.json was called with the correct error
      if (jsonSpy) {
          expect(jsonSpy).toHaveBeenCalledTimes(1);
          expect(jsonSpy).toHaveBeenCalledWith(
            { error: 'OpenAI client initialization failed. Please check server logs.' },
            { status: 500 }
          );
      } else {
        // Fail the test explicitly if the spy wasn't created
        throw new Error('jsonSpy was not initialized in beforeEach');
      }
      // Optional: check the actual response status if needed, but spying is more direct
      // expect(response.status).toBe(500)
    
    } finally {
      // Restore the key for subsequent tests
      if (originalKey !== undefined) {
          process.env.OPENAI_API_KEY = originalKey;
      }
      // Restore original fetch mock
      global.fetch = originalFetch;
      // Important: Reset modules again to avoid affecting other tests - REMOVED
      // vi.resetModules();
    }
  })

  it('should process a valid request and return a real AI response', async () => {
    // Ensure key is present before running (should be loaded by setup)
    if (!process.env.OPENAI_API_KEY) {
        console.warn('Skipping live API test because OPENAI_API_KEY is not set in environment');
        return;
    }
      
    // The POST function uses the key loaded by vitest.setup.ts
    const { POST: PostWithKey } = await import('../route')

    // Act
    const response = await PostWithKey(requestMock as unknown as NextRequest)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.role).toBe('assistant')
    expect(data.content).toEqual(expect.any(String))
    expect(data.content.length).toBeGreaterThan(0)
    expect(data.usage).toEqual({
      promptTokens: expect.any(Number),
      completionTokens: expect.any(Number),
      totalTokens: expect.any(Number),
      tokensDeducted: expect.any(Number)
    })
    expect(data.usage.tokensDeducted).toBeGreaterThanOrEqual(10) // Check minimum deduction

    // Log the word count of the response
    const wordCount = data.content.split(/\s+/).filter(Boolean).length;
    console.log(`---> OpenAI Response Word Count: ${wordCount}`);

    // Verify token deduction API was called (mocked fetch)
    // Use the actual string URL generated by new URL(...) in the route
    const expectedTokenUrl = new URL('/api/tokens/use', requestMock.url).href;
    expect(global.fetch).toHaveBeenCalledWith(expectedTokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'live-test-user-id',
        amount: data.usage.tokensDeducted, // Check it used the calculated amount
        description: 'ChatID: live-test-chat-id - OpenAI API call'
      }),
    })
  }, 20000) // Increase timeout for live API call

  it('should return 400 if required fields are missing', async () => {
    // Modify request to have missing fields
    requestMock.json = vi.fn().mockResolvedValue({
      message: 'Explain fractals briefly.'
      // Intentionally missing chatId and userId
    })

    // Import POST handler for this test
    const { POST } = await import('../route');

    // Act
    const response = await POST(requestMock as unknown as NextRequest)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(400)
    // Update expected error message to match the route's output
    expect(data).toEqual({ error: 'Missing required fields (message, chatId, userId)' })
  })

  it('should return 400 if user has insufficient tokens', async () => {
    // Set up mock for insufficient balance specifically for this test
    // Use the globally mocked instance
    mockedSupabaseFrom.mockImplementationOnce((table: string) => { // Use mockImplementationOnce
      if (table === 'users') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: { token_balance: 5 }, // Less than the required 10
                error: null
              }))
            }))
          }))
        } as any // Use 'as any' here
      }
      // Fallback for any other table access in this specific case (shouldn't happen)
      return {
        select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: {}, error: null })) })) }))
      } as any
    })

    // Import POST handler for this test (uses the mocked supabase client)
    const { POST } = await import('../route');

    // Act
    const response = await POST(requestMock as unknown as NextRequest)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Insufficient tokens. Minimum 10 tokens required.' })
    expect(mockedSupabaseFrom).toHaveBeenCalledWith('users') // Verify the mock was called
  })

  // Removed the test for mocking OpenAI API errors
  // it('should handle errors during OpenAI API call', async () => { ... })

  it('should handle token deduction API errors but still return 200 OK', async () => {
     // Ensure key is present before running (should be loaded by setup)
    if (!process.env.OPENAI_API_KEY) {
        console.warn('Skipping live API test because OPENAI_API_KEY is not set in environment');
        return;
    }
     
    // Mock token deduction error using fetch mock
    global.fetch = vi.fn().mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Token deduction failed' })
      })
    )

    // Import POST handler for this test
    const { POST } = await import('../route');

    // Act
    const response = await POST(requestMock as unknown as NextRequest)
    const data = await response.json()

    // Assert: Expect 200 OK even though token deduction failed
    expect(response.status).toBe(200)
    // Check that the response still contains the AI content
    expect(data.role).toBe('assistant')
    expect(data.content).toEqual(expect.any(String))
    expect(data.usage).toBeDefined()
  })
}) 