'use server'

import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/supabase'

type Message = Database['public']['Tables']['messages']['Row']
type Chat = Database['public']['Tables']['chats']['Row'] & {
  messages: Message[]
}
type ChatHistory = Database['public']['Tables']['chat_history']['Row']

export async function createChat(userId: string, title: string) {
  const supabase = createAdminSupabaseClient()
  
  const { data: chat, error } = await supabase
    .from('chats')
    .insert({
      user_id: userId,
      title,
    })
    .select()
    .single()
  
  if (error) throw error
  
  revalidatePath('/chat')
  return chat
}

export async function getUserChats() {
  const supabase = createServerSupabaseClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) throw new Error('Not authenticated')
  
  const { data: chats, error } = await supabase
    .from('chats')
    .select(`
      *,
      messages (
        *,
        created_at
      )
    `)
    .eq('user_id', session.user.id)
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  
  // Process the messages to get the latest one for each chat
  return (chats as Chat[]).map(chat => ({
    ...chat,
    messages: chat.messages
      .sort((a: Message, b: Message) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 1)
  }))
}

export async function getChatById(chatId: string) {
  const supabase = createServerSupabaseClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) throw new Error('Not authenticated')
  
  const { data: chat, error } = await supabase
    .from('chats')
    .select(`
      *,
      messages (
        *
      )
    `)
    .eq('id', chatId)
    .eq('user_id', session.user.id)
    .single()
  
  if (error) throw error
  
  if (chat) {
    return {
      ...chat,
      messages: (chat as Chat).messages.sort((a: Message, b: Message) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    }
  }
  
  return null
}

export async function createMessage(chatId: string, role: string, content: string) {
  const supabase = createAdminSupabaseClient()
  
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      role,
      content,
    })
    .select()
    .single()
  
  if (error) throw error
  
  revalidatePath('/chat/[id]', 'page')
  return message
}

export async function updateChatTitle(chatId: string, title: string) {
  const supabase = createServerSupabaseClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) throw new Error('Not authenticated')
  
  const { data: chat, error } = await supabase
    .from('chats')
    .update({ title })
    .eq('id', chatId)
    .eq('user_id', session.user.id)
    .select()
    .single()
  
  if (error) throw error
  
  revalidatePath('/chat')
  return chat
}

export async function deleteChat(chatId: string) {
  const supabase = createServerSupabaseClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) throw new Error('Not authenticated')
  
  // First delete all messages (due to foreign key constraint)
  const { error: messagesError } = await supabase
    .from('messages')
    .delete()
    .eq('chat_id', chatId)
  
  if (messagesError) throw messagesError
  
  // Then delete the chat
  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId)
    .eq('user_id', session.user.id)
  
  if (error) throw error
  
  revalidatePath('/chat')
  return true
} 