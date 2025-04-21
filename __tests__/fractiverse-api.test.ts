import { vi, describe, it, expect, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'
import fs from 'fs'

// Mock dependencies
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            id: 'mock-completion-id',
            choices: [
              {
                index: 0,
                message: {
                  role: 'assistant',
                  content: 'This is a test response from the AI.'
                },
                finish_reason: 'stop'
              }
            ],
            usage: {
              prompt_tokens: 150,
              completion_tokens: 50,
              total_tokens: 200
            }
          })
        }
      }
    }))
  }
})

vi.mock('@/lib/supabase-admin', () => {
  return {
    supabaseAdmin: {
      from: vi.fn().mockImplementation((tableName) => {
        if (tableName === 'users') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockImplementation(() => {
              // Default to successful response
              return { 
                data: { token_balance: 1000 }, 
                error: null 
              }
            })
          }
        }
        if (tableName === 'messages') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockImplementation(() => {
              return { 
                data: [], 
                error: null 
              }
            }),
            insert: vi.fn().mockResolvedValue({ error: null })
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(),
          order: vi.fn(),
          insert: vi.fn()
        }
      })
    }
  }
})

vi.mock('fs', () => {
  return {
    readFileSync: vi.fn().mockReturnValue('Mocked FractiVerse Prompt')
  }
})

vi.mock('path', () => {
  return {
    join: vi.fn().mockReturnValue('/mocked/path/to/prompt.txt')
  }
})

// Mock global fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: vi.fn().mockResolvedValue({ success: true, newBalance: 800 })
})

// Import the API route handler after mocks are set up
import { POST } from '../src/app/app/api/fractiverse/route'

describe('FractiVerse API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should process a valid request and return an AI response', async () => {
    // Arrange
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        message: 'What is a fractal?',
        chatId: 'test-chat-id',
        userId: 'test-user-id'
      })
    }

    // Act
    const response = await POST(mockRequest as unknown as Request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data).toEqual({
      role: 'assistant',
      content: 'This is a test response from the AI.',
      usage: {
        promptTokens: 150,
        completionTokens: 50,
        totalTokens: 200,
        tokensDeducted: 200
      }
    })

    // Verify token deduction API was called
    expect(global.fetch).toHaveBeenCalledWith(expect.any(URL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user-id',
        amount: 200,
        description: 'ChatID: test-chat-id - OpenAI API call'
      }),
    })
  })

  it('should return 400 if required fields are missing', async () => {
    // Arrange
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        // Intentionally missing chatId and userId
        message: 'What is a fractal?'
      })
    }

    // Act
    const response = await POST(mockRequest as unknown as Request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Missing required fields' })
  })

  it('should return 400 if user has insufficient tokens', async () => {
    // Arrange
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        message: 'What is a fractal?',
        chatId: 'test-chat-id',
        userId: 'test-user-id'
      })
    }

    // Reset mocks and set up a simpler mock for insufficient tokens
    vi.resetAllMocks()
    
    // Access the mocked supabaseAdmin directly from the mock
    const supabaseAdminMock = (await vi.importMock<typeof import('@/lib/supabase-admin')>('@/lib/supabase-admin')).supabaseAdmin
    
    // Mock the user data to have insufficient tokens
    supabaseAdminMock.from.mockImplementation((tableName: string) => {
      if (tableName === 'users') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ 
            data: { token_balance: 5 }, // Less than the required 10
            error: null 
          })
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
        order: vi.fn(),
        insert: vi.fn()
      }
    })

    // Act
    const response = await POST(mockRequest as unknown as Request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Insufficient tokens. Minimum 10 tokens required.' })
  })

  it('should handle errors during OpenAI API call', async () => {
    // Arrange
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        message: 'What is a fractal?',
        chatId: 'test-chat-id',
        userId: 'test-user-id'
      })
    }

    // Mock OpenAI error
    const openai = await vi.importMock<typeof import('openai')>('openai')
    openai.default.mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockRejectedValue(new Error('OpenAI API error'))
        }
      }
    }))

    // Act
    const response = await POST(mockRequest as unknown as Request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to process request: OpenAI API error' })
  })

  it('should handle token deduction API errors', async () => {
    // Arrange
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        message: 'What is a fractal?',
        chatId: 'test-chat-id',
        userId: 'test-user-id'
      })
    }

    // Mock token deduction error
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: 'Token deduction failed' })
    })

    // Act
    const response = await POST(mockRequest as unknown as Request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to process token deduction' })
  })
}) 