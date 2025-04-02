'use client'

import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Box, Container, Text, VStack, Spinner, Button, Code, Alert, AlertIcon } from '@chakra-ui/react'

export default function LogoutPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Signing out...')
  const [debugInfo, setDebugInfo] = useState<string>('')

  // Function to completely clear all cookies
  const clearAllCookies = () => {
    try {
      const cookies = document.cookie.split(';')
      setDebugInfo(`Found ${cookies.length} cookies to clear`)
      
      for (const cookie of cookies) {
        const [name] = cookie.trim().split('=')
        if (name) {
          // Clear cookie with all possible domain and path combinations
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`
        }
      }
      
      // Check if cookies were actually cleared
      const remainingCookies = document.cookie.split(';').filter(c => c.trim()).length
      setDebugInfo(prev => `${prev}\nRemaining cookies: ${remainingCookies}`)
      
      return remainingCookies === 0
    } catch (error) {
      console.error("Error clearing cookies:", error)
      setDebugInfo(prev => `${prev}\nError clearing cookies: ${error}`)
      return false
    }
  }

  // Server-side cookie clearing
  const clearServerCookies = async () => {
    try {
      const response = await fetch('/api/auth/clear-cookies')
      const data = await response.json()
      setDebugInfo(prev => `${prev}\nServer-side cookie clearing: ${JSON.stringify(data)}`)
      return true
    } catch (error) {
      setDebugInfo(prev => `${prev}\nError in server-side cookie clearing: ${error}`)
      return false
    }
  }

  useEffect(() => {
    async function performFullLogout() {
      try {
        // Clear localStorage
        localStorage.clear()
        setDebugInfo('LocalStorage cleared')
        
        // First attempt to sign out via NextAuth
        try {
          await signOut({ redirect: false })
          setDebugInfo(prev => `${prev}\nNextAuth signout completed`)
        } catch (e) {
          setDebugInfo(prev => `${prev}\nNextAuth signout error: ${e}`)
        }
        
        // Now forcefully clear all cookies
        const cookiesCleared = clearAllCookies()
        setDebugInfo(prev => `${prev}\nCookie clearing result: ${cookiesCleared}`)
        
        // Try to clear sessionStorage too
        try {
          sessionStorage.clear()
          setDebugInfo(prev => `${prev}\nSessionStorage cleared`)
        } catch (e) {
          // Ignore errors with sessionStorage
        }
        
        // Server-side cookie clearing
        await clearServerCookies()
        
        // Set success state
        setStatus('success')
        setMessage('Successfully signed out.')
        
        // Redirect after a delay
        setTimeout(() => {
          // Force a hard refresh to / to ensure all state is cleared
          window.location.href = '/?clearcache=' + new Date().getTime()
        }, 2000)
      } catch (error) {
        console.error('Logout error:', error)
        setStatus('error')
        setMessage(`Error during logout: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    
    performFullLogout()
  }, [])

  const forceHomeRedirect = () => {
    // Force hard redirect to home with cache busting
    window.location.href = '/?clearcache=' + new Date().getTime()
  }

  return (
    <Container maxW="container.md" py={20}>
      <VStack spacing={8} align="center">
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            {message}
          </Text>
          
          {status === 'loading' && <Spinner size="xl" color="teal.500" />}
          
          {status === 'success' && (
            <>
              <Alert status="success" mb={4}>
                <AlertIcon />
                Logged out successfully. Redirecting to home page...
              </Alert>
              <Text>If you're not redirected automatically, click the button below.</Text>
            </>
          )}
          
          {status === 'error' && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              Error during logout. Please try using the button below.
            </Alert>
          )}
        </Box>
        
        <Box mt={2}>
          <Button
            colorScheme="teal"
            size="lg"
            onClick={forceHomeRedirect}
          >
            Go to Home Page
          </Button>
        </Box>
        
        {/* Debug information */}
        <Box mt={4} p={4} bg="gray.50" borderRadius="md" width="100%" maxHeight="200px" overflowY="auto">
          <Text fontSize="sm" fontWeight="bold" mb={2}>Debug Info:</Text>
          <Code display="block" whiteSpace="pre" p={2} fontSize="xs">
            {debugInfo}
          </Code>
        </Box>
      </VStack>
    </Container>
  )
} 