'use client'

import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Text,
} from '@chakra-ui/react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirect: false,
        callbackUrl
      })

      if (!result?.error) {
        router.push(callbackUrl)
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: 'Invalid email or password',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true)
      await signIn('google', { 
        callbackUrl,
        redirect: true
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign in with Google',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      setIsGoogleLoading(false)
    }
  }

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8}>
        <Heading>Sign In</Heading>
        <Box as="form" onSubmit={handleSubmit} w="100%" maxW="400px">
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                placeholder="Enter your email"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                name="password"
                type="password"
                placeholder="Enter your password"
              />
            </FormControl>
            <Button
              type="submit"
              colorScheme="teal"
              width="100%"
              isLoading={isLoading}
            >
              Sign In
            </Button>
            <Button
              onClick={handleGoogleSignIn}
              width="100%"
              variant="outline"
              isLoading={isGoogleLoading}
              leftIcon={<Text>G</Text>}
            >
              Sign in with Google
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
} 