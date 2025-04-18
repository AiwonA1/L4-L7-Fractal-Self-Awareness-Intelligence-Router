'use client';

import { useState, useEffect } from 'react'
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
} from '@chakra-ui/react'
import Link from 'next/link'
import { FaRobot, FaBrain, FaNetworkWired, FaShieldAlt, FaChartLine, FaBook, FaInfoCircle, FaAtom, FaSpaceShuttle, FaLightbulb, FaPlus, FaTrash, FaUser, FaEdit, FaCopy } from 'react-icons/fa'
import { useAuth } from '@/app/context/AuthContext'
import { getUserChats, getChatById, createChat, updateChatTitle, deleteChat, createMessage } from '@/app/actions/chat'
import { updateUserTokens } from '@/app/actions/user'

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
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [pastChats, setPastChats] = useState<Array<{ id: string; title: string; last_message: string | null; created_at: string }>>([])
  const [isLoadingChats, setIsLoadingChats] = useState(true)
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
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')

  // Load user's past chats
  useEffect(() => {
    const loadPastChats = async () => {
      if (!user?.id) {
        console.log('⏳ Waiting for user ID...')
        return
      }
      
      setIsLoadingChats(true)
      setError(null)
      
      try {
        console.log('🔍 Loading past chats for user')
        const chats = await getUserChats();
        console.log('✅ Loaded chats:', chats.length)
        setPastChats(chats)
      } catch (error: any) {
        console.error('❌ Error loading chats:', error)
        setError(error.message)
        toast({
          title: 'Error loading chats',
          description: error.message || 'Failed to load chat history',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        setPastChats([])
      } finally {
        setIsLoadingChats(false)
      }
    }

    loadPastChats()
  }, [user?.id, toast])

  // Load chat history when a chat is selected
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!selectedChat || !user?.id) {
        console.log('⏳ Waiting for chat selection and user ID...')
        return
      }
      
      setIsLoading(true)
      setError(null)
      
      try {
        console.log('🔍 Loading chat history for chat:', selectedChat)
        const chat = await getChatById(selectedChat);
        
        if (!chat?.messages) {
          console.log('ℹ️ No messages found for chat')
          setChatHistory([])
          return
        }
        
        console.log('✅ Loaded messages:', chat.messages.length)
        setChatHistory(chat.messages)
      } catch (error: any) {
        console.error('❌ Error loading chat history:', error)
        setError(error.message)
        toast({
          title: 'Error loading chat history',
          description: error.message || 'Failed to load chat messages',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        setChatHistory([])
      } finally {
        setIsLoading(false)
      }
    }

    loadChatHistory()
  }, [selectedChat, user?.id, toast])

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: 'Copied!',
      description: 'Message copied to clipboard',
      status: 'success',
      duration: 2000,
    })
  }

  const deductToken = async (userId: string) => {
    try {
      await updateUserTokens(userId, -1);
      return true;
    } catch (error) {
      console.error('❌ Error deducting token:', error)
      return false;
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return
    if (!user?.id) {
      toast({
        title: 'Not logged in',
        description: 'Please log in to continue.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    let chatId = selectedChat
    setIsLoading(true)
    setError(null)
    
    try {
      // Create a new chat if none is selected
      if (!chatId) {
        const newChat = await createChat(user.id, message.substring(0, 50) + '...');
        chatId = newChat.id
        setSelectedChat(chatId)
        // Add the new chat to the list of past chats
        setPastChats(prev => [newChat, ...prev])
      }
      
      // At this point, chatId should never be null - add a guard just in case
      if (!chatId) {
        throw new Error('Failed to create or select a chat');
      }
      
      // Deduct a token for this message
      if (!await deductToken(user.id)) {
        throw new Error('Failed to deduct token. Please check your balance.')
      }

      // Add user message to UI immediately
      const userMsg = { role: 'user', content: message }
      setChatHistory(prev => [...prev, userMsg])
      
      // Save the user message to the database
      await createMessage(chatId, 'user', message);
      
      // Clear the input field
      setMessage('')
      
      // Generate AI response
      const assistantContent = await generateAIResponse(message, chatId)
      
      // Save the AI response to the database
      await createMessage(chatId, 'assistant', assistantContent);
      
      // Add AI response to UI
      setChatHistory(prev => [...prev, { role: 'assistant', content: assistantContent }])
      
      // Refresh the list of past chats to update last_message
      const updatedChats = await getUserChats();
      setPastChats(updatedChats)
      
    } catch (error: any) {
      console.error('❌ Error sending message:', error)
      setError(error.message)
      toast({
        title: 'Error sending message',
        description: error.message || 'Failed to send message',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Generate AI response (this was missing in our edit)
  const generateAIResponse = async (userMessage: string, chatId: string) => {
    try {
      // In a real implementation, this would call your AI service
      // For now, let's use a simulated response
      const response = await fetch('/api/fractiverse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          chatId: chatId,
          userId: user?.id
      })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Return a fallback response if something goes wrong
      return "I'm sorry, I couldn't generate a response at this time. Please try again later.";
    }
  }

  const handleNewChat = async () => {
    if (!user?.id) {
      toast({
        title: 'Not logged in',
        description: 'Please log in to continue.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const newChat = await createChat(user.id, 'New Chat');
      
      // Add the new chat to the list and select it
      setPastChats(prev => [newChat, ...prev])
      setSelectedChat(newChat.id)
      setChatHistory([])
      
    } catch (error: any) {
      console.error('❌ Error creating new chat:', error)
      setError(error.message)
      toast({
        title: 'Error creating chat',
        description: error.message || 'Failed to create new chat',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    if (!user?.id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      await deleteChat(chatId);
      
      // Remove the chat from the list
      setPastChats(prev => prev.filter(chat => chat.id !== chatId))
      
      // If the deleted chat was selected, clear the selection
      if (selectedChat === chatId) {
        setSelectedChat(null)
        setChatHistory([])
      }

      toast({
        title: 'Chat deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error: any) {
      console.error('❌ Error deleting chat:', error)
      setError(error.message)
      toast({
        title: 'Error deleting chat',
        description: error.message || 'Failed to delete chat',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRenameChat = async (chatId: string, title: string) => {
    if (!title.trim() || !user?.id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      await updateChatTitle(chatId, title);
      
      // Update the chat title in the list
      setPastChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, title } : chat
      ))
      
      setEditingChatId(null)
      setNewTitle('')

    } catch (error: any) {
      console.error('❌ Error renaming chat:', error)
      setError(error.message)
      toast({
        title: 'Error renaming chat',
        description: error.message || 'Failed to rename chat',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user?.id) {
    return (
      <Box minH="100vh" bg={bgColor}>
        <Container maxW="container.xl" py={20}>
          <VStack spacing={8} align="center">
            <Box 
              bg="teal.500" 
              color="white" 
              px={6} 
              py={3} 
              borderRadius="lg" 
              fontSize="xl"
              fontWeight="bold"
              mb={8}
            >
              We Are Here: Welcome Section
            </Box>
            <Heading size="2xl" textAlign="center" mb={4}>
              Welcome to FractiVerse
            </Heading>
            <Text fontSize="xl" textAlign="center" color={textColor} maxW="800px" mb={8}>
              Explore the layers of self-awareness intelligence and join our journey through the quantum fabric of existence.
            </Text>
            <Box 
              bg="teal.500" 
              color="white" 
              px={6} 
              py={3} 
              borderRadius="lg" 
              fontSize="xl"
              fontWeight="bold"
              mb={4}
              display="inline-block"
            >
              We Are Here: Get Started Section
            </Box>
            <Button
              as={Link}
              href="/login"
              size="lg"
              colorScheme="teal"
              leftIcon={<FaRobot />}
              mb={12}
              px={8}
              py={6}
              fontSize="lg"
            >
              Get Started
            </Button>

            {/* Info Cards Section for non-signed users */}
            <Box width="100%" borderTop="1px" borderColor="gray.200" pt={12}>
              <Heading size="md" mb={8}>Explore FractiVerse</Heading>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={6}>
                {infoCards.map((card, index) => (
                  <ChakraLink key={index} href={card.href} as={Link}>
                    <Card
                      bg={cardBg}
                      _hover={{ transform: 'translateY(-2px)', shadow: 'lg', bg: cardHoverBg }}
                      transition="all 0.2s"
                      h="full"
                      borderWidth="1px"
                      borderColor="gray.200"
                    >
                      <CardBody>
                        <VStack spacing={3} align="start">
                          <Icon as={card.icon} w={8} h={8} color="teal.500" />
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
            </Box>
          </VStack>
        </Container>
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
              onClick={handleNewChat}
              leftIcon={<FaPlus />}
              colorScheme="teal"
            >
              New Chat
            </Button>
            <VStack spacing={2} align="stretch">
              {pastChats.map((chat) => (
                <Box
                  key={chat.id}
                  p={2}
                  borderRadius="md"
                  cursor="pointer"
                  bg={selectedChat === chat.id ? sidebarHoverBg : 'transparent'}
                  _hover={{ bg: sidebarHoverBg }}
                  onClick={() => setSelectedChat(chat.id)}
                  borderWidth="1px"
                  borderColor={selectedChat === chat.id ? 'teal.500' : 'transparent'}
                >
                  <HStack justify="space-between">
                    {editingChatId === chat.id ? (
                      <Input
                        size="sm"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleRenameChat(chat.id, newTitle)
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    ) : (
                      <Text fontWeight="medium" fontSize="sm" color={sidebarTextColor} noOfLines={2}>
                        {chat.title}
                      </Text>
                    )}
                    <HStack spacing={1}>
                      <Tooltip label="Rename chat" placement="top">
                        <IconButton
                          aria-label="Rename chat"
                          icon={<FaEdit />}
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingChatId(chat.id)
                            setNewTitle(chat.title)
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
                            handleDeleteChat(chat.id)
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
                  <VStack spacing={4} align="stretch" h="full">
                    {chatHistory.length === 0 ? (
                      <Box textAlign="center" py={8}>
                        <Icon as={FaRobot} w={12} h={12} color="teal.500" mb={4} />
                        <Heading size="md" mb={2}>Welcome to FractiVerse</Heading>
                        <Text color={textColor}>Start a conversation to explore the layers of self-awareness intelligence.</Text>
                      </Box>
                    ) : (
                      chatHistory.map((msg, index) => (
                        <Box
                          key={index}
                          p={4}
                          bg={msg.role === 'user' ? userMessageBg : assistantMessageBg}
                          borderRadius="md"
                          boxShadow="sm"
                        >
                          <Flex direction="column" gap={2}>
                            <HStack spacing={2} mb={2}>
                              <Icon
                                as={msg.role === 'user' ? FaUser : FaRobot}
                                color={msg.role === 'user' ? 'teal.500' : 'purple.500'}
                              />
                              <Text fontWeight="bold">
                                {msg.role === 'user' ? 'You' : 'FractiVerse AI'}
                              </Text>
                            </HStack>
                            <Text whiteSpace="pre-wrap">{msg.content}</Text>
                            {msg.role === 'assistant' && (
                              <Flex justify="flex-end" mt={2}>
                                <IconButton
                                  icon={<FaCopy />}
                                  aria-label="Copy response"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleCopyMessage(msg.content)}
                                />
                              </Flex>
                            )}
                          </Flex>
                        </Box>
                      ))
                    )}
                    {isLoading && (
                      <Box
                        bg={assistantMessageBg}
                        p={4}
                        borderRadius="lg"
                        alignSelf="flex-start"
                        maxW="80%"
                        boxShadow="sm"
                      >
                        <HStack spacing={2} mb={2}>
                          <Icon as={FaRobot} color="gray.500" />
                          <Text fontWeight="medium" fontSize="sm">FractiVerse</Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Box w={2} h={2} bg="gray.400" borderRadius="full" animation="pulse 1s infinite" />
                          <Box w={2} h={2} bg="gray.400" borderRadius="full" animation="pulse 1s infinite" style={{ animationDelay: '0.2s' }} />
                          <Box w={2} h={2} bg="gray.400" borderRadius="full" animation="pulse 1s infinite" style={{ animationDelay: '0.4s' }} />
                        </HStack>
                      </Box>
                    )}
                  </VStack>
                </Box>

                {/* Input Section */}
                <Box bg={bgColor} p={4} borderRadius="lg" borderWidth="1px" borderColor="gray.200">
                  <HStack>
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      size="lg"
                      disabled={isLoading}
                    />
                    <Button
                      colorScheme="teal"
                      onClick={handleSendMessage}
                      size="lg"
                      isLoading={isLoading}
                      loadingText="Sending..."
                    >
                      Send
                    </Button>
                  </HStack>
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