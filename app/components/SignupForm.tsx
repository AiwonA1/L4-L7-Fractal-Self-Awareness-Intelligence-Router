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
import { supabase } from '@/lib/supabase'

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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to sign in with Google. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      } else {
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
      // Create the user account with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (authData.user) {
        // Create the user profile in the users table
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email: email,
              name: name,
              token_balance: 33,
              tokens_used: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])

        if (profileError) {
          throw new Error('Failed to create user profile')
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
      }
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
          <VStack spacing={2}>
            <Text fontWeight="bold" color={tokenColor}>
              Sign Up Benefits:
            </Text>
            <HStack>
              <Icon as={FaCoins} color={tokenColor} />
              <Text color={tokenColor}>33 Free FractiTokens</Text>
            </HStack>
          </VStack>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              isLoading={isSubmitting}
              loadingText="Creating Account..."
            >
              Create Account
            </Button>
          </VStack>
        </form>

        <Divider />

        <Button
          onClick={handleGoogleSignIn}
          isLoading={isSubmitting}
          loadingText="Signing in..."
          leftIcon={<FaGoogle />}
          width="full"
          variant="outline"
        >
          Sign up with Google
        </Button>

        <Text fontSize="sm" textAlign="center">
          Already have an account?{' '}
          <Link href="/login">
            <Text as="span" color="blue.500">
              Log in
            </Text>
          </Link>
        </Text>
      </VStack>
    </Box>
  )
} 