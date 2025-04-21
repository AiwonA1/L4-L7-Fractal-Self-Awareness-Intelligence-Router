import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the admin Supabase client used in this route
vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({})), // Mock the chained .eq after update
      })),
      insert: vi.fn(() => ({})), // Mock insert for transactions
    })),
  },
}))

// Import AFTER mocking
import { supabaseAdmin } from '@/lib/supabase-admin'
// Import the actual handler function to test
import { POST } from '../src/app/app/api/tokens/use/route'
import { NextResponse } from 'next/server'

describe('Token Usage API Route (/api/tokens/use)', () => {
  // Get mock instances
  const mockedFrom = vi.mocked(supabaseAdmin.from)
  let mockSelect: ReturnType<typeof vi.fn>
  let mockEqSelect: ReturnType<typeof vi.fn>
  let mockSingle: ReturnType<typeof vi.fn>
  let mockUpdate: ReturnType<typeof vi.fn>
  let mockEqUpdate: ReturnType<typeof vi.fn>
  let mockInsert: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    // Create specific mock functions for the chain
    mockSingle = vi.fn()
    mockEqSelect = vi.fn(() => ({ single: mockSingle }))
    mockSelect = vi.fn(() => ({ eq: mockEqSelect }))

    mockEqUpdate = vi.fn(() => Promise.resolve({ error: null })) // Default update success
    mockUpdate = vi.fn(() => ({ eq: mockEqUpdate }))

    mockInsert = vi.fn(() => Promise.resolve({ error: null })) // Default insert success

    // Configure the main 'from' mock
    mockedFrom.mockImplementation((tableName: string) => {
      if (tableName === 'users') {
        return {
          select: mockSelect,
          update: mockUpdate,
        } as any
      }
      if (tableName === 'transactions') {
        return {
          insert: mockInsert,
        } as any
      }
      // Fallback for unexpected table names
      return {
        select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn() })) })),
        update: vi.fn(() => ({ eq: vi.fn() })),
        insert: vi.fn(),
      } as any
    })

    // Default mock implementations
    mockSingle.mockResolvedValue({ data: null, error: { message: 'User not found' } }) // Default: user doesn't exist
  })

  it('should successfully deduct tokens and record transaction', async () => {
    const userId = 'user-with-tokens'
    const initialBalance = 50
    const amountToDeduct = 10
    const description = 'Test LLM Call'

    // Mock user exists with sufficient balance
    mockSingle.mockResolvedValue({ data: { token_balance: initialBalance }, error: null })
    // Mock update success (already default)
    // Mock insert success (already default)

    const request = new Request('http://localhost/api/tokens/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount: amountToDeduct, description }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ success: true, newBalance: initialBalance - amountToDeduct })

    // Verify mocks
    expect(mockedFrom).toHaveBeenCalledWith('users') // Called for select and update
    expect(mockedFrom).toHaveBeenCalledWith('transactions') // Called for insert
    expect(mockSelect).toHaveBeenCalledWith('token_balance')
    expect(mockEqSelect).toHaveBeenCalledWith('id', userId)
    expect(mockSingle).toHaveBeenCalledTimes(1)

    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ token_balance: initialBalance - amountToDeduct }))
    expect(mockEqUpdate).toHaveBeenCalledWith('id', userId)

    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: userId,
      type: 'USE',
      amount: amountToDeduct,
      description: description,
      status: 'COMPLETED'
    }))
  })

  it('should return 400 if user has insufficient tokens', async () => {
    const userId = 'user-low-tokens'
    const initialBalance = 5
    const amountToDeduct = 10
    const description = 'Another Test Call'

    // Mock user exists with insufficient balance
    mockSingle.mockResolvedValue({ data: { token_balance: initialBalance }, error: null })

    const request = new Request('http://localhost/api/tokens/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount: amountToDeduct, description }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({ error: 'Insufficient tokens' })

    // Verify only user fetch was attempted
    expect(mockedFrom).toHaveBeenCalledWith('users')
    expect(mockedFrom).not.toHaveBeenCalledWith('transactions')
    expect(mockSelect).toHaveBeenCalledWith('token_balance')
    expect(mockEqSelect).toHaveBeenCalledWith('id', userId)
    expect(mockSingle).toHaveBeenCalledTimes(1)
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('should return 500 if fetching user fails', async () => {
    const userId = 'user-fetch-error'
    const amountToDeduct = 1
    const description = 'Fetch Error Test'
    const dbError = { message: 'Failed to connect' }

    // Mock user fetch error
    mockSingle.mockResolvedValue({ data: null, error: dbError })

    const request = new Request('http://localhost/api/tokens/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount: amountToDeduct, description }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ error: 'Failed to fetch user data' })
    expect(mockSingle).toHaveBeenCalledTimes(1)
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('should return 500 if updating token balance fails', async () => {
     const userId = 'user-update-error'
    const initialBalance = 50
    const amountToDeduct = 10
    const description = 'Update Error Test'
    const updateError = { message: 'Update constraint violation' }

    // Mock user fetch success
    mockSingle.mockResolvedValue({ data: { token_balance: initialBalance }, error: null })
    // Mock update failure
    mockEqUpdate.mockResolvedValue({ error: updateError })

    const request = new Request('http://localhost/api/tokens/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount: amountToDeduct, description }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ error: 'Failed to update token balance' })
    expect(mockSingle).toHaveBeenCalledTimes(1)
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    expect(mockInsert).not.toHaveBeenCalled() // Should not attempt insert if update fails
  })

   it('should return 200 even if recording transaction fails (token deduction succeeded)', async () => {
    const userId = 'user-trans-error'
    const initialBalance = 50
    const amountToDeduct = 10
    const description = 'Transaction Error Test'
    const transactionError = { message: 'Failed to insert transaction' }

    // Mock user fetch success
    mockSingle.mockResolvedValue({ data: { token_balance: initialBalance }, error: null })
    // Mock update success (default)
    // Mock transaction insert failure
    mockInsert.mockResolvedValue({ error: transactionError })

    const request = new Request('http://localhost/api/tokens/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount: amountToDeduct, description }),
    })

    const response = await POST(request)
    const body = await response.json()

    // Still returns 200 because token deduction is the critical part
    expect(response.status).toBe(200)
    expect(body).toEqual({ success: true, newBalance: initialBalance - amountToDeduct })

    // Verify mocks show insert was attempted
    expect(mockSingle).toHaveBeenCalledTimes(1)
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    expect(mockInsert).toHaveBeenCalledTimes(1)
  })

  it('should return 400 if required fields are missing', async () => {
    const request = new Request('http://localhost/api/tokens/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'some-user' }), // Missing amount and description
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({ error: 'Missing required fields' })
    expect(mockedFrom).not.toHaveBeenCalled()
  })
}) 