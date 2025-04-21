'use client'

import { Box, Container, VStack, Spinner, Text } from '@chakra-ui/react'

export default function Loading() {
  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }} py={20}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="center">
          <Spinner size="xl" color="teal.500" thickness="4px" speed="0.65s" />
          <Text fontSize="xl" color="gray.600" _dark={{ color: 'gray.300' }}>
            Loading...
          </Text>
        </VStack>
      </Container>
    </Box>
  )
} 