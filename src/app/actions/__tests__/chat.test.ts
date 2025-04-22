import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server'
import { revalidatePath } from 'next/cache'
import {
  createChat,
  getUserChats,
  getChatById,
  createMessage,
  updateChatTitle,
  deleteChat,
} from '../chat'

describe('Chat Actions', () => {
  const mockSupabase = {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
    from: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createServerSupabaseClient).mockReturnValue(mockSupabase as any)
  })

  describe('createChat', () => {
    it('should create a new chat successfully', async () => {
      const mockChat = { id: '1', title: 'Test Chat', user_id: 'user1' }
      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockChat, error: null }),
      }
      mockSupabase.from.mockReturnValue(mockFrom)

      const result = await createChat('user1', 'Test Chat')

      expect(mockSupabase.from).toHaveBeenCalledWith('chats')
      expect(mockFrom.insert).toHaveBeenCalledWith({
        user_id: 'user1',
        title: 'Test Chat',
      })
      expect(result).toEqual(mockChat)
    })

    it('should throw an error if chat creation fails', async () => {
      const mockError = new Error('Database error')
      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }
      mockSupabase.from.mockReturnValue(mockFrom)

      await expect(createChat('user1', 'Test Chat')).rejects.toThrow('Database error')
    })
  })

  describe('getUserChats', () => {
    it('should return user chats when authenticated', async () => {
      const mockSession = { user: { id: 'user1' } }
      const mockChats = [
        { id: '1', title: 'Chat 1', messages: [] },
        { id: '2', title: 'Chat 2', messages: [] },
      ]
      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } })
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockChats, error: null }),
      }
      mockSupabase.from.mockReturnValue(mockFrom)

      const result = await getUserChats()

      expect(mockSupabase.from).toHaveBeenCalledWith('chats')
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user1')
      expect(result).toEqual(mockChats)
    })

    it('should throw an error when not authenticated', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } })

      await expect(getUserChats()).rejects.toThrow('Not authenticated')
    })
  })

  describe('updateChatTitle', () => {
    it('should update chat title successfully', async () => {
      const mockSession = { user: { id: 'user1' } };
      const expectedResult = { id: '1', title: 'Updated Title', user_id: 'user1' };
      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } });

      const mockUpdate = vi.fn().mockResolvedValue({ error: null });

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({ data: { id: '1' }, error: null }),
        update: vi.fn().mockImplementation(() => ({
          eq: vi.fn().mockImplementation(() => ({
            eq: mockUpdate,
          })),
        })),
      };

      mockSupabase.from.mockReturnValue(mockFrom as any);

      const result = await updateChatTitle('1', 'Updated Title');

      expect(mockSupabase.from).toHaveBeenCalledWith('chats');
      expect(mockFrom.update).toHaveBeenCalledWith({ title: 'Updated Title' });
      expect(mockUpdate).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if chat not found', async () => {
      const mockSession = { user: { id: 'user1' } }
      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } })
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
      }
      mockSupabase.from.mockReturnValue(mockFrom as any)

      await expect(updateChatTitle('1', 'Updated Title')).rejects.toThrow(
        'Chat not found or access denied'
      )
    })
  })

  describe('deleteChat', () => {
    it('should delete chat successfully', async () => {
      const mockSession = { user: { id: 'user1' } }
      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } })

      const mockEqAfterDelete = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockImplementation(() => ({
          eq: mockEqAfterDelete 
      }));

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({ data: { id: '1' }, error: null }),
        delete: mockDelete,
      }
      mockSupabase.from.mockReturnValue(mockFrom as any)

      const result = await deleteChat('1')

      expect(mockSupabase.from).toHaveBeenCalledWith('chats')
      expect(mockDelete).toHaveBeenCalled()
      expect(mockEqAfterDelete).toHaveBeenCalledWith('id', '1')
      expect(result).toBe(true)
    })

    it('should throw an error if chat not found', async () => {
      const mockSession = { user: { id: 'user1' } }
      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } })
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
      mockSupabase.from.mockReturnValue(mockFrom)

      await expect(deleteChat('1')).rejects.toThrow('Chat not found or access denied')
    })
  })
}) 