import type { Database } from './supabase'

export type DbChat = Database['public']['Tables']['chats']['Row']
export type DbMessage = Database['public']['Tables']['messages']['Row']

export interface Chat extends DbChat {
  messages?: Message[]
}

export interface Message extends DbMessage {
  role: 'user' | 'assistant'
}

export interface ChatListItem {
  id: string
  title: string
  user_id: string
  updated_at: string
  last_message?: Message
}

export interface ChatContextState {
  chats: ChatListItem[]
  currentChat: ChatListItem | null
  messages: Message[]
  isLoading: boolean
  error: Error | null
}

export interface ChatContextActions {
  loadChats: () => Promise<void>
  loadMessages: (chatId: string) => Promise<void>
  createNewChat: (title?: string, initialMessage?: string) => Promise<Chat | null>
  sendMessage: (content: string, chatId: string) => Promise<void>
  updateChatTitle: (chatId: string, newTitle: string) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
} 