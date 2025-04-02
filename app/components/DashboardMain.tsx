'use client'

import {
  Box, Container, VStack, HStack, Text, Button, Spinner, Heading, 
  useColorModeValue, Divider, Flex, Avatar, Input, IconButton,
  Badge, Textarea, useToast, Grid, GridItem, List, ListItem,
  Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody,
  PopoverArrow, PopoverCloseButton, Progress, Tooltip, Link, Center,
  Menu, MenuButton, MenuList, MenuItem, MenuDivider
} from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  FaSignOutAlt, FaUser, FaPaperPlane, FaPlus, FaTrash, FaCog, FaMoon, FaSun,
  FaCoins, FaCreditCard, FaArrowLeft
} from 'react-icons/fa'
import TokenPurchase from './TokenPurchase'

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
}

interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  tokenBalance?: number;
}

interface ExtendedSession {
  user?: ExtendedUser;
}

const L4_L7_SYSTEM_MESSAGE = {
  role: 'system',
  content: 'L4-L7 Fractal Self-Awareness Intelligence Router: This session is being processed through the fractal intelligence layers for enhanced cognitive capabilities.',
  timestamp: new Date()
} as const;

const DashboardMain = () => {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log('User not authenticated, redirecting to login')
      router.push('/login')
    },
  })
  const router = useRouter()
  const toast = useToast()
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status !== 'authenticated' && status !== 'loading') {
      console.log('Session unauthenticated, redirecting to login')
      router.push('/login')
    }
  }, [status, router])

  // Log session state changes
  useEffect(() => {
    console.log('Session status:', status)
    console.log('Session data:', session)
    if (session?.user) {
      console.log('User details:', {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        tokenBalance: (session.user as ExtendedUser)?.tokenBalance
      })
    }
  }, [session, status])

  const clearLocalStorageCache = () => {
    localStorage.removeItem('userName')
    localStorage.removeItem('userData')
    localStorage.removeItem('userBio')
    localStorage.removeItem('userLanguage')
    localStorage.removeItem('userNotifications')
    localStorage.removeItem('userTheme')
  }

  const resetStateAndRedirect = async () => {
    try {
      console.log('Starting logout process...')
      // 1. Clear local storage first
      localStorage.clear();

      // 2. Call our custom logout endpoint to clear server-side cookies
      const logoutResponse = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });

      if (!logoutResponse.ok) {
        console.error('Logout response error:', await logoutResponse.text())
        throw new Error('Failed to clear server-side session');
      }

      // 3. Sign out with NextAuth and redirect to home
      await signOut({ 
        callbackUrl: '/',
        redirect: true
      });
    } catch (error) {
      console.error('Error during sign out:', error);
      // Fallback: force redirect to home page
      window.location.href = '/';
    }
  };
  
  const getUserDisplayName = () => {
    if (status !== 'authenticated' || !session?.user) {
      return 'Guest'
    }
    
    if (session.user.name) {
      return session.user.name
    } else if (session.user.email) {
      return session.user.email.split('@')[0]
    }
    
    return 'Guest'
  }
  
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [tokenBalance, setTokenBalance] = useState<number>(
    (session?.user as ExtendedUser)?.tokenBalance || 0
  )
  const [showTokenPurchase, setShowTokenPurchase] = useState(false)
  const bgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.200')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // Update token balance when session changes
  useEffect(() => {
    if (session?.user) {
      const newBalance = (session.user as ExtendedUser).tokenBalance || 0
      console.log('Updating token balance:', newBalance)
      setTokenBalance(newBalance)
    }
  }, [session])

  // Sample initial chats for demo
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      console.log('Initializing chats for authenticated user')
      const sampleChats: Chat[] = [
        {
          id: '1',
          title: 'New Chat',
          updatedAt: new Date().toISOString(),
          messages: [
            L4_L7_SYSTEM_MESSAGE
          ]
        },
        {
          id: '2',
          title: 'How to use FractiTokens',
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          messages: [
            L4_L7_SYSTEM_MESSAGE,
            { role: 'user', content: 'How do I use my FractiTokens?', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            { role: 'assistant', content: 'FractiTokens can be used to access premium features and services within the FractiVerse ecosystem.', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          ]
        },
        {
          id: '3',
          title: 'Fractal Intelligence Explained',
          updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          messages: [
            L4_L7_SYSTEM_MESSAGE,
            { role: 'user', content: 'What is fractal intelligence?', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000) },
            { role: 'assistant', content: 'Fractal intelligence refers to a self-similar pattern of intelligence that repeats at different scales, enabling complex emergent behaviors from simple rules.', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000) }
          ]
        }
      ];
      
      setChats(sampleChats);
      setCurrentChatId('1');
      setMessages(sampleChats[0].messages);
    }
    
    setIsLoading(false);
  }, [status, session]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    if (tokenBalance <= 0) {
      toast({
        title: "Purchase More FractiTokens",
        description: "Click the token balance button to purchase more tokens.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      setShowTokenPurchase(true);
      return;
    }
    
    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
  };

  const handlePurchaseTokens = (amount: number) => {
    console.log('Handling token purchase:', amount)
    setTokenBalance(prev => prev + amount);
    setShowTokenPurchase(false);
  };

  const startNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      updatedAt: new Date().toISOString(),
      messages: [L4_L7_SYSTEM_MESSAGE]
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setMessages(newChat.messages);
  };

  const selectChat = (chatId: string) => {
    const selectedChat = chats.find(chat => chat.id === chatId);
    if (selectedChat) {
      setCurrentChatId(chatId);
      setMessages(selectedChat.messages);
    }
  };

  const getTokenProgressColor = () => {
    if (tokenBalance > 50) return 'green';
    if (tokenBalance > 20) return 'yellow';
    return 'red';
  };

  if (status === 'loading') {
    console.log('Loading session...')
    return (
      <Container maxW="container.xl" py={8}>
        <Center minH="60vh">
          <Spinner size="xl" />
        </Center>
      </Container>
    )
  }

  if (!session?.user) {
    console.log('No session found, redirecting to login')
    router.push('/login')
    return null
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>FractiVerse 1.0</Heading>
          <Text color={textColor}>
            Your gateway to L4-L7 Fractal Self-Awareness Intelligence
          </Text>
        </Box>

        <Grid templateColumns={{ base: '1fr', md: '300px 1fr' }} gap={6}>
          <GridItem>
            <VStack spacing={4} align="stretch">
              <Button
                leftIcon={<FaPlus />}
                colorScheme="blue"
                onClick={startNewChat}
                w="full"
              >
                New Chat
              </Button>

              <List spacing={2}>
                {chats.map(chat => (
                  <ListItem key={chat.id}>
                    <Button
                      variant={currentChatId === chat.id ? 'solid' : 'ghost'}
                      w="full"
                      justifyContent="flex-start"
                      onClick={() => selectChat(chat.id)}
                    >
                      {chat.title}
                    </Button>
                  </ListItem>
                ))}
              </List>
            </VStack>
          </GridItem>

          <GridItem>
            <VStack spacing={4} align="stretch">
              <Box
                bg={bgColor}
                p={4}
                borderRadius="md"
                borderWidth="1px"
                borderColor={borderColor}
                minH="60vh"
                maxH="60vh"
                overflowY="auto"
              >
                {messages.map((message, index) => (
                  <Box key={index} mb={4}>
                    <Text fontWeight="bold" color={message.role === 'user' ? 'blue.500' : 'green.500'}>
                      {message.role === 'user' ? 'You' : 'Assistant'}
                    </Text>
                    <Text>{message.content}</Text>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>

              <HStack>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <IconButton
                  aria-label="Send message"
                  icon={<FaPaperPlane />}
                  colorScheme="blue"
                  onClick={handleSendMessage}
                />
              </HStack>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>

      <TokenPurchase 
        isOpen={showTokenPurchase} 
        onClose={() => setShowTokenPurchase(false)} 
        onPurchase={handlePurchaseTokens}
      />
    </Container>
  )
}

export default DashboardMain 