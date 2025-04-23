'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import * as chatService from '@/app/services/chat'
import type { ChatListItem, Message, Chat } from '@/app/services/chat'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@chakra-ui/react'
import { updateChatTitle as updateChatTitleAction, deleteChat as deleteChatAction } from '@/app/actions/chat'

interface ChatContextType {
  chats: ChatListItem[]
  currentChat: ChatListItem | null
  messages: Message[]
  isLoading: boolean
  error: Error | null
  loadChats: () => Promise<void>
  loadMessages: (chatId: string) => Promise<void>
  createNewChat: (title?: string, initialMessage?: string) => Promise<Chat | null>
  sendMessage: (content: string, chatIdToSendTo: string) => Promise<void>
  updateChatTitle: (chatId: string, newTitle: string) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const toast = useToast()
  const [chats, setChats] = useState<ChatListItem[]>([])
  const [currentChat, setCurrentChat] = useState<ChatListItem | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [subscriptions, setSubscriptions] = useState<(() => void)[]>([])

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      subscriptions.forEach(unsubscribe => unsubscribe())
    }
  }, [subscriptions])

  useEffect(() => {
    if (user?.id) {
      loadChats()
      
      // Subscribe to chat updates
      const chatSubscription = chatService.subscribeToChats(user.id, (chat) => {
        const chatListItem: ChatListItem = {
          id: chat.id,
          user_id: chat.user_id,
          title: chat.title,
          updated_at: chat.updated_at,
        }

        setChats((prevChats) => {
          const index = prevChats.findIndex((c) => c.id === chatListItem.id)
          if (index >= 0) {
            const newChats = [...prevChats]
            newChats[index] = chatListItem
            return newChats.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          }
          return [...prevChats, chatListItem].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        })
      })

      setSubscriptions(prev => [...prev, () => chatSubscription.unsubscribe()])
    }
  }, [user?.id])

  useEffect(() => {
    if (currentChat?.id) {
      // Subscribe to message updates for current chat
      const messageSubscription = chatService.subscribeToChatMessages(currentChat.id, (message: Message) => {
        setMessages((prevMessages) => {
          if (prevMessages.some(m => m.id === message.id)) {
            return prevMessages
          }
          return [...prevMessages, message].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        })
      })

      setSubscriptions(prev => [...prev, () => messageSubscription.unsubscribe()])
    }
  }, [currentChat?.id])

  const loadChats = async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await chatService.getChats(user.id)
      const chatListItems = data.map(chat => ({
        id: chat.id,
        user_id: chat.user_id,
        title: chat.title,
        updated_at: chat.updated_at,
      }));
      setChats(chatListItems.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load chats'))
      console.error('Error loading chats:', err)
      toast({
        title: "Error Loading Chats",
        description: err instanceof Error ? err.message : "Could not load your chat history.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (chatId: string) => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get messages from Supabase
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Update current chat
      const selectedChat = chats.find(c => c.id === chatId);
      if (selectedChat) {
        setCurrentChat(selectedChat);
        // Ensure messages are properly typed and sorted
        const typedMessages = messages.map(msg => ({
          ...msg,
          role: msg.role === 'user' || msg.role === 'assistant' ? msg.role : 'assistant',
          created_at: msg.created_at || new Date().toISOString()
        })) as Message[];
        
        setMessages(typedMessages);
      } else {
        throw new Error('Selected chat not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load messages'));
      console.error('Error loading messages:', err);
      toast({
        title: "Error Loading Chat",
        description: err instanceof Error ? err.message : "Could not load the chat messages.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async (title: string = "New Chat", initialMessage?: string): Promise<Chat | null> => {
    if (!user?.id) return null;

    setIsLoading(true);
    setError(null);
    let newChatFull: Chat | null = null;
    try {
      newChatFull = await chatService.createChat(user.id, title);
      if (!newChatFull) {
        throw new Error("Failed to create chat record.");
      }
      
      const newChatListItem: ChatListItem = {
        id: newChatFull.id,
        user_id: newChatFull.user_id,
        title: newChatFull.title,
        updated_at: newChatFull.updated_at,
      };

      setChats((prev) => [newChatListItem, ...prev].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
      setCurrentChat(newChatListItem);
      setMessages([]);

      if (initialMessage) {
        await sendMessage(initialMessage, newChatFull.id);
      } else {
         const defaultAssistantMsg: Message = {
          id: crypto.randomUUID(),
          chat_id: newChatFull.id,
          role: 'assistant',
          content: 'Hello! How can I assist you within the FractiVerse framework today?',
          created_at: new Date().toISOString(),
        };
        setMessages([defaultAssistantMsg]);
      }
      return newChatFull;

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
      if (newChatFull && !chats.some(c => c.id === newChatFull!.id)) {
         setCurrentChat(null);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, chatIdToSendTo: string) => {
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

    // Create user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      chat_id: chatIdToSendTo,
      role: 'user',
      content: content,
      created_at: new Date().toISOString(),
    };

    // Optimistically add user message to state
    setMessages(prev => [...prev, userMessage]);

    // Update chat timestamp optimistically
    setChats(prevChats => 
      prevChats.map(c => 
        c.id === chatIdToSendTo 
          ? { ...c, updated_at: new Date().toISOString() } 
          : c
      ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    );

    setIsLoading(true);
    setError(null);

    try {
      // Send message to API with complete chat history for context
      const response = await fetch('/api/fractiverse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          chatId: chatIdToSendTo,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      // Create placeholder for assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        chat_id: chatIdToSendTo,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      };

      // Add empty assistant message to state
      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            assistantContent += chunk;
            
            // Update assistant message content as chunks arrive
            setMessages(prev => 
              prev.map(msg => 
                msg.id === assistantMessage.id 
                  ? { ...msg, content: assistantContent }
                  : msg
              )
            );
          }
        } finally {
          reader.releaseLock();
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send message'));
      console.error('Error sending message:', err);
      toast({
        title: "Error Sending Message",
        description: err instanceof Error ? err.message : "Could not send your message.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

      // Remove failed assistant message from state
      setMessages(prev => prev.filter(msg => msg.role === 'user'));
    } finally {
      setIsLoading(false);
    }
  };

  const updateChatTitle = async (chatId: string, newTitle: string) => {
    setIsLoading(true);
    try {
      await updateChatTitleAction(chatId, newTitle);
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, title: newTitle, updated_at: new Date().toISOString() } : c)
                           .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
      if (currentChat?.id === chatId) {
          setCurrentChat((prev: ChatListItem | null) => prev ? { ...prev, title: newTitle } : null);
      }
      toast({ title: "Chat Renamed", status: "success", duration: 2000 });
    } catch (err) {
      console.error("Error updating chat title:", err);
      toast({ title: "Error Renaming Chat", description: err instanceof Error ? err.message : undefined, status: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    setIsLoading(true);
    try {
      await deleteChatAction(chatId);
      setChats(prev => prev.filter(c => c.id !== chatId));
      if (currentChat?.id === chatId) {
          setCurrentChat(null);
          setMessages([]);
      }
      toast({ title: "Chat Deleted", status: "success", duration: 2000 });
    } catch (err) {
      console.error("Error deleting chat:", err);
      toast({ title: "Error Deleting Chat", description: err instanceof Error ? err.message : undefined, status: "error" });
    } finally {
      setIsLoading(false);
    }
  };

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