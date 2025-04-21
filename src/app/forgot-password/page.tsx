'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Link,
} from '@chakra-ui/react'

export default function ForgotPassword() {
  const router = useRouter()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send reset email')
      }

      toast({
        title: 'Check Your Email',
        description: 'If an account exists with this email, you will receive password reset instructions.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      router.push('/login')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process request',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6} as="form" onSubmit={handleSubmit}>
        <Heading>Reset Password</Heading>
        <Text>Enter your email address and we'll send you instructions to reset your password.</Text>

        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </FormControl>

        <Button
          type="submit"
          colorScheme="teal"
          isLoading={isLoading}
          w="full"
        >
          Send Reset Instructions
        </Button>

        <Text>
          Remember your password?{' '}
          <Link color="teal.500" href="/login">
            Sign in
          </Link>
        </Text>
      </VStack>
    </Container>
  )
} 