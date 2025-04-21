'use client'

import { Box, Container, VStack, Heading, Text, Button, useToast } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function VerifyError() {
  const router = useRouter()
  const toast = useToast()

  useEffect(() => {
    toast({
      title: 'Verification Failed',
      description: 'The verification link is invalid or has expired.',
      status: 'error',
      duration: 5000,
      isClosable: true,
    })
  }, [toast])

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6} align="center">
        <Heading>Verification Failed</Heading>
        <Text textAlign="center">
          The verification link is invalid or has expired. Please request a new verification email.
        </Text>
        <Button
          colorScheme="teal"
          onClick={() => router.push('/')}
        >
          Return to Home
        </Button>
      </VStack>
    </Container>
  )
} 