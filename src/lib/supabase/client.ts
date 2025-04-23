import { createBrowserClient } from '@supabase/ssr'
import { RealtimeChannel } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase' // Assuming global types

let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

// Function to get a singleton Supabase client instance (using @supabase/ssr)
export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseAnonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')

  // Use createBrowserClient from @supabase/ssr
  supabaseInstance = createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )

  // Keep realtime setup if needed, but ensure it works with the new client
  // Note: Realtime auth might need adjustment or review with ssr client
  if (typeof window !== 'undefined') {
    supabaseInstance.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabaseInstance?.realtime.setAuth(session.access_token)
      }
    }).catch(error => console.error("Error getting initial session:", error));

    supabaseInstance.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed (client - ssr):', event, session?.user?.id)
      if (session) {
        supabaseInstance?.realtime.setAuth(session.access_token)
      } else {
        // Handle logout for realtime if needed
        // supabaseInstance?.realtime.setAuth(null);
      }
    });
  }

  return supabaseInstance
}

// Export the singleton instance for easy import
export const supabase = getSupabaseClient()

// --- Helper Functions (Client-Side) --- 

// Consider moving these helpers to a more specific service file (e.g., user-service.ts, chat-service.ts)
// if this client file becomes too large.

export const getSessionClient = async () => {
  if (!supabase) return null;
  try {
    // getSession handles refreshing if needed
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error;
    // Realtime auth is handled by onAuthStateChange listener
    return session;
  } catch (error) {
    console.error('Client getSession error:', error);
    return null;
  }
}

export const getUserProfileClient = async (userId: string) => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, token_balance') // Select only needed fields
      .eq('id', userId)
      .single()
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Client getUserProfile error:', error);
    return null;
  }
}

// Real-time subscription helper with basic reconnection logic
export const subscribeToTableUpdates = <T extends keyof Database["public"]["Tables"]>(
  channelName: string,
  table: T,
  filter: string | undefined,
  callback: (payload: any) => void // Consider using generated types for payload
): RealtimeChannel | null => {
    if (!supabase) return null;

    const channel = supabase
        .channel(channelName)
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: table, filter: filter },
            (payload) => {
                console.log(`Realtime update on ${channelName}:`, payload);
                callback(payload.new);
            }
        )
        .subscribe((status, err) => {
            console.log(`Realtime channel ${channelName} status: ${status}`);
            if (err) {
                console.error(`Realtime channel ${channelName} error:`, err);
                // Basic retry logic
                setTimeout(() => {
                    console.log(`Attempting to resubscribe to ${channelName}...`);
                    channel.subscribe();
                }, 5000); // Retry after 5 seconds
            }
            if (status === 'CLOSED') {
                 // Consider if manual resubscribe is needed or handled by Supabase client
                 console.log(`Realtime channel ${channelName} closed.`);
            }
        });

    return channel;
};


// Example usage for subscribing to profile changes (replace getUserProfileClient for initial load)
// export const subscribeToProfileClient = (
//   userId: string,
//   callback: (payload: any) => void
// ): RealtimeChannel | null => {
//   return subscribeToTableUpdates(
//       `user-profile-${userId}`,
//       'users',
//       `id=eq.${userId}`,
//       callback
//   );
// };


// This function might belong in a chat service file
export const getChatMessagesClient = async (chatId: string) => {
    if (!supabase) return null;
    try {
        const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Client getChatMessages error:', error);
        return null;
    }
}

// Example: Subscribe to messages for a specific chat
// export const subscribeToMessagesClient = (
//     chatId: string,
//     callback: (payload: any) => void
// ): RealtimeChannel | null => {
//     return subscribeToTableUpdates(
//         `chat-messages-${chatId}`,
//         'messages',
//         `chat_id=eq.${chatId}`,
//         callback
//     );
// }; 