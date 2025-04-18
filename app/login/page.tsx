'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Heading,
  useToast,
  Container,
  Link as ChakraLink,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast({
        title: 'Success!',
        description: 'You have been logged in.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to log in. Please check your credentials.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8}>
        <Heading size="xl" color="gray.800">Welcome Back</Heading>
        <Box w="100%" p={8} borderWidth={1} borderRadius="lg" bg="white" boxShadow="lg">
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  bg="white"
                  color="gray.800"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  bg="white"
                  color="gray.800"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="brand"
                width="full"
                isLoading={isLoading}
                loadingText="Logging in..."
              >
                Log In
              </Button>

              <Text fontSize="sm" color="gray.600">
                Don't have an account?{' '}
                <ChakraLink as={Link} href="/signup" color="brand.500">
                  Sign up
                </ChakraLink>
              </Text>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Container>
  )
} 