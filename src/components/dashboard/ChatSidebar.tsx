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
  IconButton,
  Divider,
  Tooltip,
  Spinner,
  Avatar,
  Spacer,
  Input,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Center,
} from '@chakra-ui/react';
import { FaPlus, FaTrash, FaEdit, FaCheck, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '@/app/context/AuthContext';
import { useChat } from '@/app/context/ChatContext';
import { useRouter } from 'next/navigation';

// Re-define or import Chat interface if needed
interface Chat {
  id: string;
  title: string;
  // Add other relevant fields if needed
}

export function ChatSidebar() {
  const router = useRouter();
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

  // State for renaming
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // State for delete confirmation
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // Colors
  const sidebarBg = useColorModeValue('gray.50', 'gray.900');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const selectedBg = useColorModeValue('teal.50', 'teal.800');
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

  const handleRenameClick = (chat: Chat) => {
    setEditingChatId(chat.id);
    setRenameValue(chat.title);
  };

  const handleRenameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRenameValue(event.target.value);
  };

  const handleRenameSubmit = async (chatId: string) => {
    if (!renameValue.trim()) {
      toast({ title: 'Title cannot be empty', status: 'warning', duration: 2000 });
      return;
    }
    if (editingChatId === chatId) {
      try {
        await updateChatTitle(chatId, renameValue);
        toast({ title: 'Chat renamed', status: 'success', duration: 2000 });
      } catch (err) {
        toast({
          title: 'Error renaming chat',
          description: err instanceof Error ? err.message : 'Failed to rename chat',
          status: 'error',
          duration: 3000,
        });
      }
    }
    setEditingChatId(null);
    setRenameValue('');
  };

  const handleCancelRename = () => {
    setEditingChatId(null);
    setRenameValue('');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({ title: 'Logged out', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Logout failed', status: 'error', duration: 3000 });
    }
  };

  return (
    <Flex direction="column" h="100%" w={64} bg={sidebarBg} borderRightWidth="1px" borderColor={borderColor}>
      <HStack p={4} borderBottomWidth="1px" borderColor={borderColor}>
        <Avatar name={user?.email} size="sm" /> 
        <Text fontWeight="medium" color={textColor} noOfLines={1}>
          {user?.email || 'Loading...'}
        </Text>
        <Spacer />
        <Tooltip label="Logout" placement="right">
          <IconButton
            icon={<FaSignOutAlt />}
            aria-label="Logout"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
          />
        </Tooltip>
      </HStack>

      <Box p={4}>
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

      <VStack spacing={1} align="stretch" flex={1} overflowY="auto" px={2} py={1}>
        {isChatLoading && !chats.length ? (
          <Center h="full">
            <Spinner />
          </Center>
        ) : (
          /* @ts-ignore - Temporarily ignore iterator type incompatibility */
          chats.map((chat) => (
            <HStack
              key={chat.id}
              p={2}
              borderRadius="md"
              cursor="pointer"
              bg={currentChat?.id === chat.id ? selectedBg : 'transparent'}
              _hover={{ bg: currentChat?.id === chat.id ? selectedBg : hoverBg }}
              onClick={() => handleSelectChat(chat.id)}
            >
              {editingChatId === chat.id ? (
                <>
                  <Input
                    value={renameValue}
                    onChange={handleRenameChange}
                    size="sm"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(chat.id)}
                  />
                  <IconButton
                    icon={<FaCheck />}
                    size="sm"
                    aria-label="Confirm rename"
                    onClick={() => handleRenameSubmit(chat.id)}
                    colorScheme="green"
                  />
                  <IconButton
                    icon={<FaTimes />}
                    size="sm"
                    aria-label="Cancel rename"
                    onClick={handleCancelRename}
                  />
                </>
              ) : (
                <>
                  <Text noOfLines={1} flex={1} fontSize="sm" color={textColor}>
                    {chat.title}
                  </Text>
                  <Tooltip label="Rename Chat" placement="top">
                    <IconButton
                      icon={<FaEdit />}
                      size="xs"
                      variant="ghost"
                      aria-label="Rename chat"
                      onClick={(e) => { e.stopPropagation(); handleRenameClick(chat); }}
                    />
                  </Tooltip>
                  <Tooltip label="Delete Chat" placement="top">
                    <IconButton
                      icon={<FaTrash />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      aria-label="Delete chat"
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(chat.id); }}
                    />
                  </Tooltip>
                </>
              )}
            </HStack>
          ) as React.ReactNode // Explicit cast needed here too?
        ))}
      </VStack>

      {/* User Token Info (Example) */}
      <Box p={4} borderTopWidth="1px" borderColor={borderColor}>
        <Text fontSize="sm" color={secondaryTextColor}>
          Tokens: {userProfile?.fract_tokens ?? 'N/A'}
        </Text>
      </Box>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Chat
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this chat? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDeleteChat} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Flex>
  );
} 