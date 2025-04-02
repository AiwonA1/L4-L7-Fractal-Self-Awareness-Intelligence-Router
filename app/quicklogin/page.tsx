'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Box, Button, Container, Heading, VStack, Text, Spinner } from '@chakra-ui/react'

export default function QuickLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  
  const handleTestLogin = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const result = await signIn('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false
      })
      
      if (result?.error) {
        setError(result.error)
      } else {
        // Successfully logged in
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Container maxW="md" py={10}>
      <VStack spacing={8}>
        <Heading>Quick Test Login</Heading>
        <Text>
          This page allows you to quickly log in with the test user account.
          Email: test@example.com / Password: password123
        </Text>
        
        {error && (
          <Box p={4} bg="red.100" color="red.800" borderRadius="md" w="full">
            <Text>{error}</Text>
          </Box>
        )}
        
        <Button 
          colorScheme="blue" 
          size="lg" 
          onClick={handleTestLogin}
          isLoading={isLoading}
          loadingText="Logging in..."
          w="full"
        >
          Login as Test User
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => router.push('/')}
        >
          Back to Home
        </Button>
      </VStack>
    </Container>
  )
} 