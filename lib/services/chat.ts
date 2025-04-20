import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'
import { createClient } from '@supabase/supabase-js'

type Message = Database['public']['Tables']['messages']['Row']
type Chat = Database['public']['Tables']['chats']['Row']

export async function createChat(userId: string, title: string) {
  const { data: chat, error } = await supabase
    .from('chats')
    .insert({
      user_id: userId,
      title,
    })
    .select()
    .single()
  
  if (error) throw error
  return chat
}

export async function getUserChats(userId: string) {
  const { data: chats, error } = await supabase
    .from('chats')
    .select(`
      *,
      messages (
        *,
        created_at
      )
    `)
    .eq('user_id', userId)
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

export async function getChatById(chatId: string, userId: string) {
  const { data: chat, error } = await supabase
    .from('chats')
    .select(`
      *,
      messages (
        *
      )
    `)
    .eq('id', chatId)
    .eq('user_id', userId)
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
  return message
}

export async function updateChatTitle(chatId: string, userId: string, title: string) {
  const { data: chat, error } = await supabase
    .from('chats')
    .update({ title })
    .eq('id', chatId)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw error
  return chat
}

export async function deleteChat(chatId: string, userId: string) {
  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId)
    .eq('user_id', userId)
  
  if (error) throw error
  return true
} 