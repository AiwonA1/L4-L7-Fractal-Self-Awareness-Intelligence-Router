'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Link as ChakraLink,
  useColorModeValue,
  Icon,
  HStack,
} from '@chakra-ui/react'
import { FaCoins } from 'react-icons/fa'
import Link from 'next/link'
import SignupForm from '../components/SignupForm'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const textColor = useColorModeValue('gray.800', 'white')
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400')
  const { status } = useSession()
  const router = useRouter()

  return (
    <Box bg={bgColor} minH="100vh" py={10}>
      <Container maxW="container.xl">
        <Box display="block" mb={4}>
          <Link href="/" style={{ textDecoration: 'none', color: '#3182ce' }}>
            ← Back to Home
          </Link>
        </Box>
        
        <VStack spacing={10} align="stretch">
          <Box textAlign="center">
            <HStack justify="center" mb={4}>
              <Icon as={FaCoins} w={8} h={8} color="yellow.500" />
              <Heading size="2xl" color={textColor}>
                Join the FractiVerse
              </Heading>
            </HStack>
            <Text fontSize="xl" color={mutedTextColor} maxW="3xl" mx="auto">
              Your first 33 requests to FractiVerse 1.0 services are automatically free.
            </Text>
          </Box>
          
          <SignupForm />
        </VStack>
      </Container>
    </Box>
  )
} 