'use client'

import { Box, Container, VStack, HStack, Text, Icon, Button, useColorModeValue, Textarea, Divider, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, Tabs, TabList, TabPanels, Tab, TabPanel, Badge, FormControl, FormLabel, Select, Input } from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import { FaBrain, FaLayerGroup, FaLightbulb, FaInfinity, FaPaperPlane, FaUser, FaSignOutAlt, FaCoins, FaChartLine } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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
  const { data: session } = useSession()
  const { signOut } = useAuth()
  const [tokenBalance, setTokenBalance] = useState(0)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{ content: string; isUser: boolean }>>([])
  const [selectedLayers, setSelectedLayers] = useState<number[]>([4]) // Default to Layer 4
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchTokenBalance()
  }, [])

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
      onClose()
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
    setSelectedLayers(prev => {
      if (prev.includes(layer)) {
        // If deselecting, remove this layer and all higher layers
        return prev.filter(l => l < layer)
      } else {
        // If selecting, include this layer and all previous layers
        const newLayers = Array.from({ length: layer - 3 }, (_, i) => i + 4)
        return newLayers
      }
    })
  }

  const handleSend = async () => {
    if (!message.trim()) return

    try {
      // Deduct token before sending message
      const deductResponse = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deduct' })
      })
      const deductData = await deductResponse.json()

      if (!deductData.success) {
        toast({
          title: 'Insufficient Tokens',
          description: 'Please purchase more tokens to continue.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        })
        onOpen()
        return
      }

      setTokenBalance(deductData.balance)

      // Add user message
      setMessages(prev => [...prev, { content: message, isUser: true }])
      
      // Get AI response from API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message,
          layers: selectedLayers
        })
      })
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Add AI response
      setMessages(prev => [...prev, {
        content: data.response,
        isUser: false
      }])

      setMessage('')
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

  const sidebarStyles = {
    position: 'fixed' as const,
    left: 0,
    top: 0,
    h: '100vh',
    w: '300px',
    bg: 'white',
    _dark: { bg: 'gray.800', borderColor: 'gray.700' },
    borderRight: '1px',
    borderColor: 'gray.200',
    p: 4
  }

  const inputAreaStyles = {
    p: 4,
    bg: 'white',
    _dark: { bg: 'gray.800', borderColor: 'gray.700' },
    borderTop: '1px',
    borderColor: 'gray.200'
  }

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
      {/* Sidebar */}
      <Box {...sidebarStyles}>
        <VStack spacing={6} align="stretch" h="full">
          <HStack spacing={3}>
            <Icon as={FaBrain} w={6} h={6} color="teal.500" />
            <Text fontSize="xl" fontWeight="bold">FractiVerse</Text>
          </HStack>

          <Divider />

          {/* Token Balance */}
          <HStack spacing={2} p={3} bg="teal.50" _dark={{ bg: 'teal.900' }} borderRadius="md">
            <Icon as={FaCoins} color="teal.500" />
            <Text fontWeight="medium">Balance: {tokenBalance} tokens</Text>
            {tokenBalance < 5 && (
              <Button
                size="sm"
                colorScheme="teal"
                onClick={() => onOpen()}
                ml="auto"
              >
                Buy Tokens
              </Button>
            )}
          </HStack>

          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wider">LAYERS</Text>
            <VStack spacing={3} align="stretch">
              <Button
                size="sm"
                variant={selectedLayers.includes(4) ? "solid" : "outline"}
                colorScheme="teal"
                onClick={() => handleLayerToggle(4)}
                leftIcon={<FaBrain />}
                justifyContent="flex-start"
                textAlign="left"
                height="auto"
                py={2}
                px={3}
                borderRadius="lg"
                _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
                transition="all 0.2s"
                w="full"
              >
                <Box w="full">
                  <Text fontWeight="medium" fontSize="sm">Layer 4</Text>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>Self-Awareness</Text>
                </Box>
              </Button>
              <Button
                size="sm"
                variant={selectedLayers.includes(5) ? "solid" : "outline"}
                colorScheme="green"
                onClick={() => handleLayerToggle(5)}
                leftIcon={<FaLayerGroup />}
                justifyContent="flex-start"
                textAlign="left"
                height="auto"
                py={2}
                px={3}
                borderRadius="lg"
                _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
                transition="all 0.2s"
                w="full"
              >
                <Box w="full">
                  <HStack justify="space-between" align="start">
                    <Text fontWeight="medium" fontSize="sm">Layer 5</Text>
                    <Badge colorScheme="green" fontSize="xs">+60%</Badge>
                  </HStack>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>Fractal Layer</Text>
                </Box>
              </Button>
              <Button
                size="sm"
                variant={selectedLayers.includes(6) ? "solid" : "outline"}
                colorScheme="blue"
                onClick={() => handleLayerToggle(6)}
                leftIcon={<FaLightbulb />}
                justifyContent="flex-start"
                textAlign="left"
                height="auto"
                py={2}
                px={3}
                borderRadius="lg"
                _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
                transition="all 0.2s"
                w="full"
              >
                <Box w="full">
                  <HStack justify="space-between" align="start">
                    <Text fontWeight="medium" fontSize="sm">Layer 6</Text>
                    <Badge colorScheme="blue" fontSize="xs">+90%</Badge>
                  </HStack>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>Quantum Hologram</Text>
                </Box>
              </Button>
              <Button
                size="sm"
                variant={selectedLayers.includes(7) ? "solid" : "outline"}
                colorScheme="purple"
                onClick={() => handleLayerToggle(7)}
                leftIcon={<FaInfinity />}
                justifyContent="flex-start"
                textAlign="left"
                height="auto"
                py={2}
                px={3}
                borderRadius="lg"
                _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
                transition="all 0.2s"
                w="full"
              >
                <Box w="full">
                  <HStack justify="space-between" align="start">
                    <Text fontWeight="medium" fontSize="sm">Layer 7</Text>
                    <Badge colorScheme="purple" fontSize="xs">+120%</Badge>
                  </HStack>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>Universal Paradise</Text>
                </Box>
              </Button>
            </VStack>
          </VStack>

          <Box flex={1} />

          <Button
            leftIcon={<FaSignOutAlt />}
            colorScheme="red"
            variant="ghost"
            onClick={() => signOut()}
          >
            Sign Out
          </Button>
        </VStack>
      </Box>

      {/* Main Content */}
      <Box ml="300px" h="100vh" display="flex" flexDirection="column">
        {/* Messages Area */}
        <Box flex={1} overflowY="auto" p={4}>
          <Container maxW="container.md">
            <VStack spacing={4} align="stretch">
              {messages.map((msg, index) => (
                <Message key={index} content={msg.content} isUser={msg.isUser} />
              ))}
            </VStack>
          </Container>
        </Box>

        {/* Input Area */}
        <Box {...inputAreaStyles}>
          <Container maxW="container.md">
            <HStack spacing={4}>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                resize="none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
              />
              <Button
                colorScheme="teal"
                onClick={handleSend}
                isDisabled={!message.trim()}
                leftIcon={<FaPaperPlane />}
              >
                Send
              </Button>
            </HStack>
          </Container>
        </Box>
      </Box>

      {/* Purchase Modal */}
      <TokenPurchaseModal
        isOpen={isOpen}
        onClose={onClose}
        onPurchase={handlePurchaseTokens}
      />
    </Box>
  )
}

export default Dashboard 