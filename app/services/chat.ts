import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

export type Chat = Database['public']['Tables']['chats']['Row']
export type Message = Database['public']['Tables']['messages']['Row']

// Helper function to ensure session
async function ensureSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) {
    console.error('Session error:', error)
    throw new Error('No valid session')
  }
  return session
}

export async function getChats(userId: string) {
  try {
    const session = await ensureSession()
    if (session.user.id !== userId) {
      throw new Error('Unauthorized access')
    }

    const { data, error } = await supabase
      .from('chats')
      .select(`
        *,
        messages (*)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching chats:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in getChats:', error)
    throw error
  }
}

export async function createChat(userId: string, title: string) {
  try {
    const session = await ensureSession()
    if (session.user.id !== userId) {
      throw new Error('Unauthorized access')
    }

    const { data, error } = await supabase
      .from('chats')
      .insert([
        { user_id: userId, title }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating chat:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in createChat:', error)
    throw error
  }
}

export async function addMessage(chatId: string, content: string, role: string) {
  try {
    await ensureSession()

    // First verify chat ownership
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('user_id')
      .eq('id', chatId)
      .single()

    if (chatError || !chat) {
      throw new Error('Chat not found')
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([
        { chat_id: chatId, content, role }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error adding message:', error)
      throw error
    }

    // Update chat's updated_at timestamp
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId)

    return data
  } catch (error) {
    console.error('Error in addMessage:', error)
    throw error
  }
}

export function subscribeToChats(
  userId: string,
  callback: (payload: Chat) => void
) {
  const channel = supabase
    .channel(`user-chats-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chats',
        filter: `user_id=eq.${userId}`
      },
      (payload) => callback(payload.new as Chat)
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to chat changes')
      }
      if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        console.log('Subscription closed or error, attempting to reconnect...')
        setTimeout(() => {
          channel.subscribe()
        }, 1000)
      }
    })

  return channel
}

export function subscribeToChatMessages(
  chatId: string,
  callback: (payload: Message) => void
) {
  const channel = supabase
    .channel(`chat-${chatId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      },
      (payload) => callback(payload.new as Message)
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to message changes')
      }
      if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        console.log('Subscription closed or error, attempting to reconnect...')
        setTimeout(() => {
          channel.subscribe()
        }, 1000)
      }
    })

  return channel
} 