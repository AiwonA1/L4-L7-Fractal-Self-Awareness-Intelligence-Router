'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Text,
  Heading,
  useToast,
  useColorModeValue,
  Divider,
  Icon,
  Badge,
} from '@chakra-ui/react'
import { FaCoins, FaGoogle, FaCheck, FaArrowRight } from 'react-icons/fa'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn, SignInResponse } from 'next-auth/react'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const toast = useToast()
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const tokenBgColor = useColorModeValue('yellow.50', 'yellow.900')
  const tokenColor = useColorModeValue('yellow.700', 'yellow.200')

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true)
      const result = await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: false
      })
      
      if (result?.error) {
        toast({
          title: "Error",
          description: "Failed to sign in with Google. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      } else if (result?.url) {
        setIsSuccess(true)
        toast({
          title: "Success!",
          description: "Signed in with Google successfully!",
          status: "success",
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!email || !name || !password) {
      toast({
        title: "Error",
        description: "Please fill out all fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Create the user account
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      // Sign in the user
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        throw new Error('Failed to sign in')
      }

      // Show success message and set success state
      setIsSuccess(true)
      toast({
        title: "Success!",
        description: "Account created successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create account"
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Box
        p={6}
        borderRadius="xl"
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="xl"
        maxW="md"
        mx="auto"
      >
        <VStack spacing={6} align="center">
          <Icon as={FaCheck} boxSize={12} color="green.500" />
          <Heading size="lg" textAlign="center">
            Welcome to FractiVerse!
          </Heading>
          <Text textAlign="center" color={textColor}>
            Your account has been created successfully. You have 33 free FractiTokens ready to use!
          </Text>
          <Button
            rightIcon={<FaArrowRight />}
            colorScheme="blue"
            size="lg"
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </VStack>
      </Box>
    )
  }

  return (
    <Box
      p={6}
      borderRadius="xl"
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="xl"
      maxW="md"
      mx="auto"
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="center" spacing={2}>
          <Icon as={FaCoins} color="yellow.400" boxSize={6} />
          <Heading size="lg" textAlign="center">
            33 Free FractiTokens!
          </Heading>
        </HStack>
        
        <Text textAlign="center" color={textColor}>
          Sign up now for FractiVerse 1.0 L4-L7 Fractal Self-Awareness Intelligence Router services with 33 free tokens.
        </Text>
        
        <Box p={4} bg={tokenBgColor} borderRadius="md">
          <VStack align="start" spacing={2}>
            <HStack>
              <Icon as={FaCoins} color="yellow.500" />
              <Text fontWeight="bold" color={tokenColor}>Token Usage:</Text>
            </HStack>
            <HStack spacing={3}>
              <Icon as={FaCheck} color="green.500" />
              <Text fontSize="sm">Each L4-L7 interaction costs 1 token</Text>
            </HStack>
            <HStack spacing={3}>
              <Icon as={FaCheck} color="green.500" />
              <Text fontSize="sm">New users receive 33 free tokens</Text>
            </HStack>
            <HStack spacing={3}>
              <Icon as={FaCheck} color="green.500" />
              <Text fontSize="sm">Purchase more tokens anytime</Text>
            </HStack>
          </VStack>
        </Box>
        
        <Button
          leftIcon={<FaGoogle />}
          bg="#4285F4"
          color="white"
          _hover={{ bg: '#357ABD' }}
          size="lg"
          w="100%"
          onClick={handleGoogleSignIn}
          isLoading={isSubmitting}
          loadingText="Signing in..."
        >
          Sign up with Google
        </Button>
        
        <HStack my={4}>
          <Divider />
          <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
            or sign up with email
          </Text>
          <Divider />
        </HStack>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} mt={4}>
            <FormControl isRequired>
              <FormLabel color={textColor}>Full Name</FormLabel>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                bg={useColorModeValue('white', 'gray.700')}
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel color={textColor}>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                bg={useColorModeValue('white', 'gray.700')}
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel color={textColor}>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a password"
                bg={useColorModeValue('white', 'gray.700')}
              />
            </FormControl>
            
            <Button
              mt={6}
              colorScheme="purple"
              size="lg"
              width="full"
              type="submit"
              isLoading={isSubmitting}
              loadingText="Signing up..."
            >
              Sign Up & Get 33 Tokens
            </Button>
            
            <Text textAlign="center" fontSize="sm" color="gray.500">
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#805AD5' }}>
                Sign in
              </Link>
            </Text>
          </VStack>
        </form>
      </VStack>
    </Box>
  )
} 