'use client'

import { Box, Container, VStack, HStack, Text, Icon, Button, useColorModeValue, Textarea, Divider, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, Tabs, TabList, TabPanels, Tab, TabPanel, Badge, FormControl, FormLabel, Select, Input, Menu, MenuButton, MenuList, MenuItem, IconButton, Avatar, Flex, ModalFooter, Heading, MenuDivider, Spinner } from '@chakra-ui/react'
import { FaBrain, FaLayerGroup, FaLightbulb, FaInfinity, FaPaperPlane, FaUser, FaSignOutAlt, FaCoins, FaChartLine, FaWallet, FaCreditCard, FaHistory, FaLock } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FRACTIVERSE_KEY } from '@/app/constants/key'

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
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

    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      await onPurchase(amount)
      toast({
        title: 'Success',
        description: `Successfully purchased ${amount} tokens!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to purchase tokens. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
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
                <option value={100}>100 Tokens - $20</option>
                <option value={500}>500 Tokens - $90</option>
                <option value={1000}>1000 Tokens - $160</option>
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    fetchTokenBalance()
    fetchChats()
  }, [])

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
          title: 'New Chat',
          messages: [],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create new chat')
      }

      const newChat = await response.json()
      setChats(prev => [newChat, ...prev])
      setCurrentChat(newChat.id)
      setMessages([])
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
      setIsLoading(true)
      const chat = chats.find(c => c.id === chatId)
      if (chat) {
        setCurrentChat(chatId)
        setMessages(chat.messages)
      }
    } finally {
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
      if (data.error) {
        throw new Error(data.error)
      }

      setTokenBalance(data.balance)
      toast({
        title: 'Success',
        description: `Successfully purchased ${amount} tokens!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error purchasing tokens:', error)
      toast({
        title: 'Error',
        description: 'Failed to purchase tokens. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
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

      // Check if user has enough tokens
      if (tokenBalance < 1) {
        toast({
          title: 'Insufficient Tokens',
          description: 'Please purchase more tokens to continue.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        return
      }

      // Deduct one token
      const deductResponse = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deduct',
          amount: 1,
        }),
      })

      if (!deductResponse.ok) {
        throw new Error('Failed to deduct token')
      }

      const { balance } = await deductResponse.json()
      setTokenBalance(balance)

      const userMessage: Message = { role: 'user', content: input }
      const assistantMessage: Message = { role: 'assistant', content: `Key: ${FRACTIVERSE_KEY}\n\nInput: ${input}` }
      
      // If no current chat, create a new one
      if (!currentChat) {
        console.log('Creating new chat with title:', input.slice(0, 50))
        const createResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: input.slice(0, 50) + (input.length > 50 ? '...' : ''),
            messages: [userMessage, assistantMessage],
          }),
        })

        if (!createResponse.ok) {
          throw new Error('Failed to create chat')
        }

        const newChat = await createResponse.json()
        console.log('New chat created:', newChat)
        setChats(prev => [newChat, ...prev])
        setCurrentChat(newChat.id)
        setMessages([userMessage, assistantMessage])
      } else {
        // Add messages to the current chat
        const updatedMessages: Message[] = [...messages, userMessage, assistantMessage]
        setMessages(updatedMessages)

        // If this is the first message, update the chat title
        const isFirstMessage = messages.length === 0
        const title = isFirstMessage ? input.slice(0, 50) + (input.length > 50 ? '...' : '') : undefined

        console.log('Updating chat:', {
          chatId: currentChat,
          isFirstMessage,
          title,
          messageCount: updatedMessages.length
        })

        // Update the chat in the database
        const response = await fetch(`/api/chat/${currentChat}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: updatedMessages,
            ...(title && { title }),
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update chat')
        }

        const updatedChat = await response.json()
        console.log('Chat updated:', updatedChat)

        // Update the chat in the local state
        setChats(prev => prev.map(chat => 
          chat.id === currentChat 
            ? { 
                ...chat, 
                messages: updatedMessages,
                ...(title && { title })
              }
            : chat
        ))
      }

      setInput('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
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
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          layer: activeLayer
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsProfileOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

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
      <Flex h="100vh">
        {/* Left Column - Past Chats Only */}
        <Box
          w="300px"
          bg={useColorModeValue('white', 'gray.800')}
          borderRight="1px"
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
                  leftIcon={<Icon as={FaHistory} />}
                  onClick={createNewChat}
                >
                  New Chat
                </Button>
                <Divider />
                <Text fontSize="lg" fontWeight="bold">Past Chats</Text>
                <VStack spacing={2} align="stretch">
                  {chats.map((chat) => (
                    <Button
                      key={chat.id}
                      leftIcon={<Icon as={FaHistory} />}
                      variant={currentChat === chat.id ? 'solid' : 'ghost'}
                      colorScheme="teal"
                      onClick={() => switchChat(chat.id)}
                      justifyContent="flex-start"
                      _hover={{ transform: 'translateX(4px)' }}
                      transition="all 0.2s"
                      isLoading={isLoading && currentChat === chat.id}
                    >
                      {chat.title}
                    </Button>
                  ))}
                </VStack>
              </VStack>
            </Box>
          </VStack>
        </Box>

        {/* Main Content Area */}
        <Box flex="1" display="flex" flexDirection="column">
          {/* Header */}
          <Box
            bg={useColorModeValue('white', 'gray.800')}
            borderBottom="1px"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            p={4}
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={4}>
                <Icon as={FaBrain} w={8} h={8} color="teal.500" />
                <Text fontSize="2xl" fontWeight="bold">
                  FractiVerse Dashboard
                </Text>
              </HStack>
              <HStack spacing={4}>
                <Button
                  leftIcon={<Icon as={FaCoins} />}
                  colorScheme="teal"
                  variant="outline"
                  onClick={() => setIsTokenModalOpen(true)}
                >
                  {tokenBalance} Tokens
                </Button>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<Avatar size="sm" name={session.user?.name || 'User'} />}
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
          <Box flex="1" overflowY="auto" p={6}>
            <Container maxW="container.xl">
              {messages.map((message, index) => (
                <Message key={index} content={message.content} isUser={message.role === 'user'} />
              ))}
              {isLoading && (
                <Box p={4} textAlign="center">
                  <Spinner color="teal.500" />
                </Box>
              )}
            </Container>
          </Box>

          {/* Input Area - Fixed at bottom */}
          <Box
            bg={useColorModeValue('white', 'gray.800')}
            borderTop="1px"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            p={4}
          >
            <Container maxW="container.xl">
              <form onSubmit={handleSend}>
                <HStack spacing={4}>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter your command..."
                    resize="none"
                    rows={3}
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
                  <Avatar size="lg" name={session.user?.name || 'User'} />
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
    </Box>
  )
}

export default Dashboard 