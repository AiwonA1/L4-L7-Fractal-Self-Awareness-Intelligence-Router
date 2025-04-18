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
  useColorModeValue,
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

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'white')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

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
      <VStack spacing={8} w="100%">
        <Heading size="xl" color={textColor}>Welcome Back</Heading>
        <Box 
          w="100%" 
          p={8} 
          borderWidth={1} 
          borderRadius="lg" 
          borderColor={borderColor}
          bg={bgColor} 
          boxShadow="lg"
        >
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color={textColor}>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor}>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

              <Text fontSize="sm" color={textColor}>
                Don't have an account?{' '}
                <ChakraLink as={Link} href="/signup" color="brand.500">
                  Sign up
                </ChakraLink>
              </Text>

              <ChakraLink 
                as={Link} 
                href="/forgot-password" 
                color="brand.500" 
                fontSize="sm"
                alignSelf="flex-start"
              >
                Forgot your password?
              </ChakraLink>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Container>
  )
} 