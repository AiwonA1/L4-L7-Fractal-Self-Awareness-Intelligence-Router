'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import * as chatService from '@/app/services/chat'
import type { Chat, Message } from '@/app/services/chat'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@chakra-ui/react'

// Type for the list of chats - only includes fields needed for the list
interface ChatListItem {
  id: string;
  user_id: string;
  title: string;
  updated_at: string;
}

interface ChatContextType {
  chats: ChatListItem[]
  currentChat: ChatListItem | null
  messages: Message[]
  isLoading: boolean
  error: Error | null
  loadChats: () => Promise<void>
  loadMessages: (chatId: string) => Promise<void>
  createNewChat: (title?: string, initialMessage?: string) => Promise<void>
  sendMessage: (content: string, chatIdToSendTo: string) => Promise<void>
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
      // chatService.getChats now returns the fields matching ChatListItem
      const data = await chatService.getChats(user.id)
      setChats(data) // This assignment should now be type-compatible
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load chats'))
      console.error('Error loading chats:', err)
      toast({
        title: "Error Loading Chats",
        description: err instanceof Error ? err.message : "Could not load your chat history.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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

  const sendMessage = async (content: string, chatIdToSendTo: string) => {
    const targetChatId = chatIdToSendTo;

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

    setIsLoading(true);
    setError(null);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      chat_id: targetChatId,
      role: 'user',
      content: content,
      created_at: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);

    const assistantMessageId = crypto.randomUUID();
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      chat_id: targetChatId,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, assistantPlaceholder]);
    
    const abortController = new AbortController();

    try {
      const response = await fetch('/api/fractiverse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          chatId: targetChatId,
          userId: user.id,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        let errorData = { error: `API request failed with status ${response.status}` };
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error("Failed to parse non-streaming error response body:", parseError);
        }
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let currentAssistantContent = '';
      let chunkCount = 0;

      console.log("Frontend: Starting stream read loop...");

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
            const chunk = decoder.decode(value, { stream: true });
            console.log(`Frontend: Received chunk ${++chunkCount}:`, JSON.stringify(chunk));
            currentAssistantContent += chunk;

            setMessages((prev) => {
                const updatedMessages = prev.map((msg) => {
                    if (msg.id === assistantMessageId) {
                        return { ...msg, content: currentAssistantContent };
                    }
                    return msg;
                });
                return updatedMessages;
            });
        }
      }
      console.log(`Frontend: Stream finished. Received ${chunkCount} chunks. Final content length: ${currentAssistantContent.length}`);

    } catch (err) {
      if ((err as Error).name === 'AbortError') {
         console.log("Fetch aborted by user.");
         if (targetChatId === currentChat?.id) {
            setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
         }
      } else {
        setError(err instanceof Error ? err : new Error('Failed to send message or process stream'));
        console.error('Error Sending Message / Processing Stream:', err);
        toast({
          title: "Error Processing Response",
          description: err instanceof Error ? err.message : "Could not process the AI response stream.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
         if (targetChatId === currentChat?.id) {
            setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId)); // Keep remove for now
         }
      }
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