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
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const chatListItem = chats.find((c) => c.id === chatId)
      if (chatListItem) {
        setCurrentChat(chatListItem)
        
        // Revert to direct Supabase query
        const { data: fetchedMessages, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true })
          
        if (msgError) throw msgError
        
        // Ensure fetched messages conform to the Message type, especially the 'role'
        // Use the refined Message type from chatService
        const correctlyTypedMessages = (fetchedMessages || []).map(msg => ({
          ...msg,
          // Explicitly cast or validate the role
          role: msg.role === 'user' || msg.role === 'assistant' 
                ? msg.role 
                : 'assistant', // Default to assistant if role is invalid/unexpected
        })) as Message[]; // Cast the entire array to Message[]
        
        const sortedMessages = correctlyTypedMessages.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        setMessages(sortedMessages) // Set state with correctly typed messages
      } else {
         setCurrentChat(null)
         setMessages([])
         toast({
           title: "Chat not found",
           description: "The selected chat may have been deleted.",
           status: "warning",
           duration: 3000,
           isClosable: true,
         })
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
  }

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
      console.error("Cannot send message: User not logged in.")
      toast({
        title: "Authentication Error",
        description: "User not logged in.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }
    
    const userMessage: Message = {
      id: crypto.randomUUID(), // Temporary ID for UI
      chat_id: chatIdToSendTo,
      role: 'user',
      content: content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Optimistic timestamp update
    setChats(prevChats => 
        prevChats.map(c => 
            c.id === chatIdToSendTo ? { ...c, updated_at: new Date().toISOString() } : c
        ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    );

    setIsLoading(true); // Indicate loading for assistant response
    setError(null);
    
    // Add placeholder for assistant message for streaming
    const assistantMessageId = crypto.randomUUID();
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      chat_id: chatIdToSendTo,
      role: 'assistant',
      content: '', // Start with empty content
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantPlaceholder]);

    // Abort controller for fetch cancellation
    const abortController = new AbortController();

    try {
      // Call the actual service/action to save the user message first
      // We assume this happens quickly or we don't wait for it before calling AI
      // Consider potential race conditions if saving is slow
       try {
           await chatService.createMessage(chatIdToSendTo, 'user', content);
           // If successful, maybe update the userMessage state with the real ID from DB?
           // setMessages((prev) => prev.map(m => m.id === userMessage.id ? savedUserMessage : m));
           // For now, keep the optimistic message.
       } catch (saveError) {
           console.error("Failed to save user message to DB:", saveError);
           // Optionally revert optimistic update or show specific error
           toast({ title: "Error Saving Message", description: "Could not save your message.", status: "error" });
           // Remove the optimistically added messages (user and placeholder assistant)
           setMessages((prev) => prev.filter(m => m.id !== userMessage.id && m.id !== assistantMessageId));
           setIsLoading(false);
           return; // Stop processing if user message saving fails
       }

      // --- Call the backend API for streaming response --- 
      const response = await fetch('/api/fractiverse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          chatId: chatIdToSendTo, 
          userId: user.id, 
          // Include history? API needs to handle this
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      // --- Process the stream --- 
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let currentAssistantContent = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          currentAssistantContent += chunk;

          // Update the content of the placeholder message incrementally
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: currentAssistantContent }
                : msg
            )
          );
        }
      }
      
      // --- Stream finished --- 
      // Optional: Save the complete assistant message to DB if API doesn't
      // try {
      //     await chatService.createMessage(chatIdToSendTo, 'assistant', currentAssistantContent);
      // } catch (saveError) {
      //     console.error("Failed to save assistant message:", saveError);
      //     // Handle error - maybe show a warning
      // }

      // Update chat list timestamp again after assistant response is complete
       setChats(prevChats => 
          prevChats.map(c => 
              c.id === chatIdToSendTo ? { ...c, updated_at: new Date().toISOString() } : c
          ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      );

    } catch (err) {
      // Handle fetch errors (network, abort, API errors)
      console.error('Error Sending Message / Processing Stream:', err);
      if ((err as Error).name !== 'AbortError') { // Don't show error if user aborted
        setError(err instanceof Error ? err : new Error('Failed to send message or process stream'));
        toast({
          title: "Error Processing Response",
          description: err instanceof Error ? err.message : "Could not process the AI response.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
      // Remove optimistic messages on error
      setMessages((prev) => prev.filter(m => m.id !== userMessage.id && m.id !== assistantMessageId));
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