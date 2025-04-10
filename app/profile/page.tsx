'use client'

import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Avatar,
  Button,
  useColorModeValue,
  Card,
  CardBody,
  Stack,
  Divider,
  CardHeader,
  HStack,
  Badge,
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { FaCoins, FaArrowLeft } from 'react-icons/fa'

interface ExtendedUser extends User {
  token_balance: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <Container maxW="container.md" py={8}>
        <Text>Loading...</Text>
      </Container>
    )
  }

  return (
    <Container maxW="container.md" py={8}>
      <Button
        leftIcon={<FaArrowLeft />}
        onClick={() => router.push('/dashboard')}
        mb={6}
        variant="ghost"
      >
        Back to Dashboard
      </Button>

      <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" borderRadius="lg">
        <CardHeader>
          <HStack spacing={4}>
            <Avatar
              size="xl"
              name={session?.user?.name || 'User'}
              src={session?.user?.image || undefined}
            />
            <VStack align="start" spacing={1}>
              <Heading size="lg">{session?.user?.name || 'User'}</Heading>
              <Text color="gray.500">{session?.user?.email}</Text>
            </VStack>
          </HStack>
        </CardHeader>

        <Divider />

        <CardBody>
          <Stack spacing={6}>
            <Box>
              <Heading size="md" mb={4}>Account Details</Heading>
              <VStack align="start" spacing={2}>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold">FractiTokens Balance</Text>
                  <Button
                    leftIcon={<FaCoins />}
                    colorScheme="teal"
                    onClick={() => router.push('/dashboard')}
                  >
                    <Text fontSize="lg" mb={2}>
                      {session?.user?.token_balance || 0} Tokens
                    </Text>
                  </Button>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold">Account Type</Text>
                  <Badge colorScheme="purple">Standard</Badge>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold">Member Since</Text>
                  <Text>2024</Text>
                </HStack>
              </VStack>
            </Box>

            <Box>
              <Heading size="md" mb={4}>Settings</Heading>
              <Button
                w="full"
                onClick={() => router.push('/settings')}
              >
                Manage Settings
              </Button>
            </Box>
          </Stack>
        </CardBody>
      </Card>
    </Container>
  )
} 