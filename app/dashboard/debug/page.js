'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Box, Container, Text, VStack, Button, Spinner } from '@chakra-ui/react'

export default function DebugDashboard() {
  const { data: session, status } = useSession()
  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(false)
  
  console.log('Debug Dashboard - Session status:', status)
  console.log('Debug Dashboard - Session data:', session)
  
  const testApi = async (endpoint) => {
    setLoading(true)
    try {
      const response = await fetch(endpoint)
      const data = await response.json()
      console.log(`Test ${endpoint} result:`, data)
      setTestResult({ endpoint, data })
    } catch (error) {
      console.error(`Error testing ${endpoint}:`, error)
      setTestResult({ endpoint, error: error.message })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6} align="stretch">
        <Box p={4} borderWidth="1px" borderRadius="lg">
          <Text fontSize="xl" fontWeight="bold">Session Status: {status}</Text>
          {session ? (
            <VStack align="start" mt={2}>
              <Text>User: {session.user?.name}</Text>
              <Text>Email: {session.user?.email}</Text>
              <Text>ID: {session.user?.id}</Text>
            </VStack>
          ) : (
            <Text mt={2}>No session data</Text>
          )}
        </Box>
        
        <Box p={4} borderWidth="1px" borderRadius="lg">
          <Text fontSize="xl" fontWeight="bold" mb={4}>API Tests</Text>
          <VStack spacing={4}>
            <Button onClick={() => testApi('/api/test-db')} isLoading={loading}>
              Test Database Connection
            </Button>
            <Button onClick={() => testApi('/api/tokens')} isLoading={loading}>
              Test Tokens API
            </Button>
            <Button onClick={() => testApi('/api/chat')} isLoading={loading}>
              Test Chat API
            </Button>
          </VStack>
          
          {testResult && (
            <Box mt={4} p={4} bg="gray.50" borderRadius="md">
              <Text fontWeight="bold">{testResult.endpoint} Result:</Text>
              <Box as="pre" mt={2} fontSize="sm" overflowX="auto">
                {JSON.stringify(testResult.data || testResult.error, null, 2)}
              </Box>
            </Box>
          )}
        </Box>
      </VStack>
    </Container>
  )
} 