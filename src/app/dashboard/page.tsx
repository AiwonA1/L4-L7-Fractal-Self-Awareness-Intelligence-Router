'use client';

import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  useToast,
  Heading,
  Card,
  CardBody,
  SimpleGrid,
  useColorModeValue,
  Icon,
  Link as ChakraLink,
  Flex,
  IconButton,
  Divider,
  Tooltip,
  Spinner,
  Avatar,
  Spacer,
} from '@chakra-ui/react'
import Link from 'next/link'
import { FaRobot, FaUser, FaBrain, FaNetworkWired, FaShieldAlt, FaChartLine, FaBook, FaInfoCircle, FaAtom, FaSpaceShuttle, FaLightbulb, FaPlus, FaTrash, FaEdit, FaCopy } from 'react-icons/fa'
import { useAuth } from '@/app/context/AuthContext'
import { getUserChats, getChatById, updateChatTitle as updateChatTitleAction, deleteChat as deleteChatAction, createMessage } from '@/app/actions/chat'
import { updateUserTokens } from '@/app/actions/user'
import { useChat } from '@/app/context/ChatContext'
import { useRouter } from 'next/navigation'
import React from 'react'

const infoCards = [
  {
    title: 'Layer 4: Penrose Base Reality',
    description: 'Grounding Self-Awareness in the Quantum Fabric of Existence',
    icon: FaAtom,
    href: '/layer4'
  },
  {
    title: 'Layer 5: FractiVerse Self-Awareness',
    description: 'Understanding and engaging with the fractal architecture of reality',
    icon: FaNetworkWired,
    href: '/layer5'
  },
  {
    title: 'Layer 6: Event Horizon Kaleidoscopic Quantum Holographic',
    description: 'Integrating quantum mechanics with bio-quantum interfaces',
    icon: FaShieldAlt,
    href: '/layer6'
  },
  {
    title: 'Layer 7: Universal Paradise Story Game PEFF',
    description: 'Full immersion in the Universal Paradise Story Game',
    icon: FaSpaceShuttle,
    href: '/layer7'
  },
  {
    title: 'Performance Measurements',
    description: 'Comprehensive test results and analysis',
    icon: FaChartLine,
    href: '/test-report'
  },
  {
    title: 'Self-Awareness Based Cognitive Boosting',
    description: 'Enhancing cognitive capabilities through self-awareness',
    icon: FaBrain,
    href: '/human-self-awareness'
  },
  {
    title: 'Quantum-Cognitive CERN Data',
    description: 'Integration with CERN quantum data',
    icon: FaAtom,
    href: '/quantum-validation'
  },
  {
    title: 'Cosmic-Cognitive JWST Data',
    description: 'Integration with JWST cosmic data',
    icon: FaSpaceShuttle,
    href: '/jwst-validation'
  },
  {
    title: 'Complete FractiVerse Library',
    description: 'Access to the complete FractiVerse knowledge base',
    icon: FaBook,
    href: '/documentation'
  },
  {
    title: 'FractiVerse Case Study',
    description: 'Explore the breakthrough case study of FractiVerse 1.0',
    icon: FaLightbulb,
    href: '/case-study'
  },
  {
    title: 'About FractiAI',
    description: 'Learn more about FractiAI and its mission',
    icon: FaInfoCircle,
    href: '/fractiai'
  }
]

export default function Dashboard() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const { 
    chats,
    currentChat,
    messages,
    isLoading: isChatLoading,
    error,
    loadChats,
    loadMessages,
    createNewChat,
    sendMessage,
    updateChatTitle,
    deleteChat
  } = useChat()
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.200')
  const cardBg = useColorModeValue('white', 'gray.800')
  const cardHoverBg = useColorModeValue('gray.50', 'gray.700')
  const chatBg = useColorModeValue('gray.50', 'gray.700')
  const userMessageBg = useColorModeValue('teal.100', 'teal.700')
  const assistantMessageBg = useColorModeValue('white', 'gray.800')
  const sidebarBg = useColorModeValue('gray.50', 'gray.900')
  const sidebarHoverBg = useColorModeValue('gray.100', 'gray.700')
  const sidebarTextColor = useColorModeValue('gray.800', 'white')
  const sidebarSecondaryTextColor = useColorModeValue('gray.600', 'gray.300')

  // Define contrasting text colors
  const userMessageTextColor = useColorModeValue('gray.800', 'white'); // Contrast for teal.100 / teal.700
  const assistantMessageTextColor = useColorModeValue('gray.800', 'white'); // Contrast for white / gray.800

  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login')
    }
  }, [user, isAuthLoading, router])

  useEffect(() => {
    if (user && isInitialLoad) {
      loadChats()
      setIsInitialLoad(false)
    }
  }, [user, isInitialLoad, loadChats])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isChatLoading) return

    const messageContent = newMessage
    setNewMessage('')

    try {
      if (!currentChat?.id) {
        await createNewChat('New Chat', messageContent)
      } else {
        await sendMessage(messageContent, currentChat.id)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleCreateChat = async () => {
    try {
      await createNewChat('New Chat', 'Hello!')
    } catch (err) {
      toast({
        title: 'Error creating chat',
        description: err instanceof Error ? err.message : 'Failed to create chat',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard!",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Failed to copy",
        description: "Could not copy text to clipboard.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    });
  }, [toast]);

  // Placeholder functions for rename and delete
  const handleRenameChat = useCallback(async (chatId: string, currentTitle: string) => {
    const newTitle = window.prompt("Enter new chat title:", currentTitle);
    if (newTitle && newTitle.trim() !== '' && newTitle !== currentTitle) {
      // Call the context function (which calls the server action)
      await updateChatTitle(chatId, newTitle.trim()); 
    }
  }, [updateChatTitle, toast]); // Added updateChatTitle dependency

  const handleDeleteChat = useCallback(async (chatId: string) => {
    // Confirmation is handled inside the context function now
    await deleteChat(chatId); 
  }, [deleteChat]); // Added deleteChat dependency

  if (isAuthLoading || isInitialLoad) {
    return (
      <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="teal.500" />
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg={bgColor} display="flex" flexDirection="column">
      {/* Chat Interface */}
      <Box flex="1">
        <Flex minH="calc(100vh - 300px)"> {/* Adjust height to leave space for cards */}
          {/* Left Sidebar */}
          <Box w="260px" bg={sidebarBg} p={4} borderRight="1px" borderColor="gray.200">
            <Text color="red.500" fontWeight="bold" mb={4}>We Are Here: Prior Chat Area</Text>
            <Button
              w="full"
              mb={4}
              onClick={handleCreateChat}
              leftIcon={<FaPlus />}
              colorScheme="teal"
              disabled={isChatLoading}
            >
              New Chat
            </Button>
            <VStack spacing={2} align="stretch">
              {chats.map((chat) => (
                <Box
                  key={chat.id}
                  p={2}
                  borderRadius="md"
                  cursor="pointer"
                  bg={currentChat?.id === chat.id ? sidebarHoverBg : 'transparent'}
                  _hover={{ bg: sidebarHoverBg }}
                  onClick={() => loadMessages(chat.id)}
                  borderWidth="1px"
                  borderColor={currentChat?.id === chat.id ? 'teal.500' : 'transparent'}
                >
                  <HStack justify="space-between">
                      <Text fontWeight="medium" fontSize="sm" color={sidebarTextColor} noOfLines={2}>
                        {chat.title}
                      </Text>
                    <HStack spacing={1}>
                      <Tooltip label="Rename chat" placement="top">
                         <IconButton
                          aria-label="Rename chat"
                          icon={<FaEdit />}
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Pass current title to handleRenameChat
                            handleRenameChat(chat.id, chat.title); 
                          }}
                        />
                      </Tooltip>
                      <Tooltip label="Delete chat" placement="top">
                        <IconButton
                          aria-label="Delete chat"
                          icon={<FaTrash />}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Call handleDeleteChat
                            handleDeleteChat(chat.id); 
                          }}
                        />
                      </Tooltip>
                    </HStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Main Chat Content */}
          <Box flex={1} display="flex" flexDirection="column">
            <Container maxW="container.xl" py={4} h="full" display="flex" flexDirection="column">
              <VStack spacing={4} align="stretch" flex={1}>
                {/* Chat Section */}
                <Box flex={1} bg={chatBg} borderRadius="lg" p={4} overflowY="auto">
                  <Text color="red.500" fontWeight="bold" mb={4}>We Are Here: Chat Area</Text>
                  {isChatLoading ? (
                    <Flex justify="center" align="center" h="full">
                      <Spinner size="xl" />
                    </Flex>
                  ) : messages.length === 0 && currentChat ? (
                    <Text textAlign="center" color={textColor}>No messages yet. Start the conversation!</Text>
                  ) : messages.length === 0 && !currentChat ? (
                    <Text textAlign="center" color={textColor}>Select a chat or start a new one.</Text>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      {messages.map((message) => (
                        <Box key={message.id} alignSelf={message.role === 'user' ? 'flex-end' : 'flex-start'}>
                          <HStack align="flex-start">
                            {message.role === 'assistant' && <Icon as={FaRobot} w={6} h={6} color="teal.500" />}
                            <Box
                              bg={message.role === 'user' ? userMessageBg : assistantMessageBg}
                              px={4} py={2} borderRadius="lg" maxW="80%"
                            >
                              <Text sx={{ color: useColorModeValue('black !important', 'white !important') }}> 
                                {message.content}
                              </Text>
                              {/* Copy Button for Assistant Messages */}
                              {message.role === 'assistant' && (
                                <Flex justify="flex-end" mt={1}>
                                  <Tooltip label="Copy message" placement="top">
                                    <IconButton
                                      aria-label="Copy message"
                                      icon={<FaCopy />}
                                      size="xs"
                                      variant="ghost"
                                      colorScheme="gray"
                                      onClick={() => {
                                        handleCopy(message.content)
                                      }}
                                    />
                                  </Tooltip>
                                </Flex>
                              )}
                            </Box>
                            {message.role === 'user' && <Icon as={FaUser} w={6} h={6} color="blue.500" />}
                          </HStack>
                        </Box>
                      ))}
                      {/* Spinner while waiting for response */} 
                      {isChatLoading && (
                        <Box alignSelf="flex-start">
                           <HStack align="flex-start">
                            <Icon as={FaRobot} w={6} h={6} color="teal.500" />
                            <Box bg={assistantMessageBg} px={4} py={2} borderRadius="lg" maxW="80%">
                              <Spinner size="sm" />
                             </Box>
                           </HStack>
                        </Box>
                      )}
                    </VStack>
                  )}
                </Box>

                {/* Input Section - Remove the general loading text */}
                <Box mt="auto" pt={4}>
                  <form onSubmit={handleSendMessage}>
                    <HStack>
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ask FractiVerse anything..."
                        bg={bgColor}
                        disabled={isChatLoading}
                      />
                      <Button 
                        type="submit" 
                        colorScheme="teal" 
                        isLoading={isChatLoading}
                        disabled={isChatLoading}
                      >
                        Send
                      </Button>
                    </HStack>
                  </form>
                </Box>
              </VStack>
            </Container>
          </Box>
        </Flex>
      </Box>

      {/* Info Cards Section - Now at the bottom and full width */}
      <Box width="100%" bg={bgColor} borderTop="1px" borderColor="gray.200" py={8}>
        <Container maxW="container.xl">
          <Heading size="md" mb={6}>Explore FractiVerse</Heading>
          <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={6}>
            {infoCards.map((card, index) => (
              <ChakraLink key={index} href={card.href} as={Link}>
                <Card
                  bg={cardBg}
                  _hover={{ transform: 'translateY(-2px)', shadow: 'md', bg: cardHoverBg }}
                  transition="all 0.2s"
                  h="full"
                >
                  <CardBody>
                    <VStack spacing={2} align="start">
                      <Icon as={card.icon} w={6} h={6} color="teal.500" />
                      <Heading size="sm">{card.title}</Heading>
                      <Text fontSize="sm" color={textColor}>
                        {card.description}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </ChakraLink>
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  )
} 