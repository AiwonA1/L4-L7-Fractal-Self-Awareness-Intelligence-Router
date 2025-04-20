'use client'

import { useState } from 'react'
import { Button, Input, VStack, FormControl, FormLabel, useToast } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function SignUpButton() {
  const router = useRouter()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async () => {
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both email and password',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error

      toast({
        title: 'Success',
        description: 'Please check your email to verify your account',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      
      // Don't redirect yet - user needs to verify email first
    } catch (error) {
      console.error('Error signing up:', error)
      toast({
        title: 'Error signing up',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <VStack spacing={4} w="100%" maxW="400px">
      <FormControl>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
      </FormControl>
      <FormControl>
        <FormLabel>Password</FormLabel>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
      </FormControl>
      <Button
        colorScheme="teal"
        onClick={handleSignUp}
        isLoading={isLoading}
        w="100%"
      >
        Sign Up
      </Button>
    </VStack>
  )
} 