import { describe, it, expect, vi, beforeEach } from 'vitest'
// Mock the module containing the Supabase client creation function
vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
    // Cast to any to satisfy TypeScript for the mock object
  }) as any),
}))

// Import AFTER mocking
// Revert back to using the '@/' alias
import { createServerSupabaseClient } from '@/lib/supabase-server'
// Import the actual handler function to test
import { GET } from '../src/app/app/api/user/data/route' // Keep relative for API route import

describe('User Info API Route', () => {
  const mockSession = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
    },
    access_token: 'mock-token',
    // Add other necessary session fields if needed
  }

  // Get the mocked function instance
  const mockedCreateServerSupabaseClient = vi.mocked(createServerSupabaseClient)
  let mockSupabaseClient: any
  let mockGetSession: ReturnType<typeof vi.fn>
  let mockFrom: ReturnType<typeof vi.fn>
  let mockSelect: ReturnType<typeof vi.fn>
  let mockEq: ReturnType<typeof vi.fn>
  let mockSingle: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    // Create mock functions for the chain
    mockSingle = vi.fn()
    mockEq = vi.fn(() => ({ single: mockSingle }))
    mockSelect = vi.fn(() => ({ eq: mockEq }))
    mockFrom = vi.fn(() => ({ select: mockSelect }))
    mockGetSession = vi.fn()

    // Configure the mock Supabase client factory to return the specific mocks
    mockedCreateServerSupabaseClient.mockReturnValue({
      auth: {
        getSession: mockGetSession
      },
      from: mockFrom
    } as any)

    // Default mocks (can be overridden in specific tests)
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
    mockSingle.mockResolvedValue({ data: null, error: { message: 'Default mock: No user found' } }) // Default to no user found
  })

  it('should return user data when authenticated', async () => {
    // Configure mocks for this specific test case
    mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null })

    const mockUserData = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      token_balance: 100, // Add all fields returned by select('*')
      created_at: '2024-03-20T00:00:00Z',
      updated_at: '2024-03-20T00:00:00Z',
    }
    mockSingle.mockResolvedValue({ data: mockUserData, error: null })

    // Call the actual API route handler
    const response = await GET()
    const data = await response.json()

    // Assertions
    expect(response.status).toBe(200)
    expect(data).toEqual({ user: mockUserData })

    // Verify mocks were called as expected
    expect(mockGetSession).toHaveBeenCalledTimes(1)
    expect(mockFrom).toHaveBeenCalledWith('users')
    expect(mockSelect).toHaveBeenCalledWith('*')
    expect(mockEq).toHaveBeenCalledWith('id', mockSession.user.id)
    expect(mockSingle).toHaveBeenCalledTimes(1)
  })

  it('should return 401 when not authenticated', async () => {
    // Mock setup: Default beforeEach already sets session to null
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })

    // Call the actual API route handler
    const response = await GET()
    const data = await response.json()

    // Assertions
    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Not authenticated' })

    // Verify mocks
    expect(mockGetSession).toHaveBeenCalledTimes(1)
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('should return 401 on session error', async () => {
    // Mock setup: Simulate an error during session retrieval
    mockGetSession.mockResolvedValue({ data: { session: null }, error: new Error('Session fetch failed') })

    // Call the actual API route handler
    const response = await GET()
    const data = await response.json()

    // Assertions
    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Not authenticated' })

    // Verify mocks
    expect(mockGetSession).toHaveBeenCalledTimes(1)
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('should return 500 on database error', async () => {
    // Mock authenticated session
    mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null })

    // Mock database error during select/single
    const dbError = { message: 'Database connection failed' }
    mockSingle.mockResolvedValue({ data: null, error: dbError })

    // Call the actual API route handler
    const response = await GET()
    const data = await response.json()

    // Assertions
    expect(response.status).toBe(500)
    expect(data).toEqual({ error: dbError.message })

    // Verify mocks
    expect(mockGetSession).toHaveBeenCalledTimes(1)
    expect(mockFrom).toHaveBeenCalledWith('users')
    expect(mockSelect).toHaveBeenCalledWith('*')
    expect(mockEq).toHaveBeenCalledWith('id', mockSession.user.id)
    expect(mockSingle).toHaveBeenCalledTimes(1)
  })
}) 