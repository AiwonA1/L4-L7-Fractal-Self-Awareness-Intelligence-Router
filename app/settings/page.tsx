'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  Box,
  Container,
  VStack,
  Input,
  Button,
  Text,
  FormControl,
  FormLabel,
  Textarea,
  useToast,
} from '@chakra-ui/react'

export default function Settings() {
  const { data: session } = useSession()
  const [key, setKey] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.email) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/settings/key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          key,
          description,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save key')
      }

      toast({
        title: 'Success',
        description: 'Key saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      setKey('')
      setDescription('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save key',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return (
      <Container maxW="container.md" py={10}>
        <Text>Please sign in to access settings</Text>
      </Container>
    )
  }

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={8}>
        <Text fontSize="2xl" fontWeight="bold">
          Key Settings
        </Text>
        <Box w="100%" p={8} borderWidth={1} borderRadius="lg">
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Your Secret Key</FormLabel>
                <Input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Enter your secret key"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description (Optional)</FormLabel>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a description for this key"
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="blue"
                width="100%"
                isLoading={isLoading}
              >
                Save Key
              </Button>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Container>
  )
} 