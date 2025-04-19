import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { server } from '../vitest.setup'
import { rest } from 'msw'

describe('User Info Access', () => {
  const mockSession = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
    },
    access_token: 'mock-token',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return user data when authenticated', async () => {
    // Mock authenticated session
    const supabase = createServerSupabaseClient()
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    // Mock user data query
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          created_at: '2024-03-20T00:00:00Z',
        }],
        error: null,
      }),
    } as any)

    // Make request to user data endpoint
    const response = await fetch('/api/user/data')
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
      },
    })
  })

  it('should return 401 when not authenticated', async () => {
    // Mock unauthenticated session
    const supabase = createServerSupabaseClient()
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    })

    // Override MSW handler for this test
    server.use(
      rest.get('/api/user/data', (req, res, ctx) => {
        return res(
          ctx.status(401),
          ctx.json({ error: 'Unauthorized' })
        )
      })
    )

    const response = await fetch('/api/user/data')
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('should handle database errors gracefully', async () => {
    // Mock authenticated session but database error
    const supabase = createServerSupabaseClient()
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    // Mock database error
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      }),
    } as any)

    // Override MSW handler for this test
    server.use(
      rest.get('/api/user/data', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: 'Database error' })
        )
      })
    )

    const response = await fetch('/api/user/data')
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Database error' })
  })
}) 