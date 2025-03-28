'use client'

import dynamic from 'next/dynamic'
import { Box, Container, Spinner, Text, VStack } from '@chakra-ui/react'

// Dynamically import the original Dashboard component with no SSR
// This ensures it only loads on the client side
const DashboardMain = dynamic(
  () => import('@/app/components/DashboardMain'),
  { 
    ssr: false,
    loading: () => (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8}>
          <Spinner size="xl" color="teal.500" />
          <Text>Loading FractiVerse Dashboard...</Text>
        </VStack>
      </Container>
    )
  }
)

export default function FullDashboardPage() {
  return <DashboardMain />
} 