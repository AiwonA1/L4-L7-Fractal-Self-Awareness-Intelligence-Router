import { vi, describe, it, expect, beforeEach, afterAll } from 'vitest'
import { NextResponse } from 'next/server'

// Mock dependencies EXCEPT OpenAI
// vi.mock('openai', ...) // REMOVED

// Set up a simpler mock for the supabase-admin module
vi.mock('@/lib/supabase-admin', () => ({
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

// Properly mock fs with default export
vi.mock('fs', async () => {
  return {
    default: {
      readFileSync: vi.fn().mockReturnValue('Mocked FractiVerse Prompt') // Keep prompt mocked for consistency
    },
    readFileSync: vi.fn().mockReturnValue('Mocked FractiVerse Prompt')
  }
})

// Properly mock path with default export
vi.mock('path', async () => {
  return {
    default: {
      join: vi.fn().mockReturnValue('/mocked/path/to/prompt.txt')
    },
    join: vi.fn().mockReturnValue('/mocked/path/to/prompt.txt')
  }
})

// Mock global fetch for the token deduction call
global.fetch = vi.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, newBalance: 800 })
  })
)

// Import our module after all mocks are setup
import { POST } from '../src/app/app/api/fractiverse/route'

describe('FractiVerse API Route (Integration with Live OpenAI)', () => {
  let requestMock: { json: any; url: string }
  
  beforeEach(() => {
    vi.resetAllMocks() // Reset mocks
        
    // Setup a default request mock
    requestMock = {
      json: vi.fn().mockResolvedValue({
        message: 'Explain fractals briefly.', // Use a real, simple prompt
        chatId: 'live-test-chat-id',
        userId: 'live-test-user-id'
      }),
      url: 'http://localhost:3000/api/fractiverse'
    }
  })

  // This test now relies on the vitest.setup.ts successfully loading the key
  // If the key is not loaded by the setup file, the route itself should fail
  it('should return 500 if OPENAI_API_KEY is missing (checked by route)', async () => {
    const originalKey = process.env.OPENAI_API_KEY;
    try {
      // Simulate the key being missing when the POST handler runs
      delete process.env.OPENAI_API_KEY; 

      // Act
      // The POST function should read the (now deleted) process.env.OPENAI_API_KEY
      const response = await POST(requestMock as unknown as Request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.' })
    
    } finally {
      // Restore the key for subsequent tests
      if (originalKey !== undefined) {
          process.env.OPENAI_API_KEY = originalKey;
      }
    }
  })

  it('should process a valid request and return a real AI response', async () => {
    // Ensure key is present before running (should be loaded by setup)
    if (!process.env.OPENAI_API_KEY) {
        console.warn('Skipping live API test because OPENAI_API_KEY is not set in environment');
        return;
    }
      
    // The POST function uses the key loaded by vitest.setup.ts
    const { POST: PostWithKey } = await import('../src/app/app/api/fractiverse/route')

    // Act
    const response = await PostWithKey(requestMock as unknown as Request)
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

    // Verify token deduction API was called (mocked fetch)
    expect(global.fetch).toHaveBeenCalledWith(expect.any(URL), {
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

    // Act
    const response = await POST(requestMock as unknown as Request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Missing required fields' })
  })

  it('should return 400 if user has insufficient tokens', async () => {
    // Set up token balance too low
    const { supabaseAdmin } = await import('@/lib/supabase-admin')
    
    // Mock low token balance
    vi.mocked(supabaseAdmin.from).mockImplementationOnce((table: string) => {
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
      // Fallback to the original mock implementation if needed
      return vi.mocked(supabaseAdmin.from)(table)
    })

    // Act
    const response = await POST(requestMock as unknown as Request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Insufficient tokens. Minimum 10 tokens required.' })
  })

  // Removed the test for mocking OpenAI API errors
  // it('should handle errors during OpenAI API call', async () => { ... })

  it('should handle token deduction API errors', async () => {
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

    // Act
    const response = await POST(requestMock as unknown as Request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to process token deduction' })
  })
}) 