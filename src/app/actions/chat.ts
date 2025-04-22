'use server'

import { createAdminSupabaseClient } from '@/lib/supabase/supabase-admin'
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/supabase'

type Message = Database['public']['Tables']['messages']['Row']
type Chat = Database['public']['Tables']['chats']['Row'] & {
  messages: Message[]
}

export async function createChat(userId: string, title: string) {
  const supabase = createServerSupabaseClient()
  
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
  const supabase = createServerSupabaseClient()
  
  // Verify the user owns this chat
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) throw new Error('Not authenticated')
  
  const { data: chat } = await supabase
    .from('chats')
    .select()
    .eq('id', chatId)
    .eq('user_id', session.user.id)
    .single()
  
  if (!chat) throw new Error('Chat not found or access denied')
  
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
  if (!session?.user?.id) {
    console.error('Not authenticated in updateChatTitle')
    throw new Error('Not authenticated')
  }
  
  try {
    // First verify the chat exists and belongs to the user
    const { data: existingChat, error: checkError } = await supabase
      .from('chats')
      .select('id')
      .eq('id', chatId)
      .eq('user_id', session.user.id)
      .single()
    
    if (checkError || !existingChat) {
      console.error('Chat not found or access denied:', checkError)
      throw new Error('Chat not found or access denied')
    }
    
    // Update the chat title
    const { data: updatedChat, error } = await supabase
      .from('chats')
      .update({ title })
      .eq('id', chatId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating chat title:', error)
      throw error
    }
    
    if (!updatedChat) {
      throw new Error('Chat not found or access denied')
    }
    
    try {
      revalidatePath('/chat')
    } catch (e) {
      console.warn('Failed to revalidate path:', e)
    }
    
    return updatedChat
  } catch (error) {
    console.error('Error in updateChatTitle:', error)
    throw error
  }
}

export async function deleteChat(chatId: string) {
  const supabase = createServerSupabaseClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) {
    console.error('Not authenticated in deleteChat')
    throw new Error('Not authenticated')
  }
  
  try {
    // First verify the chat exists and belongs to the user
    const { data: existingChat, error: checkError } = await supabase
      .from('chats')
      .select('id')
      .eq('id', chatId)
      .eq('user_id', session.user.id)
      .single()
    
    if (checkError || !existingChat) {
      console.error('Chat not found or access denied:', checkError)
      throw new Error('Chat not found or access denied')
    }
    
    // Delete the chat
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId)
    
    if (error) {
      console.error('Error deleting chat:', error)
      throw error
    }
    
    try {
      revalidatePath('/chat')
    } catch (e) {
      console.warn('Failed to revalidate path:', e)
    }
    
    return true
  } catch (error) {
    console.error('Error in deleteChat:', error)
    throw error
  }
} 