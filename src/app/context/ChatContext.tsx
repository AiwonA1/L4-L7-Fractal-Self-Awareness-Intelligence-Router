'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
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
  }, [user?.id])

  const loadChats = async () => {
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
  }

  const loadMessages = async (chatId: string) => {
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
  }

  const sendMessage = async (content: string, chatId: string) => {
    if (!user?.id) {
      toast({
        title: 'Authentication Error',
        description: 'Please log in to send messages',
        status: 'error',
        duration: 3000
      })
      return
    }

    // Optimistically add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      chat_id: chatId,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    }

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true
    }))

    try {
      const response = await fetch('/api/fractiverse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...state.messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          userId: user.id,
          chatId
        })
      })

      if (!response.ok) throw new Error('Failed to send message')

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      let assistantMessage = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = new TextDecoder().decode(value)
        assistantMessage += chunk
        
        // Update assistant message in real-time
        setState(prev => ({
          ...prev,
          messages: [
            ...prev.messages.filter(m => m.role !== 'assistant' || m.id !== 'streaming'),
            {
              id: 'streaming',
              chat_id: chatId,
              role: 'assistant',
              content: assistantMessage,
              created_at: new Date().toISOString()
            }
          ]
        }))
      }

      // Final message update
      setState(prev => ({
        ...prev,
        isLoading: false,
        messages: [
          ...prev.messages.filter(m => m.id !== 'streaming'),
          {
            id: crypto.randomUUID(),
            chat_id: chatId,
            role: 'assistant',
            content: assistantMessage,
            created_at: new Date().toISOString()
          }
        ]
      }))

    } catch (error) {
      toast({
        title: 'Error sending message',
        status: 'error',
        duration: 3000
      })
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const createNewChat = async (title: string, initialMessage: string) => {
    if (!user?.id) return null
    
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      const newChat = await chatService.createChat(user.id, title)
      if (!newChat) throw new Error('Failed to create chat')
      
      setState(prev => ({
        ...prev,
        chats: [newChat, ...prev.chats],
        currentChat: newChat,
        messages: [],
        isLoading: false
      }))

      await sendMessage(initialMessage, newChat.id)
      return newChat
    } catch (error) {
      toast({
        title: 'Error creating chat',
        status: 'error',
        duration: 3000
      })
      setState(prev => ({ ...prev, isLoading: false }))
      return null
    }
  }

  const updateChatTitle = async (chatId: string, newTitle: string) => {
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      await updateChatTitleAction(chatId, newTitle)
      setState(prev => ({
        ...prev,
        chats: prev.chats.map(c => 
          c.id === chatId ? { ...c, title: newTitle } : c
        ),
        isLoading: false
      }))
    } catch (error) {
      toast({
        title: 'Error updating chat title',
        status: 'error',
        duration: 3000
      })
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const deleteChat = async (chatId: string) => {
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      await deleteChatAction(chatId)
      setState(prev => ({
        ...prev,
        chats: prev.chats.filter(c => c.id !== chatId),
        currentChat: prev.currentChat?.id === chatId ? null : prev.currentChat,
        messages: prev.currentChat?.id === chatId ? [] : prev.messages,
        isLoading: false
      }))
      toast({ title: 'Chat deleted', status: 'success', duration: 2000 })
    } catch (error) {
      toast({
        title: 'Error deleting chat',
        status: 'error',
        duration: 3000
      })
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  return (
    <ChatContext.Provider value={{
      ...state,
      loadChats,
      loadMessages,
      sendMessage,
      createNewChat,
      updateChatTitle,
      deleteChat
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}