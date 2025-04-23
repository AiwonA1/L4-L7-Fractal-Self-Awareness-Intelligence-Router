'use client';

import React from 'react';
import { Box, VStack, HStack, Text, Icon, Avatar, useColorModeValue, IconButton, useToast } from '@chakra-ui/react';
import { FaRobot, FaUser, FaCopy } from 'react-icons/fa';
import { Message } from '@/app/services/chat';

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
      {/* @ts-ignore - Known issue with Chakra UI's VStack children type definitions and React's array type inference */}
      {messages.map((message: Message) => {
        const isUser = message.role === 'user';
        return (
          <HStack
            key={message.id}
            alignSelf={isUser ? 'flex-end' : 'flex-start'}
            w="fit-content"
            maxW={{ base: '90%', md: '70%' }}
            bg={isUser ? 'teal.700' : 'gray.800'}
            color="white"
            p={4}
            borderRadius="lg"
            alignItems="flex-start"
          >
            <Box as="div">
              <Text>{message.content}</Text>
            </Box>
          </HStack>
        );
      })}
    </VStack>
  );
} 