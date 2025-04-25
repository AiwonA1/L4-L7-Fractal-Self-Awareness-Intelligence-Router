'use client';

import React from 'react';
import {
  Flex,
  Box,
  Text,
  Spinner,
  Center,
  useColorModeValue,
  type FlexProps,
} from '@chakra-ui/react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChat } from '@/app/context/ChatContext';
import type { Message } from '@/app/services/chat';

// Define the Chat interface (simplified, based on context)
interface Chat {
  id: string;
  title: string;
  updated_at: string;
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
  const { createNewChat } = useChat();

  const handleSendMessage = async (message: string) => {
    if (!currentChat) {
      // Create new chat with first message
      try {
        const newChat = await createNewChat(message.slice(0, 30) + '...', message);
        if (!newChat) {
          throw new Error('Failed to create new chat');
        }
      } catch (error) {
        console.error('Error creating new chat:', error);
        return;
      }
    } else {
      // Send message to existing chat
      await onSendMessage(message);
    }
  };

  let content;
  if (isLoadingMessages) {
    content = (
      <Center h="full">
        <Spinner size="xl" />
      </Center>
    );
  } else if (messages.length > 0) {
    content = <MessageList messages={messages} />;
  } else {
    content = (
      <Center h="full">
        <Text color={placeholderColor}>
          {currentChat 
            ? "No messages yet. Start the conversation!"
            : "Type a message to start a new chat."}
        </Text>
      </Center>
    );
  }

  return (
    <Flex
      flex={1}
      direction="column"
      h="full"
      bg={bgColor}
      position="relative"
      maxH="100vh"
    >
      <Flex
        flex={1}
        direction="column-reverse"
        overflowY="auto"
        p={4}
        sx={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'gray.200',
            borderRadius: '24px',
          },
        }}
      >
        {content}
      </Flex>

      <Box
        borderTopWidth="1px"
        borderColor="gray.200"
        bg={bgColor}
        position="sticky"
        bottom={0}
        width="100%"
        zIndex={1}
      >
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={isSendingMessage}
        />
      </Box>
    </Flex>
  );
} 