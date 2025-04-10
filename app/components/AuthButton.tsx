'use client'

import { useState, useEffect } from 'react'
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  useDisclosure,
  Icon,
} from '@chakra-ui/react'
import { FaUser, FaUserPlus } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthButton() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isNewUser, setIsNewUser] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUserStatus()
  }, [])

  const checkUserStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // User is signed in
        router.push('/dashboard')
        return
      }

      // Check if user has previously signed up
      const { data: existingUsers, error } = await supabase
        .from('users')
        .select('id')
        .limit(1)

      if (error) {
        console.error('Error checking user status:', error)
        return
      }

      setIsNewUser(existingUsers.length === 0)
    } catch (error) {
      console.error('Error in checkUserStatus:', error)
    }
  }

  const handleSignIn = () => {
    router.push('/login')
    onClose()
  }

  const handleSignUp = () => {
    router.push('/signup')
    onClose()
  }

  return (
    <>
      <Button
        colorScheme="blue"
        onClick={onOpen}
        leftIcon={isNewUser ? <Icon as={FaUserPlus} /> : <Icon as={FaUser} />}
      >
        {isNewUser ? 'Sign Up' : 'Sign In'}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isNewUser ? 'Welcome to FractiVerse!' : 'Welcome Back!'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Text>
                {isNewUser
                  ? 'Get started with 33 free FractiTokens!'
                  : 'Sign in to continue your journey.'}
              </Text>
              <Button
                colorScheme="blue"
                width="full"
                onClick={isNewUser ? handleSignUp : handleSignIn}
              >
                {isNewUser ? 'Create Account' : 'Sign In'}
              </Button>
              <Button
                variant="outline"
                width="full"
                onClick={() => {
                  setIsNewUser(!isNewUser)
                }}
              >
                {isNewUser
                  ? 'Already have an account? Sign In'
                  : 'Need an account? Sign Up'}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
} 