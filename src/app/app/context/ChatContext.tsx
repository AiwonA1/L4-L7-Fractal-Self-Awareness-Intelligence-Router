'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import * as chatService from '@/app/services/chat'
import type { Chat, Message } from '@/app/services/chat'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@chakra-ui/react'

interface ChatContextType {
  chats: Chat[]
  currentChat: Chat | null
  messages: Message[]
  isLoading: boolean
  error: Error | null
  loadChats: () => Promise<void>
  loadMessages: (chatId: string) => Promise<void>
  createNewChat: (title: string, initialMessage: string) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  updateChatTitle: (chatId: string, title: string) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadChats()
      // Subscribe to chat updates
      const subscription = chatService.subscribeToChats(user.id, (chat) => {
        setChats((prevChats) => {
          const index = prevChats.findIndex((c) => c.id === chat.id)
          if (index >= 0) {
            const newChats = [...prevChats]
            newChats[index] = chat
            return newChats
          }
          return [...prevChats, chat]
        })
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user?.id])

  useEffect(() => {
    if (currentChat?.id) {
      // Subscribe to message updates for current chat
      const subscription = chatService.subscribeToChatMessages(currentChat.id, (message) => {
        setMessages((prevMessages) => {
          const index = prevMessages.findIndex((m) => m.id === message.id)
          if (index >= 0) {
            const newMessages = [...prevMessages]
            newMessages[index] = message
            return newMessages
          }
          return [...prevMessages, message]
        })
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [currentChat?.id])

  const loadChats = async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await chatService.getChats(user.id)
      setChats(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load chats'))
      console.error('Error loading chats:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (chatId: string) => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const chat = chats.find((c) => c.id === chatId)
      if (chat) {
        setCurrentChat(chat)
        setMessages(chat.messages || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load messages'))
      console.error('Error loading messages:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const createNewChat = async (title: string, initialMessage: string) => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const chat = await chatService.createChat(user.id, title)
      if (chat) {
        await chatService.addMessage(chat.id, initialMessage, 'user')
        await loadChats()
        setCurrentChat(chat)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create chat'))
      console.error('Error creating chat:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (content: string) => {
    if (!currentChat?.id || !user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const message = await chatService.addMessage(currentChat.id, content, 'user')
      setMessages((prev) => [...prev, message])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send message'))
      console.error('Error sending message:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateChatTitle = async (chatId: string, title: string) => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      // Update chat title in Supabase
      const { data, error } = await supabase
        .from('chats')
        .update({ title })
        .eq('id', chatId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setChats((prev) =>
        prev.map((chat) => (chat.id === chatId ? { ...chat, title } : chat))
      )
      if (currentChat?.id === chatId) {
        setCurrentChat((prev) => (prev ? { ...prev, title } : null))
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update chat title'))
      console.error('Error updating chat title:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteChat = async (chatId: string) => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      // Delete chat in Supabase
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('chat_id', chatId)

      if (messagesError) throw messagesError

      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId)
        .eq('user_id', user.id)

      if (error) throw error

      // Update local state
      setChats((prev) => prev.filter((chat) => chat.id !== chatId))
      if (currentChat?.id === chatId) {
        setCurrentChat(null)
        setMessages([])
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete chat'))
      console.error('Error deleting chat:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    chats,
    currentChat,
    messages,
    isLoading,
    error,
    loadChats,
    loadMessages,
    createNewChat,
    sendMessage,
    updateChatTitle,
    deleteChat,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
} 