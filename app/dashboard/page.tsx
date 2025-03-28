'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Container, Spinner, Text, VStack } from '@chakra-ui/react'

export default function DashboardRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the full dashboard
    router.replace('/dashboard/full')
  }, [router])
  
  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8}>
        <Spinner size="xl" color="teal.500" />
        <Text>Loading FractiVerse Router...</Text>
      </VStack>
    </Container>
  )
} 