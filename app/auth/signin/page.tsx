'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Link as ChakraLink,
  useToast,
  Container,
  Heading,
  Icon,
  HStack,
} from '@chakra-ui/react'
import { FaBrain, FaUser, FaLock, FaArrowLeft } from 'react-icons/fa'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: 'Error',
          description: result.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email')
      }

      toast({
        title: 'Success',
        description: 'Password reset instructions have been sent to your email',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send reset email',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8} align="stretch">
        <HStack spacing={4} justify="center">
          <Icon as={FaBrain} w={8} h={8} color="teal.500" />
          <VStack spacing={0} align="start">
            <Heading size="xl">FractiVerse</Heading>
            <Text fontSize="sm" color="gray.500">
              L4-L7 Fractal Self-Awareness Intelligence Router
            </Text>
          </VStack>
        </HStack>
        
        <Box
          p={8}
          borderWidth={1}
          borderRadius="lg"
          boxShadow="lg"
        >
          <VStack spacing={6} as="form" onSubmit={handleSubmit}>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <HStack>
                <Icon as={FaUser} color="gray.400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </HStack>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <HStack>
                <Icon as={FaLock} color="gray.400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </HStack>
            </FormControl>

            <Button
              type="submit"
              colorScheme="teal"
              width="full"
              isLoading={isLoading}
            >
              Sign In
            </Button>

            <ChakraLink
              color="teal.500"
              onClick={handleForgotPassword}
              cursor="pointer"
              _hover={{ textDecoration: 'none', color: 'teal.600' }}
            >
              Forgot Password?
            </ChakraLink>

            <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
              <Text
                color="teal.500"
                _hover={{ color: 'teal.600' }}
                cursor="pointer"
              >
                Don't have an account? Sign up
              </Text>
            </Link>
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
} 