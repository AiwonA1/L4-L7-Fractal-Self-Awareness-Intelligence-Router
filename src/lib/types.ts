export interface User {
  id: string
  email: string
  password?: string // Usually not stored directly, handled by Supabase Auth
  name?: string | null // Add name if used
  fract_tokens?: number // Consider consistent naming (tokenBalance?)
  tokens_used?: number
  token_balance?: number
  created_at?: string
  updated_at?: string
  // Add other relevant fields from your users table
}

export interface Chat {
  id: string
  user_id: string
  title: string
  last_message?: string | null
  created_at: string
  updated_at: string
}

// Message type has been moved to src/app/services/chat.ts
// to ensure type safety with database schema

// This seems redundant if Chat already contains messages or messages are fetched separately.
// Consider if this specific structure is needed.
// export interface ChatHistory {
//   id: string
//   chat_id: string
//   user_id: string
//   messages: Message[]
//   created_at: string
//   updated_at: string
// }

export interface Transaction {
    id: string;
    user_id: string;
    type: 'USE' | 'PURCHASE' | 'REFUND';
    amount: number;
    description?: string | null;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
    created_at: string;
    updated_at: string;
    // Add Stripe-related IDs if needed (e.g., stripe_charge_id)
}

export interface PasswordReset {
  id: string
  user_id: string
  token: string // This is the UUID token stored in the DB
  expires_at: string
  created_at: string
} 