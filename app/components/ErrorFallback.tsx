'use client'

import { Box, Container, Heading, Text, Button } from '@chakra-ui/react'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary?: () => void
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <Container maxW="container.md" py={10}>
      <Box p={6} bg="red.50" borderRadius="lg" borderWidth="1px" borderColor="red.200">
        <Heading as="h2" size="lg" color="red.600" mb={4}>
          Something went wrong
        </Heading>
        <Text mb={4}>
          {error.message || 'An unexpected error occurred. Please try again later.'}
        </Text>
        {resetErrorBoundary && (
          <Button
            colorScheme="red"
            onClick={resetErrorBoundary}
          >
            Try again
          </Button>
        )}
      </Box>
    </Container>
  )
} 