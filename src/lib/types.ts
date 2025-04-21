export interface User {
  id: string
  email: string
  password?: string
  fract_tokens: number
  tokens_used: number
  token_balance: number
  created_at: string
  updated_at: string
}

export interface Chat {
  id: string
  user_id: string
  title: string
  last_message: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  chat_id: string
  user_id: string
  content: string
  role: 'user' | 'assistant'
  created_at: string
}

export interface ChatHistory {
  id: string
  chat_id: string
  user_id: string
  messages: Message[]
  created_at: string
  updated_at: string
}

export interface PasswordReset {
  id: string
  user_id: string
  token: string
  expires_at: string
  created_at: string
} 