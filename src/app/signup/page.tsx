'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useToast,
  VStack,
  Link as ChakraLink,
} from '@chakra-ui/react'
import Link from 'next/link'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred during signup')
      }

      toast({
        title: 'Success!',
        description: 'Please check your email to verify your account.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      router.push('/login')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred during signup',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8}>
        <Box textAlign="center">
          <Text fontSize="2xl" fontWeight="bold">Create your account</Text>
          <Text color="gray.600">Join FractiVerse today</Text>
        </Box>

        <Box w="100%" as="form" onSubmit={handleSignUp}>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="teal"
              size="lg"
              fontSize="md"
              isLoading={loading}
            >
              Sign Up
            </Button>
          </Stack>
        </Box>

        <Text>
          Already have an account?{' '}
          <Link href="/login" passHref>
            <ChakraLink color="teal.500">Sign in</ChakraLink>
          </Link>
        </Text>
      </VStack>
    </Container>
  )
} 