'use client';

import React from 'react';
import {
  Box,
  VStack,
  Text,
  Spinner,
  Center,
  useColorModeValue,
} from '@chakra-ui/react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

// Re-define or import the Message interface if needed
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at?: string | number | Date;
}

// Define the Chat interface (simplified, based on context)
interface Chat {
  id: string;
  title: string;
  // Add other relevant fields if needed
}

interface ChatWindowProps {
  currentChat: Chat | null;
  messages: Message[];
  isLoadingMessages: boolean; // Loading state for fetching messages
  isSendingMessage: boolean; // Loading state for sending a message
  onSendMessage: (message: string) => Promise<void>;
}

export function ChatWindow({
  currentChat,
  messages,
  isLoadingMessages,
  isSendingMessage,
  onSendMessage,
}: ChatWindowProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const placeholderColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <VStack
      flex={1}
      align="stretch"
      spacing={0} // Remove spacing between MessageList and MessageInput
      bg={bgColor}
      // Optional: add height constraints if needed, e.g., h="calc(100vh - someOffset)"
    >
      {isLoadingMessages ? (
        <Center flex={1}>
          <Spinner size="xl" />
        </Center>
      ) : currentChat ? (
        <>
          {/* Optional: Add a header here displaying currentChat.title */}
          <MessageList messages={messages} />
          <MessageInput onSendMessage={onSendMessage} isLoading={isSendingMessage} />
        </>
      ) : (
        <Center flex={1}>
          <Text color={placeholderColor}>Select a chat or start a new one.</Text>
        </Center>
      )}
    </VStack>
  );
} 