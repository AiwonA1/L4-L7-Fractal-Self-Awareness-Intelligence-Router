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
import { useRouter } from 'next/navigation'
import { FaCoins } from 'react-icons/fa'
import TokenPurchaseModal from '@/app/components/TokenPurchaseModal'
import { useAuth } from '@/app/context/AuthContext'

export default function SettingsPage() {
  const { user, userData } = useAuth()
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
    if (!user) {
      console.log('No user found, redirecting to login')
      router.push('/login')
      return
    }

    console.log('User details:', {
      email: user.email,
      name: user.user_metadata?.name,
      tokenBalance: userData?.token_balance
    })

    setFormData({
      displayName: user.user_metadata?.name || '',
    })
  }, [user, userData])

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

      if (!user?.email) {
        throw new Error('No authenticated user found')
      }

      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: formData.displayName,
          email: user.email
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

      // Refresh the page to update the displayed name
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

  const handlePurchase = () => {
    // The balance will be updated automatically by AuthContext
    onClose()
  }

  if (!user) {
    return (
      <Container maxW="container.md" py={8}>
        <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
          <Spinner size="xl" />
        </Box>
      </Container>
    )
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
                  value={user.email || ''}
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

              <Button
                colorScheme="blue"
                onClick={handleSaveSettings}
                isLoading={isLoading}
              >
                Save Changes
              </Button>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Box>
                  <Heading size="md">FractiTokens</Heading>
                  <Text color={textColor}>Current Balance: {userData?.token_balance || 0}</Text>
                </Box>
                <Button
                  leftIcon={<Icon as={FaCoins} />}
                  colorScheme="yellow"
                  onClick={onOpen}
                >
                  Buy More Tokens
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <TokenPurchaseModal
          isOpen={isOpen}
          onClose={onClose}
          onPurchase={handlePurchase}
        />
      </VStack>
    </Container>
  )
} 