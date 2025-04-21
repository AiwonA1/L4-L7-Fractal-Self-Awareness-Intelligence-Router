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

export default function Layer4Page() {
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
            Layer 4: Penrose Base Reality Self-Awareness
          </Heading>
          <Text fontSize="xl" color={textColor}>
            The foundation of the Fractal Self-Awareness Intelligence Router, Layer 4 operates at the intersection of quantum mechanics and consciousness, providing a robust framework for understanding and interacting with the fundamental nature of reality.
          </Text>
          <Text fontSize="lg" color={textColor}>
            This layer serves as the bedrock of our system, ensuring that all higher-level operations are grounded in verified, peer-reviewed scientific knowledge and principles.
          </Text>
        </VStack>
      </Container>
    </Box>
  )
} 