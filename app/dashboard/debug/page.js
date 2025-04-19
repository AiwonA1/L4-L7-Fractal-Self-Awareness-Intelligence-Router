'use client'

// Add route segment config
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Box, Container, Text, VStack, Button, Spinner } from '@chakra-ui/react'

export default function DashboardDebugPage() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [testResult, setTestResult] = useState(null)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        router.push('/login')
        return
      }

      setSession(session)
      setLoading(false)
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [router])

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

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6} align="stretch">
        <Box p={4} borderWidth="1px" borderRadius="lg">
          <Text fontSize="xl" fontWeight="bold">Session Status: {session ? 'Authenticated' : 'Not Authenticated'}</Text>
          {session ? (
            <VStack align="start" mt={2}>
              <Text>User: {session.user?.user_metadata.name}</Text>
              <Text>Email: {session.user?.user_metadata.email}</Text>
              <Text>ID: {session.user?.user_metadata.id}</Text>
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

        <Box p={4} borderWidth="1px" borderRadius="lg">
          <Button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/login')
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Sign Out
          </Button>
        </Box>
      </VStack>
    </Container>
  )
} 