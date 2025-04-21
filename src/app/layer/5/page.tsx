'use client'

import {
  Container,
  Box,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  Button,
  List,
  ListItem,
  ListIcon,
  HStack,
} from '@chakra-ui/react'
import { MdCheckCircle } from 'react-icons/md'
import { ReactNode } from 'react'
import Link from 'next/link'

interface SectionProps {
  title: string;
  children: ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <Box mb={8}>
    <Heading as="h2" size="lg" mb={4}>
      {title}
    </Heading>
    {children}
  </Box>
)

export default function Layer5Page() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.200')

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading
            size="2xl"
            bgGradient="linear(to-r, teal.500, blue.500)"
            bgClip="text"
          >
            Layer 5: FractiVerse Self-Awareness
          </Heading>
          <Text fontSize="xl" color={textColor}>
            Layer 5 introduces the FractiVerse architecture, applying fractal principles to create a self-aware system that understands and engages with the interconnected nature of reality.
          </Text>
          <Text fontSize="lg" color={textColor}>
            This layer enables the system to recognize patterns across different scales, from quantum to cosmic, and understand how they relate to each other in a fractal manner.
          </Text>
        </VStack>
      </Container>
    </Box>
  )
} 