import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { RealtimeChannel } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Create the Supabase client instance
export const supabase = createClientComponentClient<Database>({
  cookieOptions: {
    name: 'sb-auth-token',
    domain: typeof window !== 'undefined' ? window.location.hostname : '',
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  }
})

// Helper function to get user session
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}

// Helper function to get user profile
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Profile error:', error)
    return null
  }
}

// Helper function to get user profile with retries
export const getUserProfileWithRetries = async (userId: string, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error(`Profile error (attempt ${i + 1}/${retries}):`, error)
      if (i === retries - 1) return null
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  return null
}

// Subscribe to user profile changes with reconnection logic
export const subscribeToProfile = (
  userId: string,
  callback: (payload: Database['public']['Tables']['users']['Row']) => void
): RealtimeChannel => {
  const channel = supabase
    .channel(`user-profile-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`
      },
      (payload) => callback(payload.new as Database['public']['Tables']['users']['Row'])
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to profile changes')
      }
      if (status === 'CLOSED') {
        console.log('Subscription closed, attempting to reconnect...')
        setTimeout(() => {
          channel.subscribe()
        }, 1000)
      }
      if (status === 'CHANNEL_ERROR') {
        console.error('Channel error, attempting to reconnect...')
        setTimeout(() => {
          channel.subscribe()
        }, 2000)
      }
    })

  return channel
}

// Helper function to update user profile with retries
export const updateUserProfile = async (
  userId: string,
  updates: Database['public']['Tables']['users']['Update'],
  retries = 3
) => {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error(`Update error (attempt ${i + 1}/${retries}):`, error)
      if (i === retries - 1) return null
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  return null
}

// Helper function to get user's chats with real-time support
export const getUserChats = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select(`
        *,
        messages (
          *
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Chats error:', error)
    return null
  }
}

// Subscribe to chat updates
export const subscribeToChats = (
  userId: string,
  callback: (payload: Database['public']['Tables']['chats']['Row']) => void
): RealtimeChannel => {
  return supabase
    .channel('user-chats')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chats',
        filter: `user_id=eq.${userId}`
      },
      (payload) => callback(payload.new as Database['public']['Tables']['chats']['Row'])
    )
    .subscribe()
}

// Helper function to get chat messages with real-time support
export const getChatMessages = async (chatId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Messages error:', error)
    return null
  }
}

// Subscribe to chat messages
export const subscribeToChatMessages = (
  chatId: string,
  callback: (payload: Database['public']['Tables']['messages']['Row']) => void
): RealtimeChannel => {
  return supabase
    .channel('chat-messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      },
      (payload) => callback(payload.new as Database['public']['Tables']['messages']['Row'])
    )
    .subscribe()
} 