'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import * as chatService from '@/app/services/chat'
import type { Chat, Message } from '@/app/services/chat'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@chakra-ui/react'
import { updateChatTitle as updateChatTitleAction, deleteChat as deleteChatAction } from '@/app/actions/chat'

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

  useEffect(() => {
    if (user?.id) {
      loadChats()
      // Subscribe to chat updates
      const subscription = chatService.subscribeToChats(user.id, (chat) => {
        // Map the incoming full Chat object to a ChatListItem
        const chatListItem: ChatListItem = {
          id: chat.id,
          user_id: chat.user_id,
          title: chat.title,
          updated_at: chat.updated_at,
        };

        setChats((prevChats) => {
          const index = prevChats.findIndex((c) => c.id === chatListItem.id);
          if (index >= 0) {
            // Update existing chat
            const newChats = [...prevChats];
            newChats[index] = chatListItem; // Use the mapped item
            // Optionally, re-sort if updated_at changed significantly
            return newChats.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
          }
          // Add new chat and sort
          return [...prevChats, chatListItem].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        });
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
      console.log("ChatContext: Loaded chats", data)
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
      // Map the new Chat object to a ChatListItem before adding to state
       const newChatListItem: ChatListItem = {
          id: newChat.id,
          user_id: newChat.user_id,
          title: newChat.title,
          updated_at: newChat.updated_at,
        };

      setChats((prev) => [newChatListItem, ...prev].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())); // Add mapped item and sort
      setCurrentChat(newChatListItem); // Also use the list item for current chat
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
    
    // Optimistically add user message to local state
    const userMessage: Message = {
      id: crypto.randomUUID(), // Use crypto for UUID
      chat_id: targetChatId,
      role: 'user',
      content: content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // --- Save User Message to DB --- 
    try {
      // Use the imported chatService function
      await chatService.addMessage(targetChatId, content, 'user'); 
      console.log("ChatContext: User message saved to DB");
    } catch (dbError) {
      console.error("ChatContext: Failed to save user message to DB:", dbError);
      // Optionally remove the optimistic message or show an error
      setMessages((prev) => prev.filter(msg => msg.id !== userMessage.id)); 
      toast({
        title: "Error Saving Message",
        description: "Could not save your message to the database. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return; // Stop processing if user message failed to save
    }
    // --- End Save User Message --- 

    // Only proceed if user message was saved successfully
    setIsLoading(true);
    setError(null);

    // Optimistically add assistant placeholder
    const assistantMessageId = crypto.randomUUID();
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      chat_id: targetChatId,
      role: 'assistant',
      content: '', // Start empty
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
    updateChatTitle: async (chatId: string, newTitle: string) => {
      setIsLoading(true);
      try {
        const updatedChat = await updateChatTitleAction(chatId, newTitle);
        // Update local state optimistically or based on response
        setChats((prev) => 
          prev.map((c) => 
            c.id === chatId ? { ...c, title: updatedChat.title } : c
          ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        );
        if (currentChat?.id === chatId) {
            setCurrentChat((prev) => prev ? { ...prev, title: updatedChat.title } : null);
        }
        toast({ title: "Chat renamed successfully", status: "success", duration: 2000 });
      } catch (err) {
        console.error("Error renaming chat:", err);
        setError(err instanceof Error ? err : new Error('Failed to rename chat'));
        toast({ 
            title: "Error Renaming Chat", 
            description: err instanceof Error ? err.message : 'Could not rename the chat.',
            status: "error", 
            duration: 3000 
        });
      } finally {
        setIsLoading(false);
      }
    },
    deleteChat: async (chatId: string) => {
       if (!window.confirm("Are you sure you want to delete this chat permanently?")) {
         return; // Abort if user cancels
       }
       setIsLoading(true);
       try {
         await deleteChatAction(chatId);
         // Update local state
         setChats((prev) => prev.filter((c) => c.id !== chatId));
         if (currentChat?.id === chatId) {
           setCurrentChat(null);
           setMessages([]); // Clear messages if current chat is deleted
         }
         toast({ title: "Chat deleted successfully", status: "success", duration: 2000 });
       } catch (err) {
         console.error("Error deleting chat:", err);
         setError(err instanceof Error ? err : new Error('Failed to delete chat'));
          toast({ 
            title: "Error Deleting Chat", 
            description: err instanceof Error ? err.message : 'Could not delete the chat.',
            status: "error", 
            duration: 3000 
        });
       } finally {
         setIsLoading(false);
       }
    },
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