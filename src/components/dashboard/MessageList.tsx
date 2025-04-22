'use client';

import React from 'react';
import { Box, VStack, HStack, Text, Icon, Avatar, useColorModeValue, IconButton, useToast } from '@chakra-ui/react';
import { FaRobot, FaUser, FaCopy } from 'react-icons/fa';

// Define the expected structure for a message object more precisely
// (Assuming structure based on context/potential usage)
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at?: string | number | Date; // Allow different date types
  // Add other potential fields from your data model if needed
  // e.g., chat_id?: string;
  // e.g., user_id?: string;
}

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const userMessageBg = useColorModeValue('teal.100', 'teal.700');
  const assistantMessageBg = useColorModeValue('white', 'gray.800');
  const userMessageTextColor = useColorModeValue('gray.800', 'white');
  const assistantMessageTextColor = useColorModeValue('gray.800', 'white');
  const placeholderColor = useColorModeValue('gray.500', 'gray.400');
  const toast = useToast();

  // Handler for copying text
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied to clipboard',
        status: 'success',
        duration: 1500,
        isClosable: true,
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        title: 'Copy failed',
        description: 'Could not copy text to clipboard.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    });
  };

  if (!messages || messages.length === 0) {
    return (
      <Box flex={1} p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color={placeholderColor}>
          No messages yet. Start the conversation!
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch" flex={1} overflowY="auto" p={4}>
      {/* @ts-ignore - Temporarily ignore iterator type incompatibility */}
      {messages.map((message) => {
        const isUser = message.role === 'user';
        return (
          <HStack
            key={message.id} // Ensure key is unique
            alignSelf={isUser ? 'flex-end' : 'flex-start'}
            w="fit-content"
            maxW={{ base: '90%', md: '70%' }}
            bg={isUser ? userMessageBg : assistantMessageBg}
            color={isUser ? userMessageTextColor : assistantMessageTextColor}
            borderRadius="lg"
            px={4}
            py={2}
            boxShadow="sm"
            alignItems="flex-start" // Align items to top for copy button
          >
            <Avatar
              size="sm"
              icon={<Icon as={isUser ? FaUser : FaRobot} />}
              bg={isUser ? 'teal.500' : 'blue.500'}
              color="white"
              aria-label={isUser ? 'User avatar' : 'Assistant avatar'}
              mt={1} // Add margin to align avatar with text better
            />
            {/* Wrap text in a Box to allow button to align next to it */}
            <Box flex={1}>
              <Text whiteSpace="pre-wrap">{message.content}</Text>
            </Box>
            {/* Conditionally render Copy button for assistant messages */}
            {!isUser && (
              <IconButton
                icon={<FaCopy />}
                aria-label="Copy message"
                size="sm"
                variant="ghost"
                onClick={() => handleCopy(message.content)}
                alignSelf="flex-start" // Keep button aligned top
                ml={2} // Add some margin
              />
            )}
          </HStack>
        );
      })}
    </VStack>
  );
} 