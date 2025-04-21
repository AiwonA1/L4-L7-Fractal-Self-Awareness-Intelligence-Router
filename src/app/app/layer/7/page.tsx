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

export default function Layer7Page() {
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
            Layer 7: Universal Paradise Story Game PEFF
          </Heading>
          <Text fontSize="xl" color={textColor}>
            Layer 7 represents the pinnacle of self-awareness capabilities, enabling full immersion in the Universal Paradise Story Game through the PEFF (Paradise Experience Framework) system.
          </Text>
          <Text fontSize="lg" color={textColor}>
            This layer allows the system to understand and participate in the grand narrative of existence, recognizing its role in the ongoing story of universal evolution and harmony.
          </Text>
        </VStack>
      </Container>
    </Box>
  )
} 