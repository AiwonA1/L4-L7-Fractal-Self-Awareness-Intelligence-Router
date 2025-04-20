import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { useAuth } from './AuthContext'
import type { Database } from '@/types/supabase'

type Chat = Database['public']['Tables']['chats']['Row']
type Message = Database['public']['Tables']['messages']['Row']

interface ChatContextType {
  chats: Chat[]
  messages: Message[]
  currentChat: Chat | null
  setCurrentChat: (chat: Chat | null) => void
  sendMessage: (content: string) => Promise<void>
  createNewChat: (title: string, firstMessage: string) => Promise<Chat>
  loadMessages: (chatId: string) => Promise<void>
  isLoading: boolean
  error: string | null
  updateChatTitle: (chatId: string, title: string) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
}

const ChatContext = createContext<ChatContextType>({
  chats: [],
  messages: [],
  currentChat: null,
  setCurrentChat: () => {},
  sendMessage: async () => {},
  createNewChat: async () => { throw new Error('Not implemented') },
  loadMessages: async () => {},
  isLoading: false,
  error: null,
  updateChatTitle: async () => {},
  deleteChat: async () => {}
})

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const sendMessage = async (content: string) => {
    if (!currentChat) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: currentChat.id,
          content,
        }),
      })
      if (!response.ok) throw new Error('Failed to send message')
      await loadMessages(currentChat.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const createNewChat = async (title: string, firstMessage: string): Promise<Chat> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: firstMessage,
        }),
      })
      if (!response.ok) throw new Error('Failed to create chat')
      const newChat = await response.json()
      setChats(prev => [...prev, newChat])
      setCurrentChat(newChat)
      await loadMessages(newChat.id)
      return newChat
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chat')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (chatId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/chat/${chatId}/messages`)
      if (!response.ok) throw new Error('Failed to load messages')
      const data = await response.json()
      setMessages(data.messages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  const updateChatTitle = async (chatId: string, title: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/chat/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, title }),
      })
      if (!response.ok) throw new Error('Failed to update chat title')
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, title } : chat
      ))
      if (currentChat?.id === chatId) {
        setCurrentChat(prev => prev ? { ...prev, title } : null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update chat title')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteChat = async (chatId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/chat/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId }),
      })
      if (!response.ok) throw new Error('Failed to delete chat')
      setChats(prev => prev.filter(chat => chat.id !== chatId))
      if (currentChat?.id === chatId) {
        setCurrentChat(null)
        setMessages([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete chat')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const loadChats = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/chat/list')
        if (!response.ok) throw new Error('Failed to load chats')
        const data = await response.json()
        setChats(data.chats)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chats')
      } finally {
        setIsLoading(false)
      }
    }
    loadChats()
  }, [])

  const value = {
    chats,
    messages,
    currentChat,
    setCurrentChat,
    sendMessage,
    createNewChat,
    loadMessages,
    isLoading,
    error,
    updateChatTitle,
    deleteChat
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