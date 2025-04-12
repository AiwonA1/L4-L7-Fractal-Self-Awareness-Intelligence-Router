'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/app/context/AuthContext'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Code,
  Button,
  useToast,
  Input,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'

export default function TestSupabase() {
  const { user, session, signIn, isLoading: authLoading } = useAuth()
  const [sessionData, setSessionData] = useState<any>(null)
  const [profilesData, setProfilesData] = useState<any>(null)
  const [chatHistoryData, setChatHistoryData] = useState<any>(null)
  const [messagesData, setMessagesData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const toast = useToast()

  const handleSignIn = async () => {
    try {
      await signIn(email, password)
      toast({
        title: 'Signed in successfully',
        status: 'success',
        duration: 3000,
      })
    } catch (err) {
      toast({
        title: 'Sign in failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      })
    }
  }

  const runTests = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('🔍 Starting Supabase connection tests...')
      
      // Test 1: Session
      console.log('🔐 Testing session...')
      if (!session) {
        console.log('⚠️ No active session')
        setSessionData({ status: 'unauthenticated', message: 'Please sign in to run tests' })
        return
      }
      
      console.log('✅ Session test passed:', session)
      setSessionData(session)
      
      // Test 2: Profiles
      console.log('👤 Testing profiles...')
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()
      if (profilesError) throw new Error(`Profiles error: ${profilesError.message}`)
      console.log('✅ Profiles test passed:', profiles)
      setProfilesData(profiles)

      // Test 3: Chat History
      console.log('💬 Testing chat history...')
      const { data: chatHistory, error: chatHistoryError } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user?.id)
        .limit(5)
      if (chatHistoryError) throw new Error(`Chat History error: ${chatHistoryError.message}`)
      console.log('✅ Chat History test passed:', chatHistory)
      setChatHistoryData(chatHistory)

      // Test 4: Messages
      console.log('📨 Testing messages...')
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user?.id)
        .limit(5)
      if (messagesError) throw new Error(`Messages error: ${messagesError.message}`)
      console.log('✅ Messages test passed:', messages)
      setMessagesData(messages)

      console.log('✨ All tests completed successfully')
      toast({
        title: 'Tests completed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (err) {
      console.error('❌ Test failed:', err)
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
    if (session) {
      runTests()
    }
  }, [session])

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
        
        {!session ? (
          <Box p={4} borderWidth={1} borderRadius="md">
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
              <Button
                onClick={handleSignIn}
                colorScheme="blue"
                isLoading={authLoading}
              >
                Sign In
              </Button>
            </VStack>
          </Box>
        ) : (
          <>
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
                <DataSection title="Chat History Data" data={chatHistoryData} />
                <DataSection title="Messages Data" data={messagesData} />
              </>
            )}
          </>
        )}
      </VStack>
    </Container>
  )
} 