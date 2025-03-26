'use client'

import { Box, Container, VStack, Heading, Text, Button, useToast } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function VerifySuccess() {
  const router = useRouter()
  const toast = useToast()

  useEffect(() => {
    toast({
      title: 'Email Verified',
      description: 'Your email has been verified successfully.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    })
  }, [toast])

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6} align="center">
        <Heading>Email Verified!</Heading>
        <Text textAlign="center">
          Thank you for verifying your email address. You can now access all features of FractiVerse Router.
        </Text>
        <Button
          colorScheme="teal"
          onClick={() => router.push('/dashboard')}
        >
          Go to Dashboard
        </Button>
      </VStack>
    </Container>
  )
} 