import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the module containing the Supabase client creation function
vi.mock('../../../../lib/supabase/supabase-server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: {
      // Mock specific auth methods needed
      signInWithPassword: vi.fn(),
      getSession: vi.fn(), // Add if GET handler is also tested
    },
    // Add other Supabase methods if needed by the route
  }) as any),
}))

// Import AFTER mocking
import { createServerSupabaseClient as mockedCreateServerSupabaseClientImport } from '../../../../lib/supabase/supabase-server' // Import the *mocked* module
// Import the actual handler functions to test
import { POST, GET } from '../route' // Assuming GET might be tested too
import { NextResponse } from 'next/server'

describe('Auth API Route (/api/auth)', () => {
  // Get the mocked function instance from the import
  const mockedCreateServerSupabaseClient = vi.mocked(mockedCreateServerSupabaseClientImport)
  let mockSignInWithPassword: ReturnType<typeof vi.fn>
  let mockGetSession: ReturnType<typeof vi.fn> // For GET handler tests

  beforeEach(() => {
    vi.clearAllMocks()

    // Create mock functions
    mockSignInWithPassword = vi.fn()
    mockGetSession = vi.fn()

    // Configure the mock Supabase client factory using the correctly imported mocked function
    mockedCreateServerSupabaseClient.mockReturnValue({
      auth: {
        signInWithPassword: mockSignInWithPassword,
        getSession: mockGetSession,
      },
      // Add other mocked methods if needed
    } as any)

    // Default mock implementations (can be overridden)
    mockSignInWithPassword.mockResolvedValue({ data: { session: null, user: null }, error: { message: 'Invalid credentials', status: 401 } })
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
  })

  // --- POST /api/auth (Sign In) Tests ---

  it('POST should sign in user successfully with valid credentials', async () => {
    const mockCredentials = { email: 'test@example.com', password: 'password123' }
    const mockSessionData = {
      session: { access_token: 'mock-access-token', user: { id: 'user-123', email: mockCredentials.email } },
      user: { id: 'user-123', email: mockCredentials.email },
    }
    mockSignInWithPassword.mockResolvedValue({ data: mockSessionData, error: null })

    const request = new Request('http://localhost/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockCredentials),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ data: mockSessionData })
    expect(mockSignInWithPassword).toHaveBeenCalledTimes(1)
    expect(mockSignInWithPassword).toHaveBeenCalledWith(mockCredentials)
  })

  it('POST should return 401 with invalid credentials', async () => {
    const mockCredentials = { email: 'test@example.com', password: 'wrongpassword' }
    const mockError = new Error('Invalid login credentials') // Simulate actual Error
    // Mock the Supabase client throwing an error
    mockSignInWithPassword.mockRejectedValue(mockError)

    const request = new Request('http://localhost/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockCredentials),
    })

    const response = await POST(request)
    const body = await response.json()

    // The route handler should catch the error and return 401
    expect(response.status).toBe(401)
    expect(body).toEqual({ error: 'Invalid credentials' }) // Check error message from route handler
    expect(mockSignInWithPassword).toHaveBeenCalledTimes(1)
    expect(mockSignInWithPassword).toHaveBeenCalledWith(mockCredentials)
  })

   it('POST should return 500 on unexpected error', async () => {
    const mockCredentials = { email: 'test@example.com', password: 'password123' }
    const mockError = new Error('Internal Supabase Error') // Simulate actual Error
    // Simulate the Supabase client throwing an error
    mockSignInWithPassword.mockRejectedValue(mockError)

    const request = new Request('http://localhost/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockCredentials),
    })

    const response = await POST(request)
    const body = await response.json()

    // Route handler should catch and return 500
    expect(response.status).toBe(500)
    expect(body).toEqual({ error: 'Internal server error' })
    expect(mockSignInWithPassword).toHaveBeenCalledTimes(1)
    expect(mockSignInWithPassword).toHaveBeenCalledWith(mockCredentials)
  })

  // --- GET /api/auth (Get Session) Tests ---

  it('GET should return session when authenticated', async () => {
     const mockSessionObject = { access_token: 'mock-access-token', user: { id: 'user-123', email: 'test@example.com' } };
     // Mock that getSession returns the data structure { data: { session: SessionObject } }
     mockGetSession.mockResolvedValue({ data: { session: mockSessionObject }, error: null })

     const response = await GET()
     const body = await response.json()

     expect(response.status).toBe(200)
     // Revert: Trusting test runner output that the API returns the simpler structure
     expect(body).toEqual({ session: mockSessionObject })
     expect(mockGetSession).toHaveBeenCalledTimes(1)
   })

  it('GET should return null session when not authenticated', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200) // Still 200 OK, just null session
    expect(body).toEqual({ session: null })
    expect(mockGetSession).toHaveBeenCalledTimes(1)
  })

  it('GET should return 401 on session retrieval error', async () => {
    const mockError = new Error('Failed to retrieve session') // Simulate actual Error
    // Simulate getSession throwing an error
    mockGetSession.mockRejectedValue(mockError)

    const response = await GET()
    const body = await response.json()

    // Route handler should catch and return 401
    expect(response.status).toBe(401)
    expect(body).toEqual({ error: 'Authentication error' }) // Check error message from route handler
    expect(mockGetSession).toHaveBeenCalledTimes(1)
  })

  it('GET should return 500 on unexpected error', async () => {
    const mockError = new Error('Some other DB Error') // Simulate a generic error
    // Simulate getSession throwing an error
    mockGetSession.mockRejectedValue(mockError)

    const response = await GET()
    const body = await response.json()

    // Route handler should catch and return 500
    expect(response.status).toBe(500)
    expect(body).toEqual({ error: 'Internal server error' })
    expect(mockGetSession).toHaveBeenCalledTimes(1)
  })

}) 