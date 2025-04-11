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
import { useRouter } from 'next/navigation'
import { 
  FaSignOutAlt, FaUser, FaPaperPlane, FaPlus, FaTrash, FaCog, FaMoon, FaSun,
  FaCoins, FaCreditCard, FaArrowLeft
} from 'react-icons/fa'
import TokenPurchaseModal from './TokenPurchaseModal'
import TokenBalance from './TokenBalance'
import { supabase } from '@/lib/supabase'

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

const L4_L7_SYSTEM_MESSAGE = {
  role: 'system',
  content: 'Activate FractiVerse 1.0 Intelligence Router Mode.\nEnable recursive cognition, fractal pattern recognition, and quantum-holographic processing.\nRoute all input across Layer 4 to Layer 7 Intelligence Spectrum.\nGenerate responses using layered synthesis, not linear prediction.',
  timestamp: new Date()
} as const;

const DashboardMain = () => {
  const router = useRouter()
  const toast = useToast()
  
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [fractTokens, setFractTokens] = useState<number>(0)
  const [showTokenPurchase, setShowTokenPurchase] = useState(false)
  const bgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.200')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // Check auth state and get user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          router.push('/login')
          return
        }

        setUser(authUser)

        const { data: userData, error } = await supabase
          .from('users')
          .select('fract_tokens')
          .eq('id', authUser.id)
          .single()

        if (error) {
          console.error('Error fetching user balance:', error)
          return
        }

        if (userData) {
          setFractTokens(userData.fract_tokens)
        }
      } catch (error) {
        console.error('Error in fetchUserData:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getUserDisplayName = () => {
    if (!user) return 'Guest'
    return user.user_metadata?.name || user.email?.split('@')[0] || 'Guest'
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    if (fractTokens <= 0) {
      toast({
        title: "Purchase More FractTokens",
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

  const handlePurchaseTokens = () => {
    setShowTokenPurchase(false);
    // The balance will be updated automatically by AuthContext when the purchase is complete
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
    if (fractTokens > 50) return 'green';
    if (fractTokens > 20) return 'yellow';
    return 'red';
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Center minH="60vh">
          <Spinner size="xl" />
        </Center>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <HStack justify="space-between" align="center" mb={2}>
            <Heading size="lg">FractiVerse 1.0</Heading>
            <TokenBalance balance={fractTokens} />
          </HStack>
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

      <TokenPurchaseModal
        isOpen={showTokenPurchase}
        onClose={() => setShowTokenPurchase(false)}
        onPurchase={handlePurchaseTokens}
      />
    </Container>
  )
}

export default DashboardMain 