'use client'

import { Box, Container, VStack, Heading, Text, Button, useToast, Progress } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function VerifyPending() {
  const router = useRouter()
  const toast = useToast()
  const [timeLeft, setTimeLeft] = useState(60) // 60 seconds cooldown
  const [isResending, setIsResending] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem('pendingVerificationEmail')
    if (storedEmail) {
      setEmail(storedEmail)
    }

    toast({
      title: 'Check Your Email',
      description: 'Please check your email to verify your account.',
      status: 'info',
      duration: 5000,
      isClosable: true,
    })
  }, [toast])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const handleResendVerification = async () => {
    if (!email || timeLeft > 0) return

    setIsResending(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        throw new Error('Failed to resend verification email')
      }

      toast({
        title: 'Email Sent',
        description: 'A new verification email has been sent.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      setTimeLeft(60) // Reset cooldown
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend verification email. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6} align="center">
        <Heading>Verify Your Email</Heading>
        <Text textAlign="center">
          We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </Text>
        <Text fontSize="sm" color="gray.500">
          The verification link will expire in 24 hours.
        </Text>
        
        {/* Resend Section */}
        <Box w="full" maxW="md">
          <VStack spacing={4}>
            <Progress value={(timeLeft / 60) * 100} w="full" colorScheme="teal" />
            <Button
              colorScheme="teal"
              onClick={handleResendVerification}
              isLoading={isResending}
              isDisabled={timeLeft > 0}
              w="full"
            >
              {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend Verification Email'}
            </Button>
          </VStack>
        </Box>

        <Button
          colorScheme="teal"
          variant="outline"
          onClick={() => router.push('/')}
        >
          Return to Home
        </Button>
      </VStack>
    </Container>
  )
} 