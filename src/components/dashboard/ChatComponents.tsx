import React, { useRef, useState, type ReactNode } from 'react'
import {
  Box,
  Flex,
  IconButton,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  FormControl,
  FormLabel,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  type ThemingProps,
  type BoxProps,
  type FlexProps,
  type ModalProps,
  type FormControlProps,
} from '@chakra-ui/react'
import { format } from 'date-fns'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import type { ChatListItem } from '@/types/chat'

interface ChatContainerProps {
  chats: ChatListItem[]
  currentChatId?: string
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
  onRenameChat: (chatId: string, newTitle: string) => void
}

export const ChatContainer = ({
  chats,
  currentChatId,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
}: ChatContainerProps) => {
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure()

  const {
    isOpen: isRenameOpen,
    onOpen: onRenameOpen,
    onClose: onRenameClose,
  } = useDisclosure()

  const [selectedChat, setSelectedChat] = useState<ChatListItem | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const cancelRef = useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (selectedChat) {
      setNewTitle(selectedChat.title)
    }
  }, [selectedChat])

  const handleRenameClick = (chat: ChatListItem) => {
    setSelectedChat(chat)
    setNewTitle(chat.title)
    onRenameOpen()
  }

  const handleDeleteClick = (chat: ChatListItem) => {
    setSelectedChat(chat)
    onDeleteOpen()
  }

  const handleRenameSubmit = () => {
    if (selectedChat && newTitle.trim()) {
      onRenameChat(selectedChat.id, newTitle.trim())
      onRenameClose()
    }
  }

  const handleDeleteConfirm = () => {
    if (selectedChat) {
      onDeleteChat(selectedChat.id)
      onDeleteClose()
    }
  }

  return (
    <Box>
      <Flex direction="column" gap={2}>
        {chats.map((chat) => (
          <Box
            key={chat.id}
            p={3}
            borderRadius="md"
            bg={chat.id === currentChatId ? 'gray.100' : 'transparent'}
            _hover={{ bg: 'gray.50' }}
            cursor="pointer"
            onClick={() => onSelectChat(chat.id)}
          >
            <Flex justify="space-between" align="center">
              <Box flex={1}>
                <Text fontWeight="medium" noOfLines={1}>
                  {chat.title}
                </Text>
                {chat.updated_at && (
                  <Text fontSize="xs" color="gray.500">
                    {format(new Date(chat.updated_at), 'MMM d, yyyy')}
                  </Text>
                )}
              </Box>
              <Flex gap={2}>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRenameClick(chat)
                  }}
                >
                  Rename
                </Button>
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteClick(chat)
                  }}
                >
                  Delete
                </Button>
              </Flex>
            </Flex>
          </Box>
        ))}
      </Flex>

      <Modal isOpen={isRenameOpen} onClose={onRenameClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Rename Chat</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>New Title</FormLabel>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter new title"
                autoFocus
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRenameClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleRenameSubmit}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Chat
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete &quot;{selectedChat?.title}&quot;? This action
              cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
} 