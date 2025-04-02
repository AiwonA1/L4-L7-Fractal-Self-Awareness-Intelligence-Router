'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
  Center,
  Link,
  Code,
  Alert,
  AlertIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'
import { useAuth } from '../hooks/useAuth'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function LoginDebugPage() {
  const [email, setEmail] = useState('admin@fractiverse.com')
  const [password, setPassword] = useState('admin123')
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()
  const router = useRouter()
  const { status, data: session } = useSession()

  // Fetch debug info
  const fetchDebugInfo = async () => {
    try {
      const response = await fetch('/api/debug')
      const data = await response.json()
      setDebugInfo(data)
    } catch (err) {
      console.error('Error fetching debug info:', err)
      setError(err instanceof Error ? err.message : 'Unknown error fetching debug info')
    }
  }

  useEffect(() => {
    fetchDebugInfo()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError(result.error)
        toast({
          title: 'Error',
          description: result.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } else if (result?.ok) {
        toast({
          title: 'Success',
          description: 'You have been logged in successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        
        // Fetch updated debug info after login
        await fetchDebugInfo()
        
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error during login')
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="md">
          <VStack spacing={6} as="form" onSubmit={handleSubmit}>
            <Heading as="h1" size="xl">Login Debug</Heading>
            
            <Alert status={status === 'authenticated' ? 'success' : 'info'}>
              <AlertIcon />
              Session Status: <strong>{status}</strong>
            </Alert>
            
            {status === 'authenticated' && (
              <Alert status="success">
                <AlertIcon />
                Logged in as: <strong>{session?.user?.email}</strong>
              </Alert>
            )}
            
            <FormControl id="email" isRequired>
              <FormLabel>Email address</FormLabel>
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            
            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}
            
            <Button
              colorScheme="teal"
              size="lg"
              type="submit"
              isLoading={isLoading}
              width="full"
            >
              Sign In
            </Button>
            
            <Button
              colorScheme="red"
              size="md"
              width="full"
              mt={2}
              onClick={async () => {
                try {
                  // 1. Call the server-side cookie clearing API
                  const response = await fetch('/api/auth/clear-cookies')
                  const data = await response.json()
                  
                  // 2. Clear localStorage
                  localStorage.clear()
                  
                  // 3. Clear all client-side cookies
                  document.cookie.split(';').forEach(cookie => {
                    const [name] = cookie.trim().split('=')
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`
                  })
                  
                  toast({
                    title: 'Server-side cookie clearing',
                    description: `Cleared ${data.cleared?.length || 0} cookies`,
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                  });
                  
                  // Reload with cache busting
                  setTimeout(() => {
                    window.location.href = '/login-debug?t=' + Date.now();
                  }, 1000);
                } catch (error) {
                  console.error('Error clearing server cookies:', error);
                  toast({
                    title: 'Error clearing server cookies',
                    description: String(error),
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                  });
                }
              }}
            >
              Clear Server Cookies (More Reliable)
            </Button>
            
            <Button
              colorScheme="blue"
              size="md"
              onClick={fetchDebugInfo}
              width="full"
            >
              Refresh Debug Info
            </Button>
            
            <Center>
              <Link as={NextLink} href="/" color="teal.500">
                Back to Home
              </Link>
            </Center>
          </VStack>
        </Box>
        
        <Box p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="md">
          <Heading as="h2" size="md" mb={4}>Debug Information</Heading>
          
          <Accordion allowToggle>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    Session Data
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} maxH="300px" overflowY="auto">
                <Code p={2} borderRadius="md" display="block" whiteSpace="pre" fontSize="xs">
                  {JSON.stringify(session, null, 2)}
                </Code>
              </AccordionPanel>
            </AccordionItem>
            
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    API Debug Info
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} maxH="300px" overflowY="auto">
                <Code p={2} borderRadius="md" display="block" whiteSpace="pre" fontSize="xs">
                  {debugInfo ? JSON.stringify(debugInfo, null, 2) : 'Loading...'}
                </Code>
              </AccordionPanel>
            </AccordionItem>
            
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    Environment
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Text>NextAuth URL: <Code>{process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'Not set'}</Code></Text>
                <Text>Secret set: <Code>{debugInfo?.nextAuthConfig?.secret || 'Unknown'}</Code></Text>
                <Text>Providers: <Code>{debugInfo?.nextAuthConfig?.providers || 'Unknown'}</Code></Text>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>
      </VStack>
    </Container>
  )
} 