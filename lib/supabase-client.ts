import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

export const supabase = createClientComponentClient<Database>()

// Create a new chat
export async function createChat({ title, firstMessage }: { title: string; firstMessage: string }) {
  // First create the chat
  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .insert([
      { title, updated_at: new Date().toISOString() }
    ])
    .select()
    .single()

  if (chatError) return { error: chatError }

  // Then add the first message
  if (firstMessage) {
    const { error: messageError } = await supabase
      .from('messages')
      .insert([
        {
          chat_id: chat.id,
          role: 'user',
          content: firstMessage,
          created_at: new Date().toISOString()
        }
      ])

    if (messageError) return { error: messageError }
  }

  return { data: chat }
}

// Add a message to an existing chat
export async function addMessage({ chatId, role, content }: { chatId: string; role: 'user' | 'assistant' | 'system'; content: string }) {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        chat_id: chatId,
        role,
        content,
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single()

  // Update chat's updated_at timestamp
  if (!error) {
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId)
  }

  return { data, error }
}

// Load chat history
export async function loadChats() {
  const { data, error } = await supabase
    .from('chats')
    .select(`
      id,
      title,
      created_at,
      updated_at,
      messages (
        id,
        role,
        content,
        created_at
      )
    `)
    .order('updated_at', { ascending: false })

  return { data, error }
}

// Load a single chat with its messages
export async function loadChat(chatId: string) {
  const { data, error } = await supabase
    .from('chats')
    .select(`
      id,
      title,
      created_at,
      updated_at,
      messages (
        id,
        role,
        content,
        created_at
      )
    `)
    .eq('id', chatId)
    .single()

  return { data, error }
}

// Update chat title
export async function updateChatTitle({ chatId, title }: { chatId: string; title: string }) {
  const { data, error } = await supabase
    .from('chats')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', chatId)
    .select()
    .single()

  return { data, error }
}

// Delete a chat and its messages
export async function deleteChat(chatId: string) {
  // Messages will be automatically deleted due to ON DELETE CASCADE
  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId)

  return { error }
} 