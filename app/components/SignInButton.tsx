'use client'

import { useState } from 'react'
import { Button, ButtonGroup, Input, VStack, Text, useToast } from '@chakra-ui/react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SignInButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const toast = useToast()
  const router = useRouter()

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both email and password',
        status: 'error',
        duration: 3000,
      })
      return
    }

    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Signed in successfully',
        status: 'success',
        duration: 3000,
      })

      router.push('/dashboard')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign in',
        status: 'error',
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        onClick={handleEmailSignIn}
        isLoading={isLoading}
        colorScheme="blue"
        width="100%"
      >
        Sign In
      </Button>
    </VStack>
  )
} 