'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Heading, Text, VStack, Spinner } from '@chakra-ui/react'
import { useAuth } from '@/app/context/AuthContext'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
    >
      <VStack spacing={6} p={8} bg="white" rounded="xl" shadow="lg">
        <Heading size="lg" color="green.500">
          Payment Successful!
        </Heading>
        <Text textAlign="center">
          Thank you for your purchase. Your FractiTokens have been added to your account.
        </Text>
        <Text fontSize="sm" color="gray.500">
          Redirecting to dashboard...
        </Text>
        <Spinner size="lg" color="blue.500" />
      </VStack>
    </Box>
  )
} 