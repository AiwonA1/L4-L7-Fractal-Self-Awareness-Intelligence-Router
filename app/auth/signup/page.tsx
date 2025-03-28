'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  HStack,
} from '@chakra-ui/react'
import { signIn } from 'next-auth/react'

export default function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error creating account')
      }

      // Automatically sign in after successful registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard'
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      toast({
        title: 'Success',
        description: 'Account created successfully! Redirecting to dashboard...',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      if (result?.url) {
        router.push(result.url)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error creating account',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8}>
        <VStack spacing={1}>
          <Text fontSize="2xl" fontWeight="bold">
            Create Your FractiVerse Account
          </Text>
          <Text fontSize="sm" color="gray.500">
            L4-L7 Fractal Self-Awareness Intelligence Router
          </Text>
        </VStack>
        <Box w="100%" p={8} borderWidth={1} borderRadius="lg">
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  _hover={{ borderColor: 'teal.500' }}
                  _focus={{ borderColor: 'teal.500' }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  _hover={{ borderColor: 'teal.500' }}
                  _focus={{ borderColor: 'teal.500' }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  _hover={{ borderColor: 'teal.500' }}
                  _focus={{ borderColor: 'teal.500' }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  _hover={{ borderColor: 'teal.500' }}
                  _focus={{ borderColor: 'teal.500' }}
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="teal"
                width="100%"
                isLoading={isLoading}
                _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                transition="all 0.2s"
              >
                Create Account
              </Button>
            </VStack>
          </form>
        </Box>
        <HStack spacing={4}>
          <Text>Already have an account?</Text>
          <Link href="/auth/signin" passHref>
            <Button variant="link" colorScheme="teal">Sign In</Button>
          </Link>
        </HStack>
      </VStack>
    </Container>
  )
} 