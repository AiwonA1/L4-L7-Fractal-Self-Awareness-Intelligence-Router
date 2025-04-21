'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import * as chatService from '@/app/services/chat'
import type { Chat, Message } from '@/app/services/chat'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@chakra-ui/react'

interface ChatContextType {
  chats: Chat[]
  currentChat: Chat | null
  messages: Message[]
  isLoading: boolean
  error: Error | null
  loadChats: () => Promise<void>
  loadMessages: (chatId: string) => Promise<void>
  createNewChat: (title?: string, initialMessage?: string) => Promise<void>
  sendMessage: (content: string, chatIdToSendTo?: string) => Promise<void>
  updateChatTitle: (chatId: string, title: string) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const toast = useToast()
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadChats()
      // Subscribe to chat updates
      const subscription = chatService.subscribeToChats(user.id, (chat) => {
        setChats((prevChats) => {
          const index = prevChats.findIndex((c) => c.id === chat.id)
          if (index >= 0) {
            const newChats = [...prevChats]
            newChats[index] = chat
            return newChats
          }
          return [...prevChats, chat]
        })
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user?.id])

  useEffect(() => {
    if (currentChat?.id) {
      // Subscribe to message updates for current chat
      const subscription = chatService.subscribeToChatMessages(currentChat.id, (message) => {
        setMessages((prevMessages) => {
          if (prevMessages.some(m => m.id === message.id)) {
            return prevMessages;
          }
          return [...prevMessages, message];
        });
      });

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [currentChat?.id])

  const loadChats = async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await chatService.getChats(user.id)
      setChats(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load chats'))
      console.error('Error loading chats:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (chatId: string) => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const chat = chats.find((c) => c.id === chatId)
      if (chat) {
        setCurrentChat(chat)
        const { data: fetchedMessages, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });
          
        if (msgError) throw msgError;
        
        const sortedMessages = (fetchedMessages || []).sort((a: Message, b: Message) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setMessages(sortedMessages);
      } else {
        setCurrentChat(null);
        setMessages([]);
        toast({
          title: "Chat not found",
          description: "The selected chat may have been deleted.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load messages'))
      console.error('Error loading messages:', err)
       toast({
        title: "Error Loading Chat",
        description: err instanceof Error ? err.message : "Could not load the chat messages.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false)
    }
  }

  const createNewChat = async (title: string = "New Chat", initialMessage?: string) => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);
    let newChat: Chat | null = null;
    try {
      newChat = await chatService.createChat(user.id, title);
      if (!newChat) {
        throw new Error("Failed to create chat record.");
      }

      setChats((prev) => [newChat!, ...prev]);
      setCurrentChat(newChat);
      setMessages([]);

      if (initialMessage) {
        await sendMessage(initialMessage, newChat.id); 
      } else {
         const defaultAssistantMsg: Message = {
          id: crypto.randomUUID(),
          chat_id: newChat.id,
          role: 'assistant',
          content: 'Hello! How can I assist you within the FractiVerse framework today?',
          created_at: new Date().toISOString(),
        };
        setMessages([defaultAssistantMsg]);
      }

    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to create chat"));
      console.error("Error creating chat:", err);
      toast({
        title: "Error Creating Chat",
        description: err instanceof Error ? err.message : "Could not start a new chat.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      if (newChat && !chats.some(c => c.id === newChat!.id)) {
         setCurrentChat(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, chatIdToSendTo?: string) => {
    let targetChatId = chatIdToSendTo || currentChat?.id;

    if (!user?.id) {
       console.error("Cannot send message: User not logged in.");
       toast({
        title: "Authentication Error",
        description: "User not logged in.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!targetChatId) {
      console.log("No active chat, creating a new one...");
      setIsLoading(true);
      try {
        const newChat = await chatService.createChat(user.id, "New Chat");
        if (!newChat) {
           throw new Error("Failed to create new chat before sending message.");
        }
        setChats((prev) => [newChat!, ...prev]); 
        setCurrentChat(newChat); 
        setMessages([]);
        targetChatId = newChat.id;
        console.log("New chat created with ID:", targetChatId);
      } catch (createErr) {
        setError(createErr instanceof Error ? createErr : new Error("Failed to create chat"));
        console.error("Error creating new chat in sendMessage:", createErr);
        toast({
          title: "Error Starting Chat",
          description: createErr instanceof Error ? createErr.message : "Could not start a new chat.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true); 
    setError(null);

    // 1. Add user message locally for immediate feedback
    const userMessage: Message = {
      id: crypto.randomUUID(), // Temporary client-side ID
      chat_id: targetChatId!, // Assert targetChatId is non-null here
      role: 'user',
      content: content,
      created_at: new Date().toISOString(),
    };
    
    if (targetChatId === currentChat?.id) {
       setMessages((prev) => [...prev, userMessage]);
    } else {
        console.log(`Adding user message to chat ${targetChatId}, which should be the current chat.`);
    }

    try {
      const response = await fetch('/api/fractiverse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          chatId: targetChatId,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // 3. Add the assistant's message locally
      const assistantMessage: Message = {
        id: data.id || crypto.randomUUID(), // Prefer server ID if available
        chat_id: targetChatId!, // Assert targetChatId is non-null here
        role: 'assistant',
        content: data.content,
        created_at: data.created_at || new Date().toISOString(),
      };
      
      if (targetChatId === currentChat?.id) {
         setMessages((prev) => {
            const messagesWithoutTemp = prev.filter(m => m.id !== userMessage.id);
            return [...messagesWithoutTemp, userMessage, assistantMessage]; 
         });
       } else {
          console.log(`Received assistant message for chat ${targetChatId}, but current view is ${currentChat?.id}`);
       }

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send message and get response'));
      console.error('Error in sendMessage during API call:', err);
      toast({
        title: 'Error Sending Message',
        description: err instanceof Error ? err.message : 'Could not get response from AI',
        status: 'error',
        duration: 5000, 
        isClosable: true,
      });
       
      if (targetChatId === currentChat?.id) {
          setMessages((prev) => prev.filter(m => m.id !== userMessage.id));
       }
    } finally {
      setIsLoading(false);
    }
  };

  const updateChatTitle = async (chatId: string, title: string) => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('chats')
        .update({ title })
        .eq('id', chatId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setChats((prev) =>
        prev.map((chat) => (chat.id === chatId ? { ...chat, title } : chat))
      )
      if (currentChat?.id === chatId) {
        setCurrentChat((prev) => (prev ? { ...prev, title } : null))
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update chat title'))
      console.error('Error updating chat title:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteChat = async (chatId: string) => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('chat_id', chatId)

      if (messagesError) throw messagesError

      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId)
        .eq('user_id', user.id)

      if (error) throw error

      setChats((prev) => prev.filter((chat) => chat.id !== chatId))
      if (currentChat?.id === chatId) {
        setCurrentChat(null)
        setMessages([])
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete chat'))
      console.error('Error deleting chat:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    chats,
    currentChat,
    messages,
    isLoading,
    error,
    loadChats,
    loadMessages,
    createNewChat,
    sendMessage,
    updateChatTitle,
    deleteChat,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
} 