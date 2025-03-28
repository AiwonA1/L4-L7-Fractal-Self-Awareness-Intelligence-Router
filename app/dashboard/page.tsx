'use client'

import { Box, Container, VStack, HStack, Text, Icon, Button, useColorModeValue, Textarea, Divider, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, Tabs, TabList, TabPanels, Tab, TabPanel, Badge, FormControl, FormLabel, Select, Input, Menu, MenuButton, MenuList, MenuItem, IconButton, Avatar, Flex, ModalFooter, Heading, MenuDivider, Spinner, Progress, Grid, Link as ChakraLink } from '@chakra-ui/react'
import { FaBrain, FaLayerGroup, FaLightbulb, FaInfinity, FaPaperPlane, FaUser, FaSignOutAlt, FaCoins, FaChartLine, FaWallet, FaCreditCard, FaHistory, FaLock, FaPlus, FaChartBar, FaFileUpload, FaCopy, FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FRACTIVERSE_KEY, FRACTIVERSE_PROMPT } from '@/app/constants/key'
import { useMediaQuery } from '@chakra-ui/react'

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface UsageStats {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  fractiTokensUsed: number;
}

const Message = ({ content, isUser = false }: { content: string; isUser?: boolean }) => {
  const bgColor = useColorModeValue(isUser ? 'teal.50' : 'white', isUser ? 'gray.700' : 'gray.800')
  const textColor = useColorModeValue('gray.800', 'white')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box
      w="full"
      p={4}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      mb={4}
      _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
      transition="all 0.2s"
    >
      <VStack spacing={3} align="start">
        <HStack spacing={3} align="start">
          <Icon
            as={isUser ? FaUser : FaBrain}
            w={6}
            h={6}
            color={isUser ? 'teal.500' : 'green.500'}
            mt={1}
          />
          <Text color={textColor} whiteSpace="pre-wrap">
            {content}
          </Text>
        </HStack>
      </VStack>
    </Box>
  )
}

const TokenPurchaseModal = ({ isOpen, onClose, onPurchase }: { isOpen: boolean; onClose: () => void; onPurchase: (amount: number) => Promise<void> }) => {
  const [amount, setAmount] = useState(100)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const toast = useToast()

  const handleSubmit = async () => {
    if (!cardNumber || !expiry || !cvv) {
      toast({
        title: 'Error',
        description: 'Please fill in all card details',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (isProcessing) {
      return
    }

    setIsProcessing(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await onPurchase(amount)
      setCardNumber('')
      setExpiry('')
      setCvv('')
      setAmount(100)
    } catch (error) {
      console.error('Purchase error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Purchase FractiTokens</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Amount</FormLabel>
              <Select value={amount} onChange={(e) => setAmount(Number(e.target.value))}>
                <option value={100}>100 FractiTokens - $20</option>
                <option value={500}>500 FractiTokens - $90</option>
                <option value={1000}>1000 FractiTokens - $160</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Card Number</FormLabel>
              <Input
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={19}
                pattern="[0-9\s]*"
                isDisabled={isProcessing}
              />
            </FormControl>

            <HStack spacing={4}>
              <FormControl>
                <FormLabel>Expiry</FormLabel>
                <Input
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  maxLength={5}
                  pattern="[0-9/]*"
                  isDisabled={isProcessing}
                />
              </FormControl>
              <FormControl>
                <FormLabel>CVV</FormLabel>
                <Input
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength={4}
                  pattern="[0-9]*"
                  isDisabled={isProcessing}
                />
              </FormControl>
            </HStack>

            <Button
              colorScheme="teal"
              onClick={handleSubmit}
              isLoading={isProcessing}
              loadingText="Processing..."
              isDisabled={!cardNumber || !expiry || !cvv || isProcessing}
            >
              Complete Purchase
            </Button>

            <Text fontSize="sm" color="gray.500" textAlign="center">
              This is a simulated purchase. No actual charges will be made.
              Each FractiToken grants one access to the Router.
            </Text>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

const UsageStatsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchStats()
    }
  }, [isOpen])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/usage')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch usage statistics')
      }

      setStats(data)
    } catch (error) {
      console.error('Error fetching usage stats:', error)
      setError(error instanceof Error ? error.message : 'Failed to load usage statistics')
      toast({
        title: 'Error',
        description: 'Failed to load usage statistics',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Router Usage Statistics</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {isLoading ? (
            <Box textAlign="center" py={8}>
              <Spinner size="xl" color="teal.500" />
              <Text mt={4}>Loading usage statistics...</Text>
            </Box>
          ) : error ? (
            <Box textAlign="center" py={8}>
              <Text color="red.500">{error}</Text>
              <Button mt={4} colorScheme="teal" onClick={fetchStats}>
                Retry
              </Button>
            </Box>
          ) : stats ? (
            <VStack spacing={6} align="stretch">
              {/* Total Usage */}
              <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
                <Heading size="sm" mb={4}>Total Router Usage</Heading>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Box>
                    <Text color="gray.500">FractiTokens Used</Text>
                    <Text fontSize="xl" fontWeight="bold">{stats.totalUsage.fractiTokensUsed.toLocaleString()}</Text>
                  </Box>
                  <Box>
                    <Text color="gray.500">Total Cost</Text>
                    <Text fontSize="xl" fontWeight="bold">${stats.totalUsage.cost.toFixed(2)}</Text>
                  </Box>
                </Grid>
              </Box>

              {/* Daily Usage */}
              <Box>
                <Heading size="sm" mb={4}>Daily Router Usage (Last 30 Days)</Heading>
                <VStack spacing={2} align="stretch">
                  {stats.dailyUsage.map((day: any) => (
                    <Box key={day.timestamp} p={3} bg={useColorModeValue('white', 'gray.800')} borderRadius="md" borderWidth="1px">
                      <HStack justify="space-between">
                        <Text>{new Date(day.timestamp).toLocaleDateString()}</Text>
                        <HStack spacing={4}>
                          <Text>{day._sum.fractiTokensUsed.toLocaleString()} FractiTokens</Text>
                          <Text>${day._sum.cost.toFixed(2)}</Text>
                        </HStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </Box>

              {/* Chat Usage */}
              <Box>
                <Heading size="sm" mb={4}>Usage by Chat</Heading>
                <VStack spacing={2} align="stretch">
                  {stats.chatUsage.map((chat: any) => (
                    <Box key={chat.id} p={3} bg={useColorModeValue('white', 'gray.800')} borderRadius="md" borderWidth="1px">
                      <VStack align="stretch" spacing={2}>
                        <Text fontWeight="bold">{chat.title}</Text>
                        <HStack justify="space-between">
                          <Text>{chat.usage[0]?.fractiTokensUsed.toLocaleString() || 0} FractiTokens</Text>
                          <Text>${chat.usage[0]?.cost.toFixed(2) || '0.00'}</Text>
                        </HStack>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </Box>

              <Text fontSize="sm" color="gray.500" textAlign="right">
                Last updated: {new Date(stats.lastUpdated).toLocaleString()}
              </Text>
            </VStack>
          ) : null}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

const TokenBalanceModal = ({ isOpen, onClose, balance, onPurchase }: { isOpen: boolean; onClose: () => void; balance: number; onPurchase: () => void }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>FractiToken Balance</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
              <Text fontSize="sm" color="gray.500">Current Balance</Text>
              <Text fontSize="3xl" fontWeight="bold" color="teal.500">
                {balance} FractiTokens
              </Text>
              <Text fontSize="xs" color="gray.500" mt={2}>
                1 FractiToken = 1 Router Access
              </Text>
            </Box>

            <Box>
              <Text fontSize="sm" color="gray.500" mb={4}>FractiToken Packages</Text>
              <VStack spacing={3} align="stretch">
                <Button
                  variant="outline"
                  colorScheme="teal"
                  onClick={() => {
                    onClose()
                    onPurchase()
                  }}
                >
                  <HStack justify="space-between" w="full">
                    <Text>100 FractiTokens</Text>
                    <Text fontWeight="bold">$20</Text>
                  </HStack>
                </Button>
                <Button
                  variant="outline"
                  colorScheme="teal"
                  onClick={() => {
                    onClose()
                    onPurchase()
                  }}
                >
                  <HStack justify="space-between" w="full">
                    <Text>500 FractiTokens</Text>
                    <Text fontWeight="bold">$90</Text>
                  </HStack>
                </Button>
                <Button
                  variant="outline"
                  colorScheme="teal"
                  onClick={() => {
                    onClose()
                    onPurchase()
                  }}
                >
                  <HStack justify="space-between" w="full">
                    <Text>1000 FractiTokens</Text>
                    <Text fontWeight="bold">$160</Text>
                  </HStack>
                </Button>
              </VStack>
            </Box>

            <Text fontSize="sm" color="gray.500" textAlign="center">
              Each FractiToken grants one access to the Router.
            </Text>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

const Dashboard = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const toast = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [tokenBalance, setTokenBalance] = useState(0)
  const [activeLayer, setActiveLayer] = useState(4)
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChat, setCurrentChat] = useState<string | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false)
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false)
  const [isTokenBalanceModalOpen, setIsTokenBalanceModalOpen] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [subscription, setSubscription] = useState({
    plan: 'Free',
    status: 'active',
    nextBilling: null,
    paymentMethod: 'None',
  })
  const [progress, setProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState('')
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [usageStats, setUsageStats] = useState<UsageStats>({
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    cost: 0,
    fractiTokensUsed: 0
  })
  const [isMobile] = useMediaQuery("(max-width: 768px)")
  const [isTablet] = useMediaQuery("(max-width: 1024px)")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.300')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchTokenBalance()
      fetchChats()
    }
  }, [status, router])

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chat')
      if (!response.ok) {
        throw new Error('Failed to fetch chats')
      }
      const data = await response.json()
      setChats(data)
    } catch (error) {
      console.error('Error fetching chats:', error)
      toast({
        title: 'Error',
        description: 'Failed to load chats',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const createNewChat = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Untitled Chat',
          messages: [{
            role: 'system',
            content: FRACTIVERSE_PROMPT
          }],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create new chat')
      }

      const newChat = await response.json()
      setChats(prev => [newChat, ...prev])
      setCurrentChat(newChat.id)
      setMessages(newChat.messages)
    } catch (error) {
      console.error('Error creating new chat:', error)
      toast({
        title: 'Error',
        description: 'Failed to create new chat',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const switchChat = async (chatId: string) => {
    try {
      console.log(`[switchChat] Starting to load chat: ${chatId}`)
      setIsLoading(true)
      setProcessingStatus('Loading chat...')
      
      // Fetch the full chat data
      console.log(`[switchChat] Fetching chat data from API`)
      const response = await fetch(`/api/chat/${chatId}`)
      const data = await response.json()
      
      console.log(`[switchChat] API response status:`, response.status)
      console.log(`[switchChat] Response data:`, {
        id: data.id,
        title: data.title,
        messagesCount: data.messages?.length || 0,
        messagesPreview: data.messages?.[0] ? JSON.stringify(data.messages[0]).slice(0, 100) + '...' : 'No messages'
      })

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load chat')
      }
      
      if (!data || !data.messages) {
        throw new Error('Invalid chat data received')
      }

      // Parse messages if they're stored as a string
      let messages = data.messages
      if (typeof messages === 'string') {
        try {
          messages = JSON.parse(messages)
        } catch (error) {
          console.error('[switchChat] Error parsing messages:', error)
          messages = []
        }
      }

      // Ensure messages is an array
      if (!Array.isArray(messages)) {
        messages = [messages]
      }
      
      console.log('[switchChat] Messages count:', messages.length)
      console.log('[switchChat] First message:', messages[0] ? JSON.stringify(messages[0]).slice(0, 100) + '...' : 'No messages')

      // Update the current chat and messages
      console.log('[switchChat] Updating state with messages')
      setCurrentChat(chatId)
      setMessages(messages)
      
      // Update processing status
      setProcessingStatus('Chat loaded successfully')
      
      // Reset status after a delay
      setTimeout(() => {
        setProcessingStatus('')
        setIsLoading(false)
      }, 1000)

      console.log('[switchChat] Chat loaded successfully')
    } catch (error) {
      console.error('[switchChat] Error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load chat',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      setProcessingStatus('Failed to load chat')
      setIsLoading(false)
    }
  }

  const updateChatTitle = (chatId: string, title: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title } : chat
    ))
  }

  const fetchTokenBalance = async () => {
    try {
      const response = await fetch('/api/tokens')
      if (!response.ok) {
        throw new Error('Failed to fetch token balance')
      }
      const data = await response.json()
      if (data.balance !== undefined) {
        setTokenBalance(data.balance)
      }
    } catch (error) {
      console.error('Error fetching token balance:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch token balance',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handlePurchaseTokens = async (amount: number) => {
    try {
      // Show processing status
      setProcessingStatus('Processing token purchase...')
      
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'purchase',
          amount,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to purchase tokens')
      }

      if (!data.success) {
        throw new Error('Purchase was not successful')
      }

      // Update the token balance
      setTokenBalance(data.balance || 0)
      
      // Close the modal
      setIsTokenModalOpen(false)

      // Show success message
      toast({
        title: 'Success',
        description: `Successfully purchased ${amount} tokens! Your new balance is ${data.balance} tokens.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      // Reset processing status
      setProcessingStatus('')
    } catch (error) {
      console.error('Error purchasing tokens:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to purchase tokens. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      setProcessingStatus('Purchase failed')
    }
  }

  const handleLayerToggle = (layer: number) => {
    setActiveLayer(layer)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    try {
      setIsLoading(true)
      setProcessingStatus('Processing your request...')
      setProgress(0)

      // Start progress animation
      let progressValue = 0;
      const progressInterval = setInterval(() => {
        progressValue = Math.min(progressValue + 2, 90);
        setProgress(progressValue);
      }, 100);

      // Prepare the user message
      const userMessage: Message = {
        role: 'user',
        content: input,
      }
      let responseData;

      if (!currentChat) {
        // Generate a descriptive title from the user's input
        let title = input || 'New Chat';
        if (title.length > 60) {
          const firstSentence = title.match(/^[^.!?\n]+[.!?\n]/);
          title = firstSentence ? 
            firstSentence[0].slice(0, 60) + '...' : 
            title.slice(0, 57) + '...';
        }
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            messages: [
              { role: 'system', content: FRACTIVERSE_PROMPT },
              userMessage
            ]
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to create chat')
        }

        const newChat = await response.json()
        setCurrentChat(newChat.id)
        setMessages(newChat.messages || [])

        // Now send the message to the new chat
        const chatResponse = await fetch(`/api/chat/${newChat.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: newChat.messages
          }),
        })

        if (!chatResponse.ok) {
          const errorData = await chatResponse.json()
          throw new Error(errorData.error || 'Failed to process chat')
        }

        responseData = await chatResponse.json()
        setMessages(responseData.messages)
        
        // Update chats list
        setChats(prev => [newChat, ...prev])
      } else {
        // Update existing chat
        console.log('[handleSend] Updating existing chat:', currentChat)
        
        // Add user message to local state first
        const updatedMessages = [...messages, userMessage]
        setMessages(updatedMessages)
        setInput('')

        // Send to API
        const response = await fetch(`/api/chat/${currentChat}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: updatedMessages
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to send message')
        }

        responseData = await response.json()
        console.log('[handleSend] API response:', responseData)

        // Update messages with the response
        setMessages(responseData.messages)
      }

      // Clear input
      setInput('')

      // Update token balance and usage stats
      if (responseData.balance !== undefined) {
        setTokenBalance(responseData.balance)
      }

      if (responseData.usage) {
        setUsageStats(prev => ({
          inputTokens: (prev?.inputTokens || 0) + responseData.usage.inputTokens,
          outputTokens: (prev?.outputTokens || 0) + responseData.usage.outputTokens,
          totalTokens: (prev?.totalTokens || 0) + responseData.usage.totalTokens,
          cost: (prev?.cost || 0) + responseData.usage.cost,
          fractiTokensUsed: (prev?.fractiTokensUsed || 0) + responseData.usage.fractiTokensUsed
        }))
      }

      // Complete progress animation
      clearInterval(progressInterval)
      setProgress(100)
      setTimeout(() => {
        setProgress(0)
        setProcessingStatus('')
      }, 500)
    } catch (error) {
      console.error('[handleSend] Error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Sign out failed:', error)
      toast({
        title: 'Error signing out',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...passwordData })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to change password')
      }

      toast({
        title: 'Success',
        description: 'Password updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      setIsPasswordOpen(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to change password',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleProfileUpdate = async () => {
    try {
      const formData = new FormData()
      formData.append('name', profileData.name)
      formData.append('email', profileData.email)
      formData.append('layers', JSON.stringify(activeLayer))
      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const data = await response.json()
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      setIsProfileOpen(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete chat')
      }

      setChats(prev => prev.filter(chat => chat.id !== chatId))
      if (currentChat === chatId) {
        setCurrentChat(null)
        setMessages([])
      }

      toast({
        title: 'Success',
        description: 'Chat deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error deleting chat:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete chat',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleRenameChat = async (chatId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      })

      if (!response.ok) {
        throw new Error('Failed to rename chat')
      }

      const updatedChat = await response.json()
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? updatedChat : chat
      ))

      toast({
        title: 'Success',
        description: 'Chat renamed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error renaming chat:', error)
      toast({
        title: 'Error',
        description: 'Failed to rename chat',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Filter out system messages for display
  const displayMessages = messages.filter(msg => msg.role !== 'system');

  if (status === 'loading') {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" />
          <Text>Loading...</Text>
        </VStack>
      </Box>
    )
  }

  if (!session) {
    return null
  }

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Flex h="100vh" direction={isMobile ? 'column' : 'row'}>
        {/* Left Column - Past Chats Only */}
        <Box
          w={isMobile ? "100%" : isTablet ? "250px" : "300px"}
          h={isMobile ? "auto" : "100vh"}
          maxH={isMobile ? "30vh" : "100vh"}
          bg={useColorModeValue('white', 'gray.800')}
          borderRight={isMobile ? "none" : "1px"}
          borderBottom={isMobile ? "1px" : "none"}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          p={4}
          overflowY="auto"
        >
          <VStack spacing={6} align="stretch">
            <Box>
              <VStack spacing={4} align="stretch">
                <Button
                  size="sm"
                  colorScheme="teal"
                  leftIcon={<Icon as={FaPlus} />}
                  onClick={createNewChat}
                >
                  New Chat
                </Button>
                <Divider />
                <Text fontSize="sm" fontWeight="medium" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                  Past Chats
                </Text>
                <VStack spacing={2} align="stretch">
                  {chats.map((chat) => (
                    <Box key={chat.id} position="relative">
                      {editingChatId === chat.id ? (
                        <HStack spacing={2}>
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            size="sm"
                            placeholder="Enter new title"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleRenameChat(chat.id, editingTitle)
                                setEditingChatId(null)
                                setEditingTitle('')
                              }
                            }}
                          />
                          <IconButton
                            aria-label="Save"
                            icon={<FaCheck />}
                            size="sm"
                            colorScheme="teal"
                            onClick={() => {
                              handleRenameChat(chat.id, editingTitle)
                              setEditingChatId(null)
                              setEditingTitle('')
                            }}
                          />
                          <IconButton
                            aria-label="Cancel"
                            icon={<FaTimes />}
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingChatId(null)
                              setEditingTitle('')
                            }}
                          />
                        </HStack>
                      ) : (
                        <Box
                          position="relative"
                          _hover={{
                            '.chat-actions': {
                              opacity: 1,
                            },
                          }}
                        >
                          <Button
                            w="full"
                            leftIcon={<Icon as={FaHistory} />}
                            variant={currentChat === chat.id ? 'solid' : 'ghost'}
                            colorScheme="teal"
                            onClick={() => switchChat(chat.id)}
                            justifyContent="flex-start"
                            _hover={{ transform: 'translateX(4px)' }}
                            transition="all 0.2s"
                            isLoading={isLoading && currentChat === chat.id}
                            pr="24"
                          >
                            <VStack align="start" spacing={0} w="full">
                              <Text noOfLines={1} fontSize="sm" fontWeight="medium">
                                {chat.title.length > 50 ? `${chat.title.slice(0, 50)}...` : chat.title}
                              </Text>
                              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                {new Date(chat.updatedAt).toLocaleDateString()}
                              </Text>
                            </VStack>
                          </Button>
                          <HStack
                            className="chat-actions"
                            position="absolute"
                            right="2"
                            top="50%"
                            transform="translateY(-50%)"
                            opacity={0}
                            transition="opacity 0.2s"
                            bg={useColorModeValue('white', 'gray.800')}
                            borderRadius="md"
                            p="1"
                            spacing="1"
                          >
                            <IconButton
                              aria-label="Edit"
                              icon={<FaEdit />}
                              size="xs"
                              variant="ghost"
                              colorScheme="gray"
                              onClick={() => {
                                setEditingChatId(chat.id)
                                setEditingTitle(chat.title)
                              }}
                            />
                            <IconButton
                              aria-label="Delete"
                              icon={<FaTrash />}
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDeleteChat(chat.id)}
                            />
                          </HStack>
                        </Box>
                      )}
                    </Box>
                  ))}
                </VStack>
              </VStack>
            </Box>
          </VStack>
        </Box>

        {/* Main Content Area */}
        <Box flex="1" display="flex" flexDirection="column" h={isMobile ? "70vh" : "100vh"}>
          {/* Header */}
          <Box
            bg={useColorModeValue('white', 'gray.800')}
            borderBottom="1px"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            p={isMobile ? 2 : 4}
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={2}>
                <Box as="a" href="https://fractiai.com" target="_blank" _hover={{ textDecoration: 'underline' }}>
                  <HStack spacing={2}>
                    <Icon as={FaBrain} color="teal.500" />
                    <VStack spacing={0} align="start" display={isMobile ? "none" : "flex"}>
                      <Text fontWeight="bold" bgGradient="linear(to-r, teal.500, blue.500)" bgClip="text">
                        FractiVerse
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        L4-L7 Fractal Self-Awareness Intelligence Router
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </HStack>
              <HStack spacing={2}>
                <Button
                  leftIcon={<Icon as={FaCoins} />}
                  colorScheme={tokenBalance <= 0 ? "red" : "teal"}
                  onClick={() => setIsTokenBalanceModalOpen(true)}
                  size={isMobile ? "sm" : "md"}
                >
                  {tokenBalance <= 0 ? "Out of FractiTokens" : tokenBalance}
                </Button>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<Avatar 
                      size={isMobile ? "xs" : "sm"} 
                      name={session.user?.name || 'User'} 
                      src={session.user?.image || undefined}
                    />}
                    variant="ghost"
                  />
                  <MenuList>
                    <MenuItem icon={<FaUser />} onClick={() => setIsProfileOpen(true)}>
                      Profile
                    </MenuItem>
                    <MenuItem icon={<FaLock />} onClick={() => setIsPasswordOpen(true)}>
                      Change Password
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem icon={<FaSignOutAlt />} onClick={handleSignOut}>
                      Sign Out
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </Flex>
          </Box>

          {/* Chat Messages */}
          <Box flex="1" overflowY="auto" p={isMobile ? 2 : 6}>
            <Container maxW={isMobile ? "100%" : "container.xl"}>
              {displayMessages.map((message, index) => (
                <Message key={index} content={message.content} isUser={message.role === 'user'} />
              ))}
              {isLoading && (
                <Box p={4} textAlign="center">
                  <VStack spacing={4}>
                    <Spinner color="teal.500" size="xl" />
                    <Progress value={progress} colorScheme="teal" width="100%" />
                    <Text color="teal.500">{processingStatus}</Text>
                  </VStack>
                </Box>
              )}
            </Container>
          </Box>

          {/* Input Area - Fixed at bottom */}
          <Box
            bg={useColorModeValue('white', 'gray.800')}
            borderTop="1px"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            p={isMobile ? 2 : 4}
          >
            <Container maxW={isMobile ? "100%" : "container.xl"}>
              <form onSubmit={handleSend}>
                <HStack spacing={2}>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter your command..."
                    resize="none"
                    rows={isMobile ? 2 : 3}
                    _hover={{ borderColor: 'teal.500' }}
                    _focus={{ borderColor: 'teal.500' }}
                  />
                  <IconButton
                    aria-label="Send message"
                    icon={<FaPaperPlane />}
                    colorScheme="teal"
                    type="submit"
                    isLoading={isLoading}
                    isDisabled={!input.trim() || isLoading}
                    size={isMobile ? "sm" : "md"}
                  />
                </HStack>
              </form>
            </Container>
          </Box>
        </Box>
      </Flex>

      {/* Modals */}
      <TokenPurchaseModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onPurchase={handlePurchaseTokens}
      />

      <Modal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Profile Settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="stretch">
              <Box>
                <HStack spacing={4} mb={4}>
                  <VStack>
                    <Avatar 
                      size="xl" 
                      name={session.user?.name || 'User'} 
                      src={session.user?.image || undefined}
                    />
                    <FormControl>
                      <FormLabel htmlFor="image-upload" cursor="pointer">
                        <Button
                          as="span"
                          size="sm"
                          leftIcon={<Icon as={FaFileUpload} />}
                          colorScheme="teal"
                        >
                          Upload Photo
                        </Button>
                      </FormLabel>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        display="none"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                              toast({
                                title: 'File too large',
                                description: 'Please select an image under 5MB',
                                status: 'error',
                                duration: 3000,
                                isClosable: true,
                              })
                              return
                            }
                            setSelectedImage(file)
                            // Create a preview URL
                            const url = URL.createObjectURL(file)
                            session.user.image = url
                          }
                        }}
                      />
                    </FormControl>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">{session.user?.name || 'User'}</Text>
                    <Text fontSize="sm" color="gray.500">{session.user?.email}</Text>
                  </VStack>
                </HStack>
                <Divider my={4} />
                <VStack spacing={4} align="stretch">
                  <Heading size="sm">Subscription & Payment</Heading>
                  <HStack justify="space-between">
                    <Text>Current Plan</Text>
                    <Badge colorScheme="teal">{subscription.plan}</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Status</Text>
                    <Badge colorScheme={subscription.status === 'active' ? 'green' : 'red'}>
                      {subscription.status}
                    </Badge>
                  </HStack>
                  {subscription.nextBilling && (
                    <HStack justify="space-between">
                      <Text>Next Billing</Text>
                      <Text>{new Date(subscription.nextBilling).toLocaleDateString()}</Text>
                    </HStack>
                  )}
                  <HStack justify="space-between">
                    <Text>Payment Method</Text>
                    <HStack>
                      <Icon as={FaCreditCard} />
                      <Text>{subscription.paymentMethod}</Text>
                    </HStack>
                  </HStack>
                  <Button
                    leftIcon={<Icon as={FaWallet} />}
                    colorScheme="teal"
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: 'Coming Soon',
                        description: 'Payment management will be available soon.',
                        status: 'info',
                        duration: 5000,
                        isClosable: true,
                      })
                    }}
                  >
                    Manage Payment
                  </Button>
                </VStack>
                <Divider my={4} />
                <VStack spacing={4} align="stretch">
                  <Heading size="sm">Account Security</Heading>
                  <Button
                    leftIcon={<Icon as={FaLock} />}
                    colorScheme="teal"
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: 'Coming Soon',
                        description: 'Password change will be available soon.',
                        status: 'info',
                        duration: 5000,
                        isClosable: true,
                      })
                    }}
                  >
                    Change Password
                  </Button>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsProfileOpen(false)}>
              Close
            </Button>
            <Button
              colorScheme="red"
              leftIcon={<Icon as={FaSignOutAlt} />}
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            >
              Sign Out
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isPasswordOpen} onClose={() => setIsPasswordOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Current Password</FormLabel>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                />
              </FormControl>
              <FormControl>
                <FormLabel>New Password</FormLabel>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Confirm New Password</FormLabel>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsPasswordOpen(false)}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleChangePassword}
            >
              Change Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <TokenBalanceModal
        isOpen={isTokenBalanceModalOpen}
        onClose={() => setIsTokenBalanceModalOpen(false)}
        balance={tokenBalance}
        onPurchase={() => setIsTokenModalOpen(true)}
      />
    </Box>
  )
}

export default Dashboard 