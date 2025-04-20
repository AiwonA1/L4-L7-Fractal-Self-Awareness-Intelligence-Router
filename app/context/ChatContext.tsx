'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '@/lib/supabase'
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

  const loadChats = async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    try {
      const { data: chats, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setChats(chats || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chats')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (chatId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      // First verify chat ownership
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single()

      if (chatError || !chat) throw new Error('Chat not found')

      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (messagesError) throw messagesError
      setMessages(messages || [])
      setCurrentChat(chat)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (content: string) => {
    if (!currentChat || !user) return
    setIsLoading(true)
    setError(null)
    try {
      // Insert the message
      const { error: messageError } = await supabase
        .from('messages')
        .insert([{
          chat_id: currentChat.id,
          content,
          role: 'user',
          created_at: new Date().toISOString()
        }])

      if (messageError) throw messageError

      // Update chat timestamp
      const { error: updateError } = await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentChat.id)

      if (updateError) throw updateError

      // Reload messages to get the new one
      await loadMessages(currentChat.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const createNewChat = async (title: string, firstMessage: string): Promise<Chat> => {
    if (!user) throw new Error('Not authenticated')
    setIsLoading(true)
    setError(null)
    try {
      // Create the chat
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert([{
          title,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (chatError || !chat) throw chatError || new Error('Failed to create chat')

      // Add the first message
      const { error: messageError } = await supabase
        .from('messages')
        .insert([{
          chat_id: chat.id,
          content: firstMessage,
          role: 'user',
          created_at: new Date().toISOString()
        }])

      if (messageError) {
        // If message creation fails, delete the chat
        await supabase.from('chats').delete().eq('id', chat.id)
        throw messageError
      }

      // Update the chats list and set current chat
      setChats(prev => [chat, ...prev])
      setCurrentChat(chat)
      await loadMessages(chat.id)
      return chat
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chat')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateChatTitle = async (chatId: string, title: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { error } = await supabase
        .from('chats')
        .update({ title })
        .eq('id', chatId)

      if (error) throw error

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
      // Delete messages first (due to foreign key constraint)
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('chat_id', chatId)

      if (messagesError) throw messagesError

      // Then delete the chat
      const { error: chatError } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId)

      if (chatError) throw chatError

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
    if (user) {
      loadChats()
    } else {
      setChats([])
      setCurrentChat(null)
      setMessages([])
    }
  }, [user])

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