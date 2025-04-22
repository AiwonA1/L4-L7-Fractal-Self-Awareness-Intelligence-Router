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
      spacing={0} // Remove spacing between content and input
      bg={bgColor}
    >
      {/* Message display area (conditional) */}
      <Box flex={1} overflowY="auto"> { /* Allow message list to scroll */}
        {isLoadingMessages ? (
          <Center h="full">
            <Spinner size="xl" />
          </Center>
        ) : currentChat ? (
          <MessageList messages={messages} />
        ) : (
          <Center h="full">
            <Text color={placeholderColor}>Select a chat or start a new one.</Text>
          </Center>
        )}
      </Box>

      {/* Input area (unconditional) */}
      <Box pt={2} px={4} pb={4}> { /* Add some padding around input */}
        <MessageInput onSendMessage={onSendMessage} isLoading={isSendingMessage} />
      </Box>
    </VStack>
  );
} 