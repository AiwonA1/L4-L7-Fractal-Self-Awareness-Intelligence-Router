'use client'

import { Box, Container, Heading, Text, VStack, Button, Icon } from '@chakra-ui/react'
import { FaHome } from 'react-icons/fa'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }} py={20}>
          <Container maxW="container.xl">
            <VStack spacing={8} align="center">
              <Heading size="2xl">A critical error occurred</Heading>
              <Text fontSize="xl" color="gray.600" _dark={{ color: 'gray.300' }}>
                {error.message || 'The application encountered a fatal error.'}
              </Text>
              <VStack spacing={4}>
                <Button
                  colorScheme="red"
                  size="lg"
                  onClick={reset}
                >
                  Reset Application
                </Button>
                <Link href="/">
                  <Button leftIcon={<Icon as={FaHome} />} variant="ghost" size="lg">
                    Return Home
                  </Button>
                </Link>
              </VStack>
            </VStack>
          </Container>
        </Box>
      </body>
    </html>
  )
} 