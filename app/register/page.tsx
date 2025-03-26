'use client'

import React, { useState, ChangeEvent } from 'react'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  Heading,
  Text,
  useToast,
  Link as ChakraLink,
  useColorModeValue,
  Icon,
  InputProps,
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaUserPlus, FaEnvelope, FaLock, FaCheck } from 'react-icons/fa'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const toast = useToast()
  const router = useRouter()

  const bgGradient = useColorModeValue(
    'linear(to-r, blue.50, purple.50)',
    'linear(to-r, blue.900, purple.900)'
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      setIsLoading(false)
      return
    }

    try {
      await signUp(email, password)
      router.push('/')
      toast({
        title: 'Success',
        description: 'Your account has been created successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create account. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box minH="100vh" bg={bgGradient} py={20}>
      <Container maxW="container.sm">
        <Box
          bg={useColorModeValue('white', 'gray.800')}
          p={8}
          borderRadius="lg"
          boxShadow="xl"
        >
          <VStack spacing={8} align="stretch">
            <VStack spacing={2} align="center">
              <Icon as={FaUserPlus} w={10} h={10} color="blue.500" />
              <Heading size="xl">Create Your Account</Heading>
              <Text color="gray.600" _dark={{ color: 'gray.300' }}>
                Join the FractiVerse community and experience the next generation of AI interaction
              </Text>
            </VStack>

            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaEnvelope} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaLock} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      placeholder="Create a password"
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Confirm Password</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaCheck} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                    />
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                >
                  Create Account
                </Button>
              </VStack>
            </form>

            <Text textAlign="center">
              Already have an account?{' '}
              <Link href="/login" passHref>
                <ChakraLink color="blue.500">Sign in</ChakraLink>
              </Link>
            </Text>

            <Box pt={6} borderTopWidth={1} borderColor="gray.200">
              <Text fontSize="sm" color="gray.600" textAlign="center">
                By creating an account, you agree to our{' '}
                <ChakraLink href="/terms" color="blue.500">Terms of Service</ChakraLink>{' '}
                and{' '}
                <ChakraLink href="/privacy" color="blue.500">Privacy Policy</ChakraLink>
              </Text>
            </Box>
          </VStack>
        </Box>
      </Container>
    </Box>
  )
} 