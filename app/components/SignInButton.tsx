'use client'

import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Text,
  Divider,
  Icon,
} from '@chakra-ui/react'
import { useState } from 'react'
import { FaGoogle } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'

export default function SignInButton() {
  const { showAuthModal, setShowAuthModal, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const router = useRouter()

  const handleClose = () => {
    setShowAuthModal(false)
    setEmail('')
    setPassword('')
  }

  const showError = (message: string) => {
    toast({
      title: 'Error',
      description: message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    })
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signIn(email, password)
      
      toast({
        title: 'Success!',
        description: 'You have been logged in.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      handleClose()
      router.push('/dashboard')
    } catch (error: any) {
      if (error.message?.includes('Invalid login credentials')) {
        showError('Invalid email or password')
      } else if (error.message?.includes('Invalid API key')) {
        showError('Authentication service error. Please try again later.')
      } else {
        showError(error.message || 'Failed to sign in. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) throw error
    } catch (error: any) {
      showError('Failed to sign in with Google. Please try again.')
    }
  }

  return (
    <>
      <Button colorScheme="blue" onClick={() => setShowAuthModal(true)}>
        Sign In
      </Button>

      <Modal isOpen={showAuthModal} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sign In</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Button
                leftIcon={<Icon as={FaGoogle} />}
                width="full"
                onClick={handleGoogleSignIn}
                colorScheme="red"
                variant="outline"
              >
                Sign in with Google
              </Button>

              <Divider />

              <form onSubmit={handleEmailSignIn} style={{ width: '100%' }}>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Password</FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    width="full"
                    isLoading={isLoading}
                    loadingText="Signing in..."
                  >
                    Sign In
                  </Button>
                </VStack>
              </form>

              <Text fontSize="sm">
                Don't have an account?{' '}
                <Link href="/signup">
                  <Text as="span" color="blue.500">
                    Sign up
                  </Text>
                </Link>
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
} 