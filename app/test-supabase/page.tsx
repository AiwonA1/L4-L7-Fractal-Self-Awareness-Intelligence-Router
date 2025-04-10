'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Code,
  Button,
  useToast,
} from '@chakra-ui/react'

export default function TestSupabase() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [profilesData, setProfilesData] = useState<any>(null)
  const [chatsData, setChatsData] = useState<any>(null)
  const [messagesData, setMessagesData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  const runTests = async () => {
    setLoading(true)
    setError(null)
    try {
      // Test 1: Session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw new Error(`Session error: ${sessionError.message}`)
      setSessionData(session)
      
      // Test 2: Profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5)
      if (profilesError) throw new Error(`Profiles error: ${profilesError.message}`)
      setProfilesData(profiles)

      // Test 3: Chats
      const { data: chats, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .limit(5)
      if (chatsError) throw new Error(`Chats error: ${chatsError.message}`)
      setChatsData(chats)

      // Test 4: Messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .limit(5)
      if (messagesError) throw new Error(`Messages error: ${messagesError.message}`)
      setMessagesData(messages)

      toast({
        title: 'Tests completed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      toast({
        title: 'Test failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  const DataSection = ({ title, data }: { title: string; data: any }) => (
    <Box p={4} borderWidth={1} borderRadius="md" w="100%">
      <Heading size="md" mb={2}>{title}</Heading>
      <Code display="block" whiteSpace="pre" p={2} borderRadius="md" maxH="200px" overflowY="auto">
        {JSON.stringify(data, null, 2)}
      </Code>
    </Box>
  )

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading>Supabase Connection Test</Heading>
        
        <Button
          onClick={runTests}
          colorScheme="blue"
          isLoading={loading}
          mb={4}
        >
          Run Tests Again
        </Button>

        {error && (
          <Box p={4} bg="red.100" color="red.700" borderRadius="md">
            <Text fontWeight="bold">Error:</Text>
            <Text>{error}</Text>
          </Box>
        )}

        {!loading && !error && (
          <>
            <DataSection title="Session Data" data={sessionData} />
            <DataSection title="Profiles Data" data={profilesData} />
            <DataSection title="Chats Data" data={chatsData} />
            <DataSection title="Messages Data" data={messagesData} />
          </>
        )}
      </VStack>
    </Container>
  )
} 