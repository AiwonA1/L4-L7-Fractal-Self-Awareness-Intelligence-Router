'use client';

import React, { useState } from 'react';
import {
  Box,
  HStack,
  Input,
  Button,
  useColorModeValue,
  IconButton,
} from '@chakra-ui/react';
import { FaPaperPlane } from 'react-icons/fa';

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>; // Function to call when sending
  isLoading: boolean; // To disable input/button during loading
}

export function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
  const [newMessage, setNewMessage] = useState('');
  const inputBg = useColorModeValue('white', 'gray.700');
  const inputTextColor = useColorModeValue('gray.800', 'white');
  const buttonColorScheme = 'teal';

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    if (!newMessage.trim() || isLoading) return; // Prevent sending empty or during load

    const messageToSend = newMessage;
    setNewMessage(''); // Clear input immediately

    try {
      await onSendMessage(messageToSend);
    } catch (error) {
      // Error handling might be done in the parent component,
      // but we could potentially restore the input value here if needed.
      console.error('Failed to send message from input:', error);
      setNewMessage(messageToSend); // Optional: Restore message on failure
    }
  };

  return (
    <Box px={4} py={3} borderTopWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
      <form onSubmit={handleSubmit}>
        {/* @ts-ignore - Temporarily ignore iterator type incompatibility */}
        <HStack spacing={3}>
          <Input
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type your message..."
            bg={inputBg}
            color={inputTextColor}
            borderRadius="md"
            disabled={isLoading}
            aria-label="Message input"
          />
          <IconButton
            type="submit"
            icon={<FaPaperPlane />}
            colorScheme={buttonColorScheme}
            isLoading={isLoading}
            disabled={isLoading || !newMessage.trim()}
            aria-label="Send message"
          />
        </HStack>
      </form>
    </Box>
  );
} 