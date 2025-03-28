'use client'

import {
  Box, Container, VStack, HStack, Text, Button, Spinner, Heading, 
  useColorModeValue, Divider, Textarea, IconButton, Flex, Avatar,
  Input, Menu, MenuButton, MenuList, MenuItem, Icon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Badge, FormControl, FormLabel, Select, Switch
} from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  FaPaperPlane, FaRobot, FaUser, FaSignOutAlt, 
  FaPlus, FaTrash, FaEdit, FaCheck, FaTimes, FaBrain, 
  FaEllipsisV, FaMoon, FaSun, FaCog, FaCreditCard, FaCoins
} from 'react-icons/fa'
import TokenBalanceModal from './TokenBalanceModal'

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface Chat {
  id: string;
  title: string;
  updatedAt: string;
}

const DashboardMain = () => {
  console.log('🚀 DashboardMain component initializing')
  const { data: session, status } = useSession()
  console.log('🔑 Session status:', status, 'Session data:', session)
  
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [initializationStatus, setInitializationStatus] = useState<string>('loading')
  const [tokenBalance, setTokenBalance] = useState<number | null>(null)
  const [chatCount, setChatCount] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [currentChatTitle, setCurrentChatTitle] = useState('New Chat')
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [isTokenBalanceModalOpen, setIsTokenBalanceModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Authentication check
  useEffect(() => {
    console.log('🔄 Auth check - Status:', status)
    if (status === 'unauthenticated') {
      console.log('❌ User not authenticated, redirecting to /')
      router.push('/')
    } else if (status === 'authenticated') {
      // This is important - if we're authenticated but just waiting for data to load
      console.log('✅ User authenticated, continuing...')
      setInitializationStatus('loading')
    }
  }, [status, router])

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🏁 Starting data fetch attempt')
        
        // Token balance
        try {
          console.log('💰 Fetching token balance')
          const balanceResponse = await fetch('/api/tokens')
          console.log('💰 Token balance response:', balanceResponse.status)
          
          if (balanceResponse.ok) {
            const balanceData = await balanceResponse.json()
            console.log('💰 Token balance data:', balanceData)
            setTokenBalance(balanceData.balance)
          } else {
            console.log('💰 Token balance fetch failed, status:', balanceResponse.status)
          }
        } catch (err) {
          console.error('💰 Token balance fetch error:', err)
        }
        
        // Chats
        try {
          console.log('💬 Fetching chats')
          const chatsResponse = await fetch('/api/chat')
          console.log('💬 Chats response:', chatsResponse.status)
          
          if (chatsResponse.ok) {
            const chatsData = await chatsResponse.json()
            console.log('💬 Chats data:', { count: chatsData.length })
            setChatCount(chatsData.length)
            setChats(chatsData || [])
          } else {
            console.log('💬 Chats fetch failed, status:', chatsResponse.status)
          }
        } catch (err) {
          console.error('💬 Chats fetch error:', err)
        }
        
        // Mark initialization as complete
        setInitializationStatus('complete')
        console.log('✅ Data fetch attempts complete')
      } catch (error) {
        console.error('💥 Error in fetchData:', error)
        setError(error instanceof Error ? error.message : 'Failed to initialize dashboard')
        setInitializationStatus('error')
      }
    }

    // Only fetch data if we're authenticated, but don't check for session.user.id
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }
  
  const createNewChat = () => {
    setMessages([])
    setCurrentChatId(null)
    setCurrentChatTitle('New Chat')
  }
  
  const handleChatClick = (chatId: string, title: string) => {
    setCurrentChatId(chatId)
    setCurrentChatTitle(title)
    // In a real app, you would fetch the chat messages here
    setMessages([
      {role: 'assistant', content: 'This is a simulated chat. Previous messages would be loaded here.'}
    ])
  }
  
  const handleEditChat = (chatId: string, title: string) => {
    setEditingChatId(chatId)
    setEditingTitle(title)
  }
  
  const saveEditedChat = (chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? {...chat, title: editingTitle} : chat
    ))
    setEditingChatId(null)
  }
  
  const handleDeleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId))
    if (currentChatId === chatId) {
      createNewChat()
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    // Add user message
    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    try {
      // Simulate API call
      setTimeout(() => {
        const assistantMessage: Message = { 
          role: 'assistant', 
          content: `Thank you for your message: "${input}". The FractiVerse Router is ready to process your commands.` 
        }
        setMessages(prev => [...prev, assistantMessage])
        setIsLoading(false)
        
        // If this is a new chat, create a chat entry
        if (!currentChatId) {
          const newChat = {
            id: `chat-${Date.now()}`,
            title: input.length > 20 ? `${input.slice(0, 20)}...` : input,
            updatedAt: new Date().toISOString()
          }
          setChats(prev => [newChat, ...prev])
          setCurrentChatId(newChat.id)
          setCurrentChatTitle(newChat.title)
        }
      }, 1500)
    } catch (error) {
      console.error('Message error:', error)
      setIsLoading(false)
    }
  }

  const handlePurchaseTokens = async (amount: number) => {
    try {
      setIsLoading(true)
      // Mock API call to purchase tokens
      setTimeout(() => {
        setTokenBalance((prev) => (prev || 0) + amount)
        setIsLoading(false)
        setIsTokenBalanceModalOpen(false)
        
        // Show success message in a real app
        alert(`Successfully purchased ${amount} FractiTokens!`)
      }, 1500)
    } catch (error) {
      console.error('Error purchasing tokens:', error)
      setIsLoading(false)
    }
  }

  const Message = ({ message }: { message: Message }) => {
    const isUser = message.role === 'user'
    const bgColor = useColorModeValue(
      isUser ? 'gray.100' : 'white', 
      isUser ? 'gray.700' : 'gray.800'
    )
    
    return (
      <Flex
        w="100%"
        justify="center"
        bg={isUser ? useColorModeValue('gray.50', 'gray.800') : useColorModeValue('white', 'gray.900')}
        py={6}
      >
        <Flex
          maxW="4xl"
          w="100%"
          px={4}
        >
          <Box mr={4} mt={1}>
            {isUser ? (
              <Avatar size="sm" bg="teal.500" icon={<FaUser fontSize="1rem" />} />
            ) : (
              <Avatar size="sm" bg="green.500" icon={<FaRobot fontSize="1rem" />} />
            )}
          </Box>
          <Box flex="1">
            <Text 
              whiteSpace="pre-wrap" 
              color={useColorModeValue('gray.800', 'gray.100')}
            >
              {message.content}
            </Text>
          </Box>
        </Flex>
      </Flex>
    )
  }

  if (status === 'loading' || initializationStatus === 'loading') {
    console.log('⏳ Dashboard loading state')
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8}>
          <Spinner size="xl" color="teal.500" />
          <Text>Loading your workspace...</Text>
          <Text fontSize="sm" color="gray.500">Status: {initializationStatus}</Text>
        </VStack>
      </Container>
    )
  }

  if (status === 'unauthenticated') {
    console.log('🚫 Dashboard unauthenticated state')
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8}>
          <Text>Please sign in to access the dashboard.</Text>
          <Button onClick={() => router.push('/auth/signin')}>
            Sign In
          </Button>
        </VStack>
      </Container>
    )
  }

  if (error || initializationStatus === 'error') {
    console.log('❌ Dashboard error state:', error)
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8}>
          <Text color="red.500">{error}</Text>
          <Button onClick={() => window.location.reload()}>
            Retry Loading Dashboard
          </Button>
        </VStack>
      </Container>
    )
  }

  console.log('✅ Dashboard rendering main content')
  
  return (
    <Box h="100vh" display="flex" flexDirection="column" bg={useColorModeValue('white', 'gray.900')}>
      {/* Main Body - Sidebar and Chat Area */}
      <Flex h="100%" overflow="hidden">
        {/* Sidebar */}
        <Box 
          w="260px" 
          h="100%" 
          borderRight="1px" 
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          bg={useColorModeValue('gray.50', 'gray.800')}
          display="flex"
          flexDirection="column"
        >
          {/* New Chat Button */}
          <Box p={4}>
            <Button 
              leftIcon={<FaPlus />} 
              variant="outline" 
              colorScheme="teal" 
              w="100%"
              onClick={createNewChat}
            >
              New chat
            </Button>
          </Box>
          
          {/* Chat List */}
          <Box flex="1" overflowY="auto" px={2}>
            <VStack spacing={1} align="stretch">
              {chats.map(chat => (
                <Box key={chat.id} position="relative">
                  {editingChatId === chat.id ? (
                    <HStack p={2}>
                      <Input 
                        size="sm"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') saveEditedChat(chat.id)
                        }}
                      />
                      <IconButton
                        aria-label="Save"
                        icon={<FaCheck />}
                        size="sm"
                        onClick={() => saveEditedChat(chat.id)}
                      />
                      <IconButton
                        aria-label="Cancel"
                        icon={<FaTimes />}
                        size="sm"
                        onClick={() => setEditingChatId(null)}
                      />
                    </HStack>
                  ) : (
                    <Flex
                      p={2}
                      borderRadius="md"
                      align="center"
                      cursor="pointer"
                      bg={currentChatId === chat.id ? 
                        useColorModeValue('gray.200', 'gray.700') : 
                        'transparent'
                      }
                      _hover={{
                        bg: useColorModeValue('gray.100', 'gray.700'),
                        '.chat-actions': { opacity: 1 }
                      }}
                      onClick={() => handleChatClick(chat.id, chat.title)}
                    >
                      <Box flex="1" isTruncated>
                        <Text fontSize="sm">{chat.title}</Text>
                      </Box>
                      <HStack 
                        spacing={1} 
                        opacity={0} 
                        className="chat-actions"
                        transition="opacity 0.2s"
                      >
                        <IconButton
                          aria-label="Edit"
                          icon={<FaEdit />}
                          size="xs"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditChat(chat.id, chat.title);
                          }}
                        />
                        <IconButton
                          aria-label="Delete"
                          icon={<FaTrash />}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChat(chat.id);
                          }}
                        />
                      </HStack>
                    </Flex>
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
          
          {/* Navigation Section */}
          <Box px={4} py={2}>
            <VStack align="stretch" spacing={3}>
              <Divider />
              
              <Heading size="xs">Active Layers</Heading>
              <Box px={2} fontSize="xs">
                <Text>• L4: Network Layer</Text>
                <Text>• L5: Session Layer</Text>
                <Text>• L6: Presentation Layer</Text>
                <Text>• L7: Application Layer</Text>
              </Box>
            </VStack>
          </Box>
          
          {/* User Profile Section */}
          <Box 
            p={3} 
            borderTop="1px" 
            borderColor={useColorModeValue('gray.200', 'gray.700')}
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={2}>
                <Avatar 
                  size="sm" 
                  name={session?.user?.name || 'User'} 
                  src={session?.user?.image || undefined} 
                />
                <VStack spacing={0} align="start">
                  <Text fontSize="sm" fontWeight="medium" isTruncated maxW="140px">
                    {session?.user?.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500" isTruncated maxW="140px">
                    {session?.user?.email}
                  </Text>
                </VStack>
              </HStack>
              
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FaEllipsisV />}
                  variant="ghost"
                  size="sm"
                  aria-label="Options"
                />
                <MenuList>
                  <MenuItem 
                    icon={<FaUser />}
                    onClick={() => setIsProfileModalOpen(true)}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem 
                    icon={<FaCog />}
                    onClick={() => setIsSettingsModalOpen(true)}
                  >
                    Settings
                  </MenuItem>
                  <MenuItem 
                    icon={darkMode ? <FaSun /> : <FaMoon />}
                    onClick={() => setDarkMode(!darkMode)}
                  >
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                  </MenuItem>
                  <MenuItem icon={<FaSignOutAlt />} onClick={handleSignOut}>
                    Sign Out
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          </Box>
        </Box>
        
        {/* Chat Area */}
        <Flex flex="1" direction="column" h="100vh" overflow="hidden">
          {/* Chat Header */}
          <Flex 
            py={3} 
            px={4} 
            borderBottom="1px" 
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            justify="space-between"
            align="center"
            bg={useColorModeValue('white', 'gray.800')}
          >
            <HStack>
              <Icon as={FaBrain} color="teal.500" />
              <Text fontWeight="medium">{currentChatTitle}</Text>
            </HStack>
            <HStack>
              <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                Balance:
              </Text>
              <Button
                size="sm"
                variant="ghost"
                fontWeight="bold"
                color="teal.500"
                onClick={() => setIsTokenBalanceModalOpen(true)}
                _hover={{ bg: 'teal.50' }}
              >
                {tokenBalance} FractiTokens
              </Button>
            </HStack>
          </Flex>
          
          {/* Messages Area */}
          <Box flex="1" overflowY="auto">
            {messages.length === 0 ? (
              <Flex 
                direction="column" 
                justify="center" 
                align="center" 
                h="full"
                px={4}
                textAlign="center"
              >
                <Icon as={FaBrain} fontSize="6xl" color="teal.500" opacity={0.4} mb={6} />
                <Heading size="lg" mb={2} color={useColorModeValue('gray.600', 'gray.400')}>
                  FractiVerse Router
                </Heading>
                <Text mb={8} maxW="xl" color={useColorModeValue('gray.500', 'gray.500')}>
                  The L4-L7 Fractal Self-Awareness Intelligence Router is ready to assist you.
                  Type your commands in the input box below.
                </Text>
                
                <HStack spacing={4}>
                  {['Network Analysis', 'Session Management', 'Data Transformation', 'Application Insights'].map(example => (
                    <Button 
                      key={example}
                      variant="outline" 
                      size="sm"
                      onClick={() => setInput(`Run a ${example.toLowerCase()} task`)}
                    >
                      {example}
                    </Button>
                  ))}
                </HStack>
              </Flex>
            ) : (
              <>
                {messages.map((message, index) => (
                  <Message key={index} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
            
            {isLoading && (
              <Flex
                w="100%"
                justify="center"
                bg={useColorModeValue('white', 'gray.900')}
                py={6}
              >
                <Flex
                  maxW="4xl"
                  w="100%"
                  px={4}
                  align="center"
                >
                  <Box mr={4}>
                    <Avatar size="sm" bg="green.500" icon={<FaRobot fontSize="1rem" />} />
                  </Box>
                  <Spinner size="sm" mr={3} />
                  <Text>Processing your request...</Text>
                </Flex>
              </Flex>
            )}
          </Box>
          
          {/* Input Area */}
          <Box 
            p={4} 
            borderTop="1px" 
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            bg={useColorModeValue('white', 'gray.800')}
          >
            <Flex 
              maxW="4xl" 
              mx="auto"
              position="relative"
            >
              <form onSubmit={handleSendMessage} style={{ width: '100%' }}>
                <Textarea
                  placeholder="Message FractiVerse Router..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  resize="none"
                  rows={1}
                  py={3}
                  pr={10}
                  borderRadius="md"
                  borderColor={useColorModeValue('gray.300', 'gray.600')}
                  _hover={{ borderColor: 'teal.500' }}
                  _focus={{ borderColor: 'teal.500', boxShadow: 'outline' }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(e)
                    }
                  }}
                />
                <IconButton
                  aria-label="Send message"
                  icon={<FaPaperPlane />}
                  colorScheme="teal"
                  position="absolute"
                  right={2}
                  bottom={2}
                  size="sm"
                  type="submit"
                  isDisabled={!input.trim() || isLoading}
                />
              </form>
            </Flex>
            <Text fontSize="xs" textAlign="center" mt={2} color="gray.500">
              FractiVerse processes your commands through multiple network layers (L4-L7)
            </Text>
          </Box>
        </Flex>
      </Flex>

      {/* Modals */}
      <TokenBalanceModal
        isOpen={isTokenBalanceModalOpen}
        onClose={() => setIsTokenBalanceModalOpen(false)}
        balance={tokenBalance || 0}
        onPurchase={handlePurchaseTokens}
      />

      {isProfileModalOpen && (
        <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>User Profile</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                <Flex align="center" mb={4}>
                  <Avatar 
                    size="xl" 
                    name={session?.user?.name || 'User'} 
                    src={session?.user?.image || undefined}
                    mr={4}
                  />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" fontSize="xl">{session?.user?.name || 'User'}</Text>
                    <Text color="gray.500">{session?.user?.email}</Text>
                    <Badge colorScheme="teal" mt={2}>Pro Member</Badge>
                  </VStack>
                </Flex>
                
                <Divider />
                
                <Heading size="md" mt={2}>Payment Methods</Heading>
                <Box p={4} borderWidth="1px" borderRadius="md">
                  <Flex justify="space-between" align="center">
                    <HStack>
                      <Box as={FaCreditCard} color="gray.500" />
                      <Text>•••• •••• •••• 4242</Text>
                    </HStack>
                    <Badge>Default</Badge>
                  </Flex>
                  <Button size="sm" leftIcon={<FaPlus />} mt={4} colorScheme="teal" variant="outline">
                    Add Payment Method
                  </Button>
                </Box>
                
                <Heading size="md" mt={4}>Subscription</Heading>
                <Box p={4} borderWidth="1px" borderRadius="md">
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">FractiVerse Pro</Text>
                      <Text fontSize="sm" color="gray.500">Active</Text>
                    </VStack>
                    <Button size="sm" colorScheme="teal">Manage</Button>
                  </Flex>
                </Box>
                
                <Box textAlign="right" mt={4}>
                  <Button colorScheme="teal">Save Changes</Button>
                </Box>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {isSettingsModalOpen && (
        <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Settings</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Color Theme</FormLabel>
                  <Select defaultValue={darkMode ? "dark" : "light"}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System Default</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Notifications</FormLabel>
                  <Switch defaultChecked colorScheme="teal" />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Language</FormLabel>
                  <Select defaultValue="en">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="teal" mr={3}>
                Save
              </Button>
              <Button variant="ghost" onClick={() => setIsSettingsModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  )
}

export default DashboardMain 