import { vi } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// Mock session data
export const mockSession = {
  access_token: 'mock-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  user: {
    id: 'mock-user-id',
    email: 'test@example.com',
    role: 'authenticated'
  }
}

// Create a mock Supabase client
export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: mockSession.user }, error: null }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  })
}

// Mock cookies function
export const mockCookies = {
  get: vi.fn().mockReturnValue('mock-cookie'),
  set: vi.fn(),
  delete: vi.fn(),
}

// Mock headers
export const mockHeaders = new Headers({
  'cookie': 'sb-access-token=mock-token; sb-refresh-token=mock-refresh-token'
})

// Mock createServerSupabaseClient
export const mockCreateServerSupabaseClient = vi.fn().mockReturnValue(mockSupabaseClient)

// Helper to setup all mocks
export function setupSupabaseMocks() {
  vi.mock('@/lib/supabase-server', () => ({
    createServerSupabaseClient: mockCreateServerSupabaseClient
  }))
  
  vi.mock('next/headers', () => ({
    cookies: () => mockCookies,
    headers: () => mockHeaders
  }))
} 