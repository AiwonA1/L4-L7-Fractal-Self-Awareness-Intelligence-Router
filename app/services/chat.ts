import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

export type Message = Database['public']['Tables']['messages']['Row']
export type Chat = Database['public']['Tables']['chats']['Row'] & {
  messages?: Message[]
}

export async function getChats(userId: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('No session')

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

    return data || []
  } catch (error) {
    console.error('Error in getChats:', error)
    throw error
  }
}

export async function createChat(userId: string, title: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('No session')

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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('No session')

    // First verify chat ownership
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('user_id')
      .eq('id', chatId)
      .single()

    if (chatError || !chat) {
      throw new Error('Chat not found')
    }

    if (chat.user_id !== session.user.id) {
      throw new Error('Unauthorized')
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
  return supabase
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
          subscribeToChats(userId, callback)
        }, 1000)
      }
    })
}

export function subscribeToChatMessages(
  chatId: string,
  callback: (payload: Message) => void
) {
  return supabase
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
          subscribeToChatMessages(chatId, callback)
        }, 1000)
      }
    })
} 