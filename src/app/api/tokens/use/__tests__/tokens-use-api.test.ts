import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the admin Supabase client used in this route
vi.mock('@/lib/supabase/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({})),
      })),
      insert: vi.fn(() => ({})),
    })),
    rpc: vi.fn(), // Add mock for the rpc method
  },
}))

// Import AFTER mocking
import { supabaseAdmin } from '@/lib/supabase/supabase-admin'
// Import the actual handler function to test
import { POST } from '../route'
import { NextResponse } from 'next/server'

// Mock necessary modules
// vi.mock('@/lib/supabase-admin');
// vi.mock('@/lib/openai', () => ({
//   openai: {
//     chat: {
//       completions: {
//         create: vi.fn(),
//       },
//     },
//   }
// }));
// vi.mock('next/headers', () => ({
//     cookies: vi.fn().mockReturnValue({
//       get: vi.fn().mockReturnValue({ value: 'test-session-token' }),
//     }),
//   }));
vi.mock('@/lib/supabase-admin');
vi.mock('@/lib/config/openai', () => ({
    getOpenAIClient: vi.fn(() => ({ // Mock the function that returns the client
      chat: {
        completions: {
          create: vi.fn(), // Mock the create method
        },
      },
    })),
  }));

describe('Token Usage API Route (/api/tokens/use)', () => {
  // Get mock instances
  const mockedFrom = vi.mocked(supabaseAdmin.from)
  const mockedRpc = vi.mocked(supabaseAdmin.rpc) // Get mock instance for rpc

  beforeEach(() => {
    vi.clearAllMocks()

    // Remove complex from/select/update/insert mock setup as we're mocking rpc directly
    // mockedFrom.mockImplementation(/* ... */);

    // Default mock: RPC success
    mockedRpc.mockResolvedValue({
      data: true,
      error: null,
      status: 200,
      statusText: 'OK',
      count: null, // RPC doesn't typically return count
    })
  })

  it('should successfully deduct tokens and record transaction via RPC', async () => {
    const userId = 'user-rpc-success'
    const amountToDeduct = 10
    const description = 'Test RPC Call'

    // No need to mock user fetch/update/insert if RPC handles it
    // Ensure rpc mock is set for success (default in beforeEach)

    const request = new Request('http://localhost/api/tokens/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount: amountToDeduct, description }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      success: true,
      message: `${amountToDeduct} tokens deducted successfully.`
    })

    // Verify rpc mock was called correctly
    expect(mockedRpc).toHaveBeenCalledWith('use_tokens', {
      p_user_id: userId,
      p_amount: amountToDeduct,
      p_description: description,
    })
    expect(mockedFrom).not.toHaveBeenCalled() // Ensure old mocks aren't called
  })

  it('should return 400 if RPC indicates insufficient tokens (returns false)', async () => {
    const userId = 'user-rpc-insufficient'
    const amountToDeduct = 100
    const description = 'Insufficient Test RPC Call'

    // Mock RPC returning false
    mockedRpc.mockResolvedValue({
      data: false,
      error: null,
      status: 200, // The RPC call itself succeeded
      statusText: 'OK',
      count: null,
    })

    const request = new Request('http://localhost/api/tokens/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount: amountToDeduct, description }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({ error: 'Insufficient tokens' })
    expect(mockedRpc).toHaveBeenCalledTimes(1)
  })

  it('should return 400 if RPC specific insufficient token error occurs', async () => {
    const userId = 'user-rpc-insufficient-error'
    const amountToDeduct = 100
    const description = 'Insufficient Error Test RPC Call'
    const rpcError = {
      message: 'custom_error_Insufficient tokens_abc',
      code: 'P0001',
      details: '',
      hint: '',
      name: 'MockPostgrestError'
    }

    // Mock RPC returning an error
    mockedRpc.mockResolvedValue({
      data: null,
      error: rpcError,
      status: 400, // Or appropriate error status from DB
      statusText: 'Bad Request',
      count: null,
    })

    const request = new Request('http://localhost/api/tokens/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount: amountToDeduct, description }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({ error: 'Insufficient tokens' })
    expect(mockedRpc).toHaveBeenCalledTimes(1)
  })

  it('should return 500 if RPC call fails with a generic error', async () => {
    const userId = 'user-rpc-error'
    const amountToDeduct = 5
    const description = 'RPC Error Test'
    const rpcError = {
      message: 'Database connection failed',
      code: '50000',
      details: '',
      hint: '',
      name: 'MockPostgrestError'
    }

    // Mock RPC returning a generic error
    mockedRpc.mockResolvedValue({
      data: null,
      error: rpcError,
      status: 500,
      statusText: 'Internal Server Error',
      count: null,
    })

    const request = new Request('http://localhost/api/tokens/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount: amountToDeduct, description }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ error: 'Failed to process token usage' })
    expect(mockedRpc).toHaveBeenCalledTimes(1)
  })

  // Keep the test for missing fields, it doesn't involve DB calls
  it('should return 400 if required fields are missing', async () => {
    const request = new Request('http://localhost/api/tokens/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'test-user' }), // Missing amount and description
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    // Update assertion to match the specific error message from the route
    expect(body).toEqual({ error: 'Missing or invalid required fields (userId, amount > 0, description)' })
    expect(mockedRpc).not.toHaveBeenCalled()
  })

  // Remove or adapt old tests that relied on mocking .from/.select/.update/.insert
  // it('should return 500 if fetching user fails', ...) 
  // it('should return 500 if updating token balance fails', ...)
  // it('should return 200 even if recording transaction fails ...', ...)
}) 