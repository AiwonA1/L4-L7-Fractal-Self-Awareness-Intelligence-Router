'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  useToast,
  useColorModeValue,
  Icon,
  Flex,
  Spinner,
  Avatar,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Center,
} from '@chakra-ui/react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { useAuth } from '@/app/context/AuthContext';
import { useChat } from '@/app/context/ChatContext';

// Import ChatContainer
import { ChatContainer } from '@/components/dashboard/ChatComponents';
// Import DeleteConfirmationDialog
import { DeleteConfirmationDialog } from '@/components/dashboard/DeleteConfirmationDialog';

export function ChatSidebar() {
  const { user, userProfile, signOut } = useAuth();
  const {
    chats,
    currentChat,
    isLoading: isChatLoading,
    loadMessages,
    createNewChat,
    updateChatTitle,
    deleteChat,
  } = useChat();
  const toast = useToast();

  // State for delete confirmation
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // Colors
  const sidebarBg = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleCreateChat = async () => {
    try {
      // Provide a default message or handle it differently if needed
      await createNewChat('New Chat', 'Hello!'); 
    } catch (err) {
      toast({
        title: 'Error creating chat',
        description: err instanceof Error ? err.message : 'Failed to create chat',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSelectChat = (chatId: string) => {
    if (chatId !== currentChat?.id) {
      loadMessages(chatId);
    }
  };

  const handleDeleteClick = (chatId: string) => {
    setChatToDelete(chatId);
    onAlertOpen();
  };

  const confirmDeleteChat = async () => {
    if (chatToDelete) {
      try {
        await deleteChat(chatToDelete);
        toast({ title: 'Chat deleted', status: 'info', duration: 2000 });
      } catch (err) {
        toast({
          title: 'Error deleting chat',
          description: err instanceof Error ? err.message : 'Failed to delete chat',
          status: 'error',
          duration: 3000,
        });
      }
    }
    onAlertClose();
    setChatToDelete(null);
  };

  const handleRenameSubmit = async (chatId: string, newTitle: string) => {
    if (!newTitle.trim()) {
      toast({ title: 'Title cannot be empty', status: 'warning', duration: 2000 });
      return;
    }
    try {
      await updateChatTitle(chatId, newTitle);
      toast({ title: 'Chat renamed', status: 'success', duration: 2000 });
    } catch (err) {
      toast({
        title: 'Error renaming chat',
        description: err instanceof Error ? err.message : 'Failed to rename chat',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <VStack h="100%" w="64" bg={sidebarBg} borderRightWidth="1px" borderColor={borderColor} spacing={0}>
      <Box w="full">
        <HStack w="full" p={4} borderBottomWidth="1px" borderColor={borderColor} spacing={3}>
          <Avatar name={user?.email} size="sm" />
          <Text fontWeight="medium" color={textColor} noOfLines={1}>
            {user?.email || 'Loading...'}
          </Text>
        </HStack>
      </Box>

      <Box p={4} w="full">
        <Button
          leftIcon={<FaPlus />}
          width="full"
          onClick={handleCreateChat}
          isLoading={isChatLoading}
          colorScheme="teal"
        >
          New Chat
        </Button>
      </Box>

      <Box flex={1} overflowY="auto" px={2} py={1} w="full">
        {isChatLoading && !chats.length ? (
          <Center h="full">
            <Spinner />
          </Center>
        ) : (
          <ChatContainer
            chats={chats}
            currentChatId={currentChat?.id}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDeleteClick}
            onRenameChat={handleRenameSubmit}
          />
        )}
      </Box>

      <Box p={4} w="full" borderTopWidth="1px" borderColor={borderColor}>
        <Text fontSize="sm" color={secondaryTextColor}>
          Tokens: {userProfile?.fract_tokens ?? 'N/A'}
        </Text>
      </Box>

      <DeleteConfirmationDialog
        isOpen={isAlertOpen}
        onClose={onAlertClose}
        onConfirm={confirmDeleteChat}
        cancelRef={cancelRef}
      />
    </VStack>
  );
} 