'use client'

import { useState } from 'react'
import { Button, ButtonGroup, Input, VStack, Text, useToast } from '@chakra-ui/react'
import { FcGoogle } from 'react-icons/fc'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SignInButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailInput, setShowEmailInput] = useState(false)
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

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
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
        description: error instanceof Error ? error.message : 'Failed to sign in with Google',
        status: 'error',
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (showEmailInput) {
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
        <ButtonGroup spacing={4}>
          <Button
            onClick={handleEmailSignIn}
            isLoading={isLoading}
            colorScheme="blue"
          >
            Sign In
          </Button>
          <Button
            onClick={() => setShowEmailInput(false)}
            variant="ghost"
          >
            Cancel
          </Button>
        </ButtonGroup>
      </VStack>
    )
  }

  return (
    <ButtonGroup spacing={4}>
      <Button
        leftIcon={<FcGoogle />}
        onClick={handleGoogleSignIn}
        isLoading={isLoading}
        variant="outline"
      >
        Sign in with Google
      </Button>
      <Button
        onClick={() => setShowEmailInput(true)}
        variant="outline"
      >
        Sign in with Email
      </Button>
    </ButtonGroup>
  )
} 