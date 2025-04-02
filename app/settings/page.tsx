'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Container,
  Card,
  CardBody,
  Text,
  useColorModeValue,
  FormErrorMessage,
  Spinner,
  HStack,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FaCoins } from 'react-icons/fa'
import TokenPurchase from '@/app/components/TokenPurchase'

export default function SettingsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log('User not authenticated, redirecting to login')
      router.push('/login')
    },
  })
  const router = useRouter()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
  })
  const [errors, setErrors] = useState({
    displayName: '',
  })

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.300')

  useEffect(() => {
    console.log('Session status:', status)
    console.log('Session data:', session)
    
    if (session?.user) {
      console.log('Session user details:', {
        email: session.user.email,
        name: session.user.name,
        tokenBalance: (session.user as any)?.tokenBalance
      })
      setFormData({
        displayName: session.user.name || '',
      })
    }
  }, [session, status])

  const validateForm = () => {
    const newErrors = {
      displayName: '',
    }
    let isValid = true

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSaveSettings = async () => {
    if (!validateForm()) return

    try {
      setIsLoading(true)
      console.log('Saving settings with data:', formData)
      console.log('Current session:', session)

      if (!session?.user?.email) {
        throw new Error('No authenticated user found')
      }

      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: formData.displayName,
          email: session.user.email
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Settings update error:', data)
        throw new Error(data.message || 'Failed to update settings')
      }

      console.log('Settings update successful:', data)

      toast({
        title: 'Settings updated',
        description: 'Your profile has been updated successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      // Refresh the session to update the displayed name
      router.refresh()
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update settings',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchase = (amount: number) => {
    console.log('Handling purchase for amount:', amount)
    console.log('Current session:', session)
    // Refresh the session to update the token balance
    router.refresh()
    onClose()
  }

  if (status === 'loading') {
    console.log('Loading session...')
    return (
      <Container maxW="container.md" py={8}>
        <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
          <Spinner size="xl" />
        </Box>
      </Container>
    )
  }

  if (!session?.user) {
    console.log('No session found, redirecting to login')
    router.push('/login')
    return null
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Settings</Heading>
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl isInvalid={!!errors.displayName}>
                <FormLabel>Display Name</FormLabel>
                <Input
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Enter your display name"
                />
                <FormErrorMessage>{errors.displayName}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  value={session.user.email || ''}
                  isReadOnly
                  bg={useColorModeValue('gray.100', 'gray.700')}
                  color={useColorModeValue('gray.800', 'white')}
                  borderColor={useColorModeValue('gray.300', 'gray.600')}
                  _hover={{ borderColor: useColorModeValue('gray.400', 'gray.500') }}
                />
                <Text fontSize="sm" color={textColor} mt={1}>
                  Email cannot be changed
                </Text>
              </FormControl>

              <Box 
                p={4} 
                bg={useColorModeValue('gray.50', 'gray.700')} 
                borderRadius="md"
                cursor="pointer"
                onClick={onOpen}
                _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                transition="background-color 0.2s"
              >
                <HStack spacing={2}>
                  <Icon as={FaCoins} color="yellow.500" />
                  <Text fontSize="lg" fontWeight="bold">
                    Current FractiToken Balance: {(session.user as any)?.tokenBalance || 0}
                  </Text>
                </HStack>
                <Text fontSize="sm" color={textColor} mt={1}>
                  Click to purchase more tokens
                </Text>
              </Box>

              <Button
                colorScheme="blue"
                onClick={handleSaveSettings}
                isLoading={isLoading}
                loadingText="Saving..."
                mt={4}
              >
                Save Changes
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      <TokenPurchase 
        isOpen={isOpen} 
        onClose={onClose} 
        onPurchase={handlePurchase}
      />
    </Container>
  )
} 