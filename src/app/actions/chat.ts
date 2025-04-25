'use server'

import { createAdminSupabaseClient } from '@/lib/supabase/supabase-admin'
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/supabase'
import { cookies } from 'next/headers'

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
  try {
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll();
    console.log('[updateChatTitle] Available cookie names:', allCookies.map(c => c.name));
  } catch (cookieError) {
    console.error('[updateChatTitle] Error accessing cookies:', cookieError);
  }

  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) {
    console.error('Not authenticated in updateChatTitle (Session check failed)')
    throw new Error('Not authenticated')
  }
  
  try {
    // First verify the chat exists and belongs to the user
    const { data: existingChat, error: checkError } = await supabase
      .from('chats')
      .select('id') // Only select id for verification
      .eq('id', chatId)
      .eq('user_id', session.user.id)
      .single()
    
    if (checkError || !existingChat) {
      console.error('Chat not found or access denied:', checkError)
      throw new Error('Chat not found or access denied')
    }
    
    // Update the chat title
    const { error: updateError } = await supabase
      .from('chats')
      .update({ title })
      .eq('id', chatId)
      .eq('user_id', session.user.id) // Ensure user owns the chat being updated
    
    if (updateError) {
      console.error('Error updating chat title:', updateError)
      throw updateError
    }
    
    // If update succeeds, revalidate and return the new data structure
    try {
      revalidatePath('/dashboard') // Revalidate dashboard as titles might be shown there
      revalidatePath(`/chat/${chatId}`) // Revalidate specific chat page
    } catch (e) {
      console.warn('Failed to revalidate paths:', e)
    }
    
    // Return the known updated info instead of fetching it again
    return { id: chatId, title: title, user_id: session.user.id }
  } catch (error) {
    console.error('Error in updateChatTitle:', error)
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('An unexpected error occurred while updating chat title.');
  }
}

export async function deleteChat(chatId: string): Promise<boolean> {
  try {
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll();
    console.log('[deleteChat] Available cookie names:', allCookies.map(c => c.name));
  } catch (cookieError) {
    console.error('[deleteChat] Error accessing cookies:', cookieError);
  }

  const supabase = createServerSupabaseClient()
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !sessionData.session) {
    console.error('Not authenticated in deleteChat (Session check failed)', sessionError);
    throw new Error('Not authenticated')
  }

  const userId = sessionData.session.user.id

  // First, verify the user owns the chat
  const { data: chatData, error: verifyError } = await supabase
    .from('chats')
    .select('id')
    .eq('id', chatId)
    .eq('user_id', userId)
    .single()

  if (verifyError || !chatData) {
    console.error('Chat not found or access denied:', verifyError)
    throw new Error('Chat not found or access denied')
  }

  // Delete messages first
  const { error: messagesError } = await supabase
    .from('messages')
    .delete()
    .eq('chat_id', chatId)

  if (messagesError) {
    console.error('Error deleting messages:', messagesError)
    throw new Error(`Failed to delete messages: ${messagesError.message}`)
  }

  // Then delete the chat
  const { error: chatError } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId)
    .eq('user_id', userId)

  if (chatError) {
    console.error('Error deleting chat:', chatError)
    throw new Error(`Failed to delete chat: ${chatError.message}`)
  }

  // Revalidate all relevant paths
  try {
    revalidatePath('/dashboard')
    revalidatePath('/chat/[id]')
    revalidatePath(`/chat/${chatId}`)
  } catch (e) {
    console.warn('Failed to revalidate some paths:', e)
  }

  return true
} 