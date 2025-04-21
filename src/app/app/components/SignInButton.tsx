'use client'

import { useState, useEffect } from 'react'
import { Button, Input, VStack, FormControl, FormLabel, useToast, Text, Link } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function SignInButton() {
  const router = useRouter()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsChecking(true)
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error checking session:', error.message)
          return
        }

        if (session?.user) {
          console.log('Existing session found:', session.user.id)
          router.replace('/dashboard')
          return
        }
      } catch (error) {
        console.error('Error in session check:', error)
      } finally {
        setIsChecking(false)
      }
    }
    
    checkSession()
  }, [router])

  const handleSignIn = async () => {
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
      console.log('Attempting sign in with email:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Sign in error:', error.message)
        if (error.message === 'Invalid login credentials') {
          toast({
            title: 'Error signing in',
            description: 'Invalid email or password. Please try again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        } else if (error.message.includes('Email not confirmed')) {
          toast({
            title: 'Email not verified',
            description: 'Please check your email and verify your account before signing in.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          })
        } else {
          throw error
        }
        return
      }

      if (!data.session) {
        console.error('No session created after successful sign in')
        toast({
          title: 'Error',
          description: 'No session created. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      console.log('Sign in successful, user:', data.session.user.id)
      router.replace('/dashboard')
      
    } catch (error) {
      console.error('Error signing in:', error)
      toast({
        title: 'Error signing in',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return null // Or a loading spinner if you prefer
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
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSignIn()
            }
          }}
        />
      </FormControl>
      <Button
        colorScheme="teal"
        onClick={handleSignIn}
        isLoading={isLoading}
        w="100%"
      >
        Sign In
      </Button>
      <Text fontSize="sm">
        Don't have an account? <Link color="teal.500" href="/signup">Sign up</Link>
      </Text>
      <Text fontSize="sm">
        <Link color="teal.500" href="/forgot-password">Forgot password?</Link>
      </Text>
    </VStack>
  )
} 