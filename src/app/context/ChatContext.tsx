'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import * as chatService from '@/app/services/chat'
import type { ChatListItem, Message, Chat } from '@/app/services/chat'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@chakra-ui/react'
import { updateChatTitle as updateChatTitleAction, deleteChat as deleteChatAction } from '@/app/actions/chat'

interface ChatState {
  chats: ChatListItem[]
  currentChat: ChatListItem | null
  messages: Message[]
  isLoading: boolean
}

interface ChatContextType extends ChatState {
  loadChats: () => Promise<void>
  loadMessages: (chatId: string) => Promise<void>
  sendMessage: (content: string, chatId: string) => Promise<void>
  createNewChat: (title: string, initialMessage: string) => Promise<Chat | null>
  updateChatTitle: (chatId: string, newTitle: string) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const toast = useToast()
  const [state, setState] = useState<ChatState>({
    chats: [],
    currentChat: null,
    messages: [],
    isLoading: false
  })

  // Load initial chats
  const loadChats = useCallback(async () => {
    if (!user?.id) return
    
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      const chats = await chatService.getUserChats(user.id)
      setState(prev => ({ 
        ...prev, 
        chats,
        isLoading: false 
      }))
    } catch (error) {
      toast({
        title: 'Error loading chats',
        status: 'error',
        duration: 3000
      })
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [user?.id, toast])

  useEffect(() => {
    if (user?.id) {
      loadChats()
      
      // Subscribe to real-time chat updates
      const chatSubscription = supabase
        .channel('chat-updates')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'chats', filter: `user_id=eq.${user.id}` },
          async (payload) => {
            await loadChats() // Reload all chats on any change
          }
        )
        .subscribe()

      return () => {
        chatSubscription.unsubscribe()
      }
    }
  }, [user?.id, loadChats])

  // Wrap loadMessages in useCallback
  const loadMessages = useCallback(async (chatId: string) => {
    if (!user?.id) return
    
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      const messages = await chatService.getChatMessages(chatId)
      const chat = state.chats.find(c => c.id === chatId) || null
      setState(prev => ({ 
        ...prev, 
        currentChat: chat,
        messages,
        isLoading: false 
      }))
    } catch (error) {
      toast({
        title: 'Error loading messages',
        status: 'error',
        duration: 3000
      })
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [user?.id, toast, state.chats])

  // Wrap sendMessage in useCallback
  const sendMessage = useCallback(async (content: string, chatId: string) => {
    const debugPrefix = '[ChatContext]';
    console.log(`${debugPrefix} sendMessage called with chatId:`, chatId);
    
    if (!user?.id) {
      console.error(`${debugPrefix} No user ID found`);
      toast({
        title: 'Authentication Error',
        description: 'Please log in to send messages',
        status: 'error',
        duration: 3000
      })
      return
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      chat_id: chatId,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    }
    
    // Declare assistantMessageId here to be accessible in catch block
    let assistantMessageId: string | null = null; 

    console.log(`${debugPrefix} Adding user message to state:`, {
      messageId: userMessage.id,
      content: content.slice(0, 100) + (content.length > 100 ? '...' : '')
    });

    // Add user message first
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true
    }))

    const requestBody = {
      messages: [...state.messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      userId: user.id,
      chatId
    };

    console.log(`${debugPrefix} Getting session token...`);
    // Get the session token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      console.error(`${debugPrefix} No valid session token found`);
      throw new Error('No valid session token found');
    }
    console.log(`${debugPrefix} Session token retrieved successfully`);

    const fetchOptions = {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(requestBody),
      credentials: 'include' as RequestCredentials
    };

    // Log the options just before fetch (safely redacting auth token)
    console.log(`${debugPrefix} Sending message with options:`, {
      ...fetchOptions,
      headers: {
        ...fetchOptions.headers,
        Authorization: 'Bearer [REDACTED]'
      }
    });
    console.log(`${debugPrefix} Request body:`, {
      ...requestBody,
      messages: requestBody.messages.map(m => ({
        role: m.role,
        contentLength: m.content.length,
        preview: m.content.slice(0, 50) + '...'
      }))
    });

    try {
      console.log(`${debugPrefix} Initiating fetch to /api/fractiverse`);
      const response = await fetch('/api/fractiverse', fetchOptions);

      // Check response status *before* trying to read body
      if (!response.ok) { 
        console.error(`${debugPrefix} Response not OK:`, response.status);
        // Try to get error details from response body
        let errorDetails = 'Failed to send message';
        try {
            const errorData = await response.json();
            errorDetails = errorData.error || errorDetails;
            console.error(`${debugPrefix} Error details:`, errorDetails);
        } catch (parseError) {
            console.error(`${debugPrefix} Failed to parse error response:`, parseError);
            // Ignore if parsing fails, stick to default message
        }
        throw new Error(errorDetails); // Throw error with details
      }

      console.log(`${debugPrefix} Response OK, getting reader`);
      const reader = response.body?.getReader()
      if (!reader) {
        console.error(`${debugPrefix} No response body reader available`);
        throw new Error('No response body')
      }

      let assistantMessage = ''
      // Assign the ID here
      assistantMessageId = crypto.randomUUID(); 
      console.log(`${debugPrefix} Created assistant message ID:`, assistantMessageId);

      // Initial streaming message placeholder
      console.log(`${debugPrefix} Adding initial empty assistant message to state`);
      setState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: assistantMessageId!, // Use the generated ID (non-null assertion ok here)
            chat_id: chatId,
            role: 'assistant',
            content: '', // Start empty
            created_at: new Date().toISOString()
          }
        ]
      }))

      let chunkCount = 0;
      console.log(`${debugPrefix} Starting to read response stream`);
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          console.log(`${debugPrefix} Stream complete after ${chunkCount} chunks`);
          break;
        }
        
        chunkCount++;
        const chunk = new TextDecoder().decode(value)
        assistantMessage += chunk
        
        if (chunkCount % 10 === 0) {
          console.log(`${debugPrefix} Processed ${chunkCount} chunks. Current message length: ${assistantMessage.length}`);
        }
        
        // Update streaming assistant message content
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(m => 
            m.id === assistantMessageId ? { ...m, content: assistantMessage } : m
          )
        }))
      }

      // Final message state update (redundant if last update covers it, but safe)
      console.log(`${debugPrefix} Finalizing message state. Final length:`, assistantMessage.length);
      setState(prev => ({
        ...prev,
        isLoading: false,
        // Optionally re-map to ensure final content is set if loop finishes unexpectedly
        messages: prev.messages.map(m => 
          m.id === assistantMessageId ? { ...m, content: assistantMessage } : m
        )
      }))

    } catch (error) {
      console.error(`${debugPrefix} Error in sendMessage:`, error);
      // Now using the error message from the backend if available
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: 'Error sending message',
        description: errorMessage, // Show detailed error from backend
        status: 'error',
        duration: 5000 // Longer duration for errors
      })
      // Remove optimistic user message and streaming assistant message on error
      console.log(`${debugPrefix} Cleaning up messages after error`);
      setState(prev => ({
        ...prev, 
        isLoading: false, 
        // Correctly filter using assistantMessageId if it was set
        messages: prev.messages.filter(m => 
          m.id !== userMessage.id && 
          !(assistantMessageId && m.id === assistantMessageId) // Use the variable
        )
      }));
    }
  }, [user?.id, toast, state.messages]) // Keep state.messages dependency for initial body construction

  // Wrap createNewChat in useCallback
  const createNewChat = useCallback(async (title: string, initialMessage: string): Promise<Chat | null> => {
    if (!user?.id) return null
    
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      const { data, error } = await supabase
        .from('chats')
        .insert([{ user_id: user.id, title: 'New Chat' }]) // Start with a default title
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('No data returned after creating chat')

      // Explicitly cast to Chat for now to satisfy linter
      const newChat = data as Chat; 

      setState(prev => ({
        ...prev,
        // Add the fully formed Chat object
        chats: [...prev.chats, newChat],
        currentChatId: newChat.id,
        messages: [], // Clear messages for the new chat
        isLoading: false,
      }))
      return newChat
    } catch (error) {
      toast({
        title: 'Error creating new chat',
        status: 'error',
        duration: 3000,
      })
      setState(prev => ({ ...prev, chats: state.chats, isLoading: false })) // Revert on error
      return null
    }
  }, [user?.id, toast, state.chats])

  // Wrap updateChatTitle in useCallback
  const updateChatTitle = useCallback(async (chatId: string, newTitle: string) => {
    // Optimistic update
    const originalChats = state.chats;
    setState(prev => ({
      ...prev,
      chats: prev.chats.map(c => 
        c.id === chatId ? { ...c, title: newTitle } : c
      ),
      // Optional: isLoading: true here? 
    }));

    try {
      await updateChatTitleAction(chatId, newTitle);
      // No state update needed here if optimistic works
      // setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      toast({
        title: 'Error updating chat title',
        status: 'error',
        duration: 3000
      });
      // Revert optimistic update on error
      setState(prev => ({ ...prev, chats: originalChats, isLoading: false }));
    }
    // Dependencies: toast, state.chats (for optimistic update)
  }, [toast, state.chats])

  // Wrap deleteChat in useCallback
  const deleteChat = useCallback(async (chatId: string) => {
    // Optimistic update
    const originalState = { chats: state.chats, currentChat: state.currentChat, messages: state.messages }; 
    setState(prev => ({
      ...prev,
      chats: prev.chats.filter(c => c.id !== chatId),
      currentChat: prev.currentChat?.id === chatId ? null : prev.currentChat,
      messages: prev.currentChat?.id === chatId ? [] : prev.messages,
      // isLoading: true // Optional
    }));

    try {
      await deleteChatAction(chatId);
      toast({ title: 'Chat deleted', status: 'success', duration: 2000 });
      // No state update needed here
      // setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      toast({
        title: 'Error deleting chat',
        status: 'error',
        duration: 3000
      });
      // Revert optimistic update
      setState(prev => ({ ...prev, ...originalState, isLoading: false }));
    }
    // Dependencies: toast, state (chats, currentChat, messages)
  }, [toast, state.chats, state.currentChat, state.messages])

  // Provide the memoized functions in the context value
  const value = {
    ...state,
    loadChats,
    loadMessages,
    sendMessage,
    createNewChat,
    updateChatTitle,
    deleteChat
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}