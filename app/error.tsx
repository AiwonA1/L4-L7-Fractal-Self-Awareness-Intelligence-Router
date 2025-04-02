'use client'

import { Box, Container, Heading, Text, VStack, Button, Icon } from '@chakra-ui/react'
import { FaArrowLeft, FaRedo } from 'react-icons/fa'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }} py={20}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="center">
          <Heading size="2xl">Something went wrong!</Heading>
          <Text fontSize="xl" color="gray.600" _dark={{ color: 'gray.300' }}>
            {error.message || 'An unexpected error occurred.'}
          </Text>
          <VStack spacing={4}>
            <Button
              leftIcon={<Icon as={FaRedo} />}
              colorScheme="teal"
              size="lg"
              onClick={reset}
            >
              Try Again
            </Button>
            <Link href="/">
              <Button leftIcon={<Icon as={FaArrowLeft} />} variant="ghost" size="lg">
                Back to Home
              </Button>
            </Link>
          </VStack>
        </VStack>
      </Container>
    </Box>
  )
} 