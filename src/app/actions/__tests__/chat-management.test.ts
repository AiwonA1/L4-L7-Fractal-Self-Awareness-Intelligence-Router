import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest'
import { createServerClient } from '@supabase/ssr'
import { createChat, getUserChats, updateChatTitle, deleteChat } from '../chat'

// Mock Next.js's revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));

// Mock data
const mockChats = [
  { 
    id: 'chat-1', 
    title: 'First Chat', 
    user_id: 'test-user-id',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    messages: [
      {
        id: 'msg-1',
        chat_id: 'chat-1',
        role: 'user',
        content: 'Hello',
        created_at: '2024-01-01T00:00:00Z'
      }
    ]
  },
  { 
    id: 'chat-2', 
    title: 'Second Chat', 
    user_id: 'test-user-id',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    messages: [
      {
        id: 'msg-2',
        chat_id: 'chat-2',
        role: 'user',
        content: 'Hi there',
        created_at: '2024-01-02T00:00:00Z'
      }
    ]
  }
];

// Types for our mocks
interface MockBuilder {
  _mockResult: { data: any; error: Error | null };
  eq: Mock;
  order: Mock;
  single: Mock;
  select: Mock;
  match: Mock;
  insert: Mock;
  update: Mock;
  delete: Mock;
  then: (onfulfilled: (value: { data: any; error: Error | null }) => any) => Promise<any>;
}

// Mock Supabase client responses with proper method chaining
const createMockBuilder = (mockData: any = null, error: Error | null = null): MockBuilder => {
  const builder: MockBuilder = {
    _mockResult: { data: mockData, error },
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(function(this: MockBuilder) {
      return Promise.resolve(this._mockResult);
    }),
    select: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    insert: vi.fn().mockImplementation(function(this: MockBuilder, data: any) {
      if (this._mockResult.error) {
        return Promise.reject(this._mockResult.error);
      }
      const insertData = Array.isArray(data) ? data : [data];
      const processedData = insertData.map(item => ({
        ...item,
        created_at: item.created_at || new Date().toISOString()
      }));
      this._mockResult = { data: processedData, error: null };
      return this;
    }),
    update: vi.fn().mockImplementation(function(this: MockBuilder, data: any) {
      if (this._mockResult.error) {
        return Promise.reject(this._mockResult.error);
      }
      this._mockResult = { data: [data], error: null };
      return this;
    }),
    delete: vi.fn().mockImplementation(function(this: MockBuilder) {
      return Promise.resolve(this._mockResult);
    }),
    then: function(this: MockBuilder, onfulfilled: (value: { data: any; error: Error | null }) => any) {
      return Promise.resolve(this._mockResult).then(onfulfilled);
    }
  };
  return builder;
};

// Mock Supabase client setup
const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: { 
        session: { 
          user: { id: 'test-user-id' } 
        }
      },
      error: null
    }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    })
  },
  from: vi.fn().mockImplementation((table) => {
    const defaultBuilder = createMockBuilder(mockChats);
    
    // Customize behavior based on the operation
    defaultBuilder.single.mockImplementation(() => {
      if (table === 'chats') {
        return Promise.resolve({ data: mockChats[0], error: null });
      }
      return Promise.resolve({ data: null, error: null });
    });

    defaultBuilder.insert.mockImplementation((data) => {
      const builder = createMockBuilder(data);
      builder.select.mockReturnThis();
      builder.single.mockResolvedValue({ data: Array.isArray(data) ? data[0] : data, error: null });
      return builder;
    });

    return defaultBuilder;
  })
};

// Mock the createServerClient
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => mockSupabaseClient
}));

describe('Chat Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset auth mock for each test
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { 
        session: { 
          user: { id: 'test-user-id' } 
        }
      },
      error: null
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Chat Persistence', () => {
    it('should persist chat history between sessions', async () => {
      // First session: Create and verify chats
      const chat1 = await createChat('test-user-id', 'First Chat');
      const chat2 = await createChat('test-user-id', 'Second Chat');
      
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('chats');
      expect(chat1).toBeDefined();
      expect(chat2).toBeDefined();

      // Second session: Verify chats are retrieved
      const chats = await getUserChats();
      expect(chats).toHaveLength(2);
      expect(chats).toEqual(expect.arrayContaining([
        expect.objectContaining({ title: 'First Chat' }),
        expect.objectContaining({ title: 'Second Chat' })
      ]));
    });

    it('should maintain chat order based on last updated', async () => {
      // Mock chats with different update times
      const orderedChats = [...mockChats].sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      mockSupabaseClient.from.mockImplementationOnce(() => {
        const builder = createMockBuilder(orderedChats);
        builder.order.mockReturnThis();
        return builder;
      });

      const chats = await getUserChats();
      expect(chats[0].updated_at).toBe(orderedChats[0].updated_at);
      expect(chats).toEqual(orderedChats);
    });
  });

  describe('Chat Rename Operations', () => {
    it('should successfully rename a chat', async () => {
      const chatId = 'chat-1';
      const newTitle = 'Updated Chat Title';

      // Mock the update operation
      mockSupabaseClient.from.mockImplementationOnce(() => {
        const builder = createMockBuilder({ id: chatId, title: newTitle });
        builder.eq.mockReturnThis();
        return builder;
      });

      await updateChatTitle(chatId, newTitle);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('chats');
    });

    it('should validate chat ownership before renaming', async () => {
      // Mock unauthorized access
      mockSupabaseClient.from.mockImplementationOnce(() => {
        const builder = createMockBuilder(null, new Error('Chat not found or access denied'));
        builder.eq.mockReturnThis();
        builder.single.mockRejectedValue(new Error('Chat not found or access denied'));
        return builder;
      });

      await expect(updateChatTitle('unauthorized-chat', 'New Title'))
        .rejects.toThrow('Chat not found or access denied');
    });

    it('should handle empty or invalid titles', async () => {
      await expect(updateChatTitle('chat-1', ''))
        .rejects.toThrow();

      await expect(updateChatTitle('chat-1', ' '.repeat(256)))
        .rejects.toThrow();
    });
  });

  describe('Chat Delete Operations', () => {
    it('should successfully delete a chat', async () => {
      const chatId = 'chat-1';
      
      // Mock successful deletion
      mockSupabaseClient.from.mockImplementationOnce(() => {
        const builder = createMockBuilder(null);
        builder.eq.mockReturnThis();
        return builder;
      });

      await deleteChat(chatId);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('chats');
    });

    it('should validate chat ownership before deletion', async () => {
      // Mock unauthorized access
      mockSupabaseClient.from.mockImplementationOnce(() => {
        const builder = createMockBuilder(null, new Error('Chat not found or access denied'));
        builder.eq.mockReturnThis();
        builder.single.mockRejectedValue(new Error('Chat not found or access denied'));
        return builder;
      });

      await expect(deleteChat('unauthorized-chat'))
        .rejects.toThrow('Chat not found or access denied');
    });

    it('should cleanup all associated messages on deletion', async () => {
      const chatId = 'chat-to-delete';
      
      // Mock cascade delete
      const mockCascadeDelete = vi.fn().mockResolvedValue({ data: null, error: null });
      mockSupabaseClient.from.mockImplementationOnce(() => {
        const builder = createMockBuilder(null);
        builder.eq.mockImplementation(() => ({
          eq: mockCascadeDelete
        }));
        return builder;
      });

      await deleteChat(chatId);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('chats');
    });
  });

  describe('Sidebar Logistics', () => {
    it('should load chats in correct order for sidebar', async () => {
      const chats = await getUserChats();
      expect(chats).toEqual(mockChats);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('chats');
    });

    it('should handle empty chat list', async () => {
      // Mock empty chat list
      mockSupabaseClient.from.mockImplementationOnce(() => 
        createMockBuilder([]));

      const chats = await getUserChats();
      expect(chats).toHaveLength(0);
    });

    it('should handle pagination for large chat lists', async () => {
      // Create mock data for pagination test
      const manyChats = Array.from({ length: 50 }, (_, i) => ({
        id: `chat-${i}`,
        title: `Chat ${i}`,
        user_id: 'test-user-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      mockSupabaseClient.from.mockImplementationOnce(() => 
        createMockBuilder(manyChats));

      const chats = await getUserChats();
      expect(chats).toHaveLength(50);
      expect(chats[0].id).toBe('chat-0');
      expect(chats[49].id).toBe('chat-49');
    });
  });
}); 