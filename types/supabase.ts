export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          image: string | null
          fract_tokens: number | null
          tokens_used: number | null
          token_balance: number | null
          password: string | null
          stripe_customer_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          image?: string | null
          fract_tokens?: number | null
          tokens_used?: number | null
          token_balance?: number | null
          password?: string | null
          stripe_customer_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          image?: string | null
          fract_tokens?: number | null
          tokens_used?: number | null
          token_balance?: number | null
          password?: string | null
          stripe_customer_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      chats: {
        Row: {
          id: string
          user_id: string
          title: string
          last_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          last_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          last_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          role: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          role: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          role?: string
          content?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: string
          amount: number
          description: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          amount: number
          description: string
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          amount?: number
          description?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 