'use client'

import { Box, Container, Heading, Text, VStack, Button, Icon } from '@chakra-ui/react'
import { FaArrowLeft } from 'react-icons/fa'
import Link from 'next/link'

export default function NotFound() {
  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }} py={20}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="center">
          <Heading size="2xl">404 - Page Not Found</Heading>
          <Text fontSize="xl" color="gray.600" _dark={{ color: 'gray.300' }}>
            The page you're looking for doesn't exist or has been moved.
          </Text>
          <Link href="/">
            <Button leftIcon={<Icon as={FaArrowLeft} />} colorScheme="teal" size="lg">
              Back to Home
            </Button>
          </Link>
        </VStack>
      </Container>
    </Box>
  )
} 