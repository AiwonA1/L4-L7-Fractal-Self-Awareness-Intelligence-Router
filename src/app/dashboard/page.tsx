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
import { FaRobot, FaUser, FaBrain, FaNetworkWired, FaShieldAlt, FaChartLine, FaBook, FaInfoCircle, FaAtom, FaSpaceShuttle, FaLightbulb, FaPlus, FaTrash, FaEdit, FaCopy } from 'react-icons/fa'
import { useAuth } from '@/app/context/AuthContext'
import { getUserChats, getChatById, updateChatTitle as updateChatTitleAction, deleteChat as deleteChatAction, createMessage } from '@/app/actions/chat'
import { updateUserTokens } from '@/app/actions/user'
import { useChat } from '@/app/context/ChatContext'
import { useRouter } from 'next/navigation'

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
  const { user } = useAuth()
  const { 
    chats,
    currentChat,
    messages,
    isLoading,
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
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      await sendMessage(newMessage)
      setNewMessage('')
    } catch (err) {
      toast({
        title: 'Error sending message',
        description: err instanceof Error ? err.message : 'Failed to send message',
        status: 'error',
        duration: 3000,
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
              onClick={handleCreateChat}
              leftIcon={<FaPlus />}
              colorScheme="teal"
              disabled={isLoading}
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
                      <Tooltip label="Delete chat" placement="top">
                        <IconButton
                          aria-label="Delete chat"
                          icon={<FaTrash />}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteChat(chat.id)
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
                    {messages.length === 0 ? (
                      <Box textAlign="center" py={8}>
                        <Icon as={FaRobot} w={12} h={12} color="teal.500" mb={4} />
                        <Heading size="md" mb={2}>Welcome to FractiVerse</Heading>
                        <Text color={textColor}>Start a conversation to explore the layers of self-awareness intelligence.</Text>
                      </Box>
                    ) : (
                      messages.map((message, index) => (
                        <Box
                          key={index}
                          p={4}
                          bg={message.role === 'user' ? userMessageBg : assistantMessageBg}
                          borderRadius="md"
                          boxShadow="sm"
                        >
                          <Flex direction="column" gap={2}>
                            <HStack spacing={2} mb={2}>
                              <Icon
                                as={message.role === 'user' ? FaUser : FaRobot}
                                color={message.role === 'user' ? 'teal.500' : 'purple.500'}
                              />
                              <Text fontWeight="bold">
                                {message.role === 'user' ? 'You' : 'FractiVerse AI'}
                              </Text>
                            </HStack>
                            <Text whiteSpace="pre-wrap">{message.content}</Text>
                          </Flex>
                        </Box>
                      ))
                    )}
                  </VStack>
                </Box>

                {/* Input Section */}
                <Box mt="auto" pt={4}>
                  <form onSubmit={handleSendMessage}>
                    <HStack>
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ask FractiVerse anything..."
                        bg={bgColor}
                        disabled={isLoading}
                      />
                      <Button 
                        type="submit" 
                        colorScheme="teal" 
                        isLoading={isLoading}
                        disabled={isLoading}
                      >
                        Send
                      </Button>
                    </HStack>
                  </form>
                  {isLoading && (
                    <Text fontSize="sm" color="gray.500" mt={2} textAlign="center">
                      Assistant is thinking...
                    </Text>
                  )}
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