import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server'
import { RealtimeChannel } from '@supabase/supabase-js'
import { createMessage as createMessageAction } from '@/app/actions/chat'

export type DbChat = Database['public']['Tables']['chats']['Row']
export type DbMessage = Database['public']['Tables']['messages']['Row']

export type Message = Omit<DbMessage, 'role'> & {
  role: 'user' | 'assistant'
}

export type Chat = DbChat & {
  messages: Message[]
}

export interface ChatListItem {
  id: string;
  user_id: string;
  title: string;
  updated_at: string;
}

export async function getChats(userId: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('No session')

    const { data, error } = await supabase
      .from('chats')
      .select('id, title, user_id, updated_at')
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
  callback: (message: Message) => void
) {
  const channel = supabase
    .channel(`chat-messages-${chatId}`)
    .on<DbMessage>(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      },
      (payload) => {
        console.log(`Realtime message update on chat ${chatId}:`, payload)
        const rawMessage = payload.new
        if (rawMessage && (rawMessage.role === 'user' || rawMessage.role === 'assistant')) {
          callback(rawMessage as Message)
        } else {
          console.warn('Received message with invalid role:', rawMessage)
        }
      }
    )
    .subscribe((status, err) => {
      console.log(`Realtime channel chat-messages-${chatId} status: ${status}`)
      if (err) {
        console.error(`Realtime channel chat-messages-${chatId} error:`, err)
      }
    })

  return channel
}

// Commenting out placeholder as context uses direct query and linter struggles with typing
/*
export const getChatMessages = async (chatId: string): Promise<Message[]> => {
    console.warn(\"getChatMessages in service is placeholder, context uses direct query\");
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

    if (error) throw error;

    // Map and validate roles inline
    return (data || []).map(msg => {
        // Check if msg is valid and has a role property
        if (!msg || typeof msg !== 'object' || !('role' in msg)) {
            // Handle invalid message structure (e.g., return a default or skip)
            // Returning a default structure here to avoid downstream errors
            return {
                ...msg, // Spread existing properties if any
                id: msg?.id || crypto.randomUUID(), // Ensure ID exists
                chat_id: chatId,
                role: 'assistant', // Default role
                content: '[Invalid message data]',
                created_at: msg?.created_at || new Date().toISOString()
            } as Message;
        }
        // Now msg is confirmed to be an object with a role property
        return {
            ...msg,
            role: msg.role === \'user\' || msg.role === \'assistant\' ? msg.role : \'assistant\' // Default role
        } as Message;
    });
};
*/

export const createMessage = async (
  chatId: string, 
  role: 'user' | 'assistant',
  content: string
): Promise<Message> => {
  try {
    const newMessage = await createMessageAction(chatId, role, content);
    if (!newMessage) {
      throw new Error("Server action did not return a message.");
    }
    if (newMessage.role !== 'user' && newMessage.role !== 'assistant') {
        console.warn(`createMessage action returned invalid role: ${newMessage.role}, defaulting to assistant.`);
        return { ...newMessage, role: 'assistant' } as Message;
    }
    return newMessage as Message;
  } catch (error) {
    console.error("Error calling createMessage server action:", error);
    throw error;
  }
}; 