'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Box, Button, Container, Heading, Text, VStack, useToast } from '@chakra-ui/react'
import { Session } from '@supabase/supabase-js'

export default function TestSupabase() {
  const [session, setSession] = useState<Session | null>(null)
  const [profiles, setProfiles] = useState<any[]>([])
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  useEffect(() => {
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (session?.user) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
      if (profilesError) throw profilesError
      setProfiles(profilesData)

      // Fetch chat history
      const { data: chatData, error: chatError } = await supabase
        .from('chat_history')
        .select('*')
      if (chatError) throw chatError
      setChatHistory(chatData)

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
      if (messagesError) throw messagesError
      setMessages(messagesData)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch data',
        status: 'error',
        duration: 5000,
      })
    }
  }

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign in',
        status: 'error',
        duration: 5000,
      })
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setProfiles([])
      setChatHistory([])
      setMessages([])
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign out',
        status: 'error',
        duration: 5000,
      })
    }
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading>Supabase Test Page</Heading>
        
        {!session ? (
          <Button onClick={handleSignIn} colorScheme="blue">
            Sign In with Google
          </Button>
        ) : (
          <>
            <Text>Signed in as: {session.user.email}</Text>
            <Button onClick={handleSignOut} colorScheme="red">
              Sign Out
            </Button>

            <Box>
              <Heading size="md" mb={2}>Profiles ({profiles.length})</Heading>
              <Text>{JSON.stringify(profiles, null, 2)}</Text>
            </Box>

            <Box>
              <Heading size="md" mb={2}>Chat History ({chatHistory.length})</Heading>
              <Text>{JSON.stringify(chatHistory, null, 2)}</Text>
            </Box>

            <Box>
              <Heading size="md" mb={2}>Messages ({messages.length})</Heading>
              <Text>{JSON.stringify(messages, null, 2)}</Text>
            </Box>

            {error && (
              <Text color="red.500">Error: {error}</Text>
            )}
          </>
        )}
      </VStack>
    </Container>
  )
} 