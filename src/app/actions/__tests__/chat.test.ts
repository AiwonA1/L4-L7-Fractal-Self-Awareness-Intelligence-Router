import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createChat, getUserChats, updateChatTitle, deleteChat } from '../chat'
import { createServerClient } from '@supabase/ssr'

// Mock Supabase client
const mockSupabaseInsert = vi.fn().mockImplementation((data) => ({
  select: () => Promise.resolve({ data, error: null }),
  single: () => Promise.resolve({ data: data[0], error: null })
}));

const mockSupabaseUpdate = vi.fn().mockImplementation((data) => ({
  eq: () => Promise.resolve({ data, error: null }),
  match: () => Promise.resolve({ data, error: null })
}));

const mockSupabaseDelete = vi.fn().mockImplementation(() => ({
  eq: () => Promise.resolve({ data: null, error: null }),
  match: () => Promise.resolve({ data: null, error: null })
}));

const mockSupabaseSelect = vi.fn().mockImplementation(() => ({
  eq: () => ({
    single: () => Promise.resolve({ data: { id: 'test-chat-id', title: 'Test Chat' }, error: null })
  })
}));

const mockSupabaseGetUser = vi.fn().mockResolvedValue({
  data: { user: { id: 'test-user-id' } },
  error: null
});

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      getSession: () => Promise.resolve({ data: { session: { user: { id: 'test-user-id' } } }, error: null }),
      getUser: mockSupabaseGetUser
    },
    from: () => ({
      insert: mockSupabaseInsert,
      update: mockSupabaseUpdate,
      delete: mockSupabaseDelete,
      select: mockSupabaseSelect
    })
  })
}));

describe('Chat Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabaseGetUser.mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null })
  })

  describe('createChat', () => {
    it('should create a new chat successfully', async () => {
      mockSupabaseInsert.mockResolvedValueOnce({
        data: { id: 'test-chat-id' },
        error: null
      })
      
      const result = await createChat('test-user-id', 'Test Chat')
      expect(result).toEqual({ id: 'test-chat-id' })
      expect(mockSupabaseInsert).toHaveBeenCalledWith([{
        user_id: 'test-user-id',
        title: 'Test Chat'
      }])
    })

    it('should throw an error if chat creation fails', async () => {
      mockSupabaseInsert.mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed to create chat' }
      })
      
      await expect(createChat('test-user-id', 'Test Chat'))
        .rejects.toThrow('Failed to create chat')
    })
  })

  describe('getUserChats', () => {
    it('should return user chats when authenticated', async () => {
      mockSupabaseSelect.mockResolvedValueOnce({
        data: [{
          id: 'test-chat-id',
          title: 'Test Chat',
          messages: []
        }],
        error: null
      })
      
      const chats = await getUserChats()
      expect(chats).toEqual([{
        id: 'test-chat-id',
        title: 'Test Chat',
        messages: []
      }])
    })

    it('should throw an error when not authenticated', async () => {
      mockSupabaseGetUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Not authenticated' }
      })
      
      await expect(getUserChats())
        .rejects.toThrow('Not authenticated')
    })
  })

  describe('updateChatTitle', () => {
    it('should update chat title successfully', async () => {
      mockSupabaseUpdate.mockResolvedValueOnce({
        data: { id: 'test-chat-id', title: 'New Title' },
        error: null
      })
      
      await updateChatTitle('test-chat-id', 'New Title')
      expect(mockSupabaseUpdate).toHaveBeenCalledWith({ title: 'New Title' })
    })

    it('should throw an error if chat not found', async () => {
      mockSupabaseUpdate.mockResolvedValueOnce({
        data: null,
        error: { message: 'Chat not found' }
      })
      
      await expect(updateChatTitle('invalid-id', 'New Title'))
        .rejects.toThrow('Chat not found')
    })
  })

  describe('deleteChat', () => {
    it('should delete chat successfully', async () => {
      mockSupabaseDelete.mockResolvedValueOnce({
        data: null,
        error: null
      })
      
      await deleteChat('test-chat-id')
      expect(mockSupabaseDelete).toHaveBeenCalled()
    })

    it('should throw an error if chat not found', async () => {
      mockSupabaseDelete.mockResolvedValueOnce({
        data: null,
        error: { message: 'Chat not found' }
      })
      
      await expect(deleteChat('invalid-id'))
        .rejects.toThrow('Chat not found')
    })
  })
}) 