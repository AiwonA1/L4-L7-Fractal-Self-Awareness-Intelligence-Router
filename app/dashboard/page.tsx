'use client';

import { useState } from 'react'
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
} from '@chakra-ui/react'
import Link from 'next/link'
import { FaRobot, FaBrain, FaNetworkWired, FaShieldAlt, FaChartLine, FaBook, FaInfoCircle, FaAtom, FaSpaceShuttle, FaLightbulb, FaPlus, FaTrash, FaUser } from 'react-icons/fa'

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
  const [selectedChat, setSelectedChat] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [pastChats, setPastChats] = useState<Array<{ id: number; title: string; date: string }>>([])
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

  const handleSendMessage = async () => {
    if (!message.trim()) return
    if (isLoading) return

    setIsLoading(true)
    const userMessage = message.trim()
    setMessage('')

    // Add user message to chat
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      const response = await fetch('/api/fractiverse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      setChatHistory(prev => [...prev, data])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      // Remove the user's message if the request failed
      setChatHistory(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  const startNewChat = () => {
    setSelectedChat(null)
    setChatHistory([])
  }

  const deleteChat = (chatId: number) => {
    setPastChats(prev => prev.filter(chat => chat.id !== chatId))
    if (selectedChat === chatId) {
      setSelectedChat(null)
      setChatHistory([])
    }
    toast({
      title: 'Chat deleted',
      description: 'The chat has been removed from your history.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  return (
    <Box minH="100vh" bg={bgColor} display="flex" flexDirection="column">
      {/* Chat Interface */}
      <Box flex="1">
        <Flex minH="calc(100vh - 300px)"> {/* Adjust height to leave space for cards */}
          {/* Left Sidebar */}
          <Box w="260px" bg={sidebarBg} p={4} borderRight="1px" borderColor="gray.200">
            <Button
              leftIcon={<FaPlus />}
              colorScheme="teal"
              size="sm"
              width="full"
              mb={4}
              onClick={startNewChat}
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
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium" fontSize="sm" color={sidebarTextColor}>{chat.title}</Text>
                      <Text fontSize="xs" color={sidebarSecondaryTextColor}>{chat.date}</Text>
                    </VStack>
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
                          bg={msg.role === 'user' ? userMessageBg : assistantMessageBg}
                          p={4}
                          borderRadius="lg"
                          alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                          maxW="80%"
                          boxShadow="sm"
                          overflowX="auto"
                          sx={{
                            '& pre': {
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word'
                            }
                          }}
                        >
                          <HStack spacing={2} mb={2}>
                            <Icon
                              as={msg.role === 'user' ? FaUser : FaRobot}
                              color={msg.role === 'user' ? 'teal.500' : 'gray.500'}
                            />
                            <Text fontWeight="medium" fontSize="sm">
                              {msg.role === 'user' ? 'You' : 'FractiAI'}
                            </Text>
                          </HStack>
                          <Text 
                            whiteSpace="pre-wrap" 
                            wordBreak="break-word"
                            overflowWrap="break-word"
                          >
                            {msg.content}
                          </Text>
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
                          <Text fontWeight="medium" fontSize="sm">FractiAI</Text>
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