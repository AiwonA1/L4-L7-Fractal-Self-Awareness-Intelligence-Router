'use client'

import { Box, Container, VStack, Heading, Text, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import SignInButton from '@/app/components/SignInButton'
import SignUpButton from '@/app/components/SignUpButton'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      router.replace('/dashboard')
    }
  }, [user, router])

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading mb={4}>Welcome to FractiVerse</Heading>
          <Text>Sign in to continue your journey or create a new account</Text>
        </Box>
        
        <Tabs isFitted variant="enclosed">
          <TabList mb="1em">
            <Tab>Sign In</Tab>
            <Tab>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <SignInButton />
            </TabPanel>
            <TabPanel>
              <SignUpButton />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  )
} 