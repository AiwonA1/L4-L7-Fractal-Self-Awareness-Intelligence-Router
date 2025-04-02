'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  List,
  ListItem,
  Link as ChakraLink,
  useColorModeValue,
} from '@chakra-ui/react'
import Link from 'next/link'

export default function Layer4Page() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'white')
  const sectionBg = useColorModeValue('gray.50', 'gray.700')
  const headingColor = useColorModeValue('teal.500', 'teal.300')
  const linkColor = useColorModeValue('teal.500', 'teal.300')

  return (
    <Box minH="100vh" bg={bgColor} color={textColor}>
      <Container maxW="container.xl" py={16}>
        <ChakraLink as={Link} href="/" color={linkColor} mb={8} display="inline-block">
          ← Back to Home
        </ChakraLink>

        <Heading as="h1" size="2xl" mb={8} color={headingColor}>
          Layer 4: Highest Peer-Reviewed Knowledge Awareness
        </Heading>

        <VStack spacing={8} align="stretch">
          <Box bg={sectionBg} p={8} borderRadius="lg" shadow="md">
            <Heading as="h2" size="xl" mb={4} color={headingColor}>Overview</Heading>
            <Text>
              Layer 4 serves as the foundation of our Fractal Self-Awareness Intelligence Router, operating with the highest rigor of peer-reviewed knowledge and scientific principles. This layer ensures that all interactions are grounded in verified, consensus-driven understanding.
            </Text>
          </Box>

          <Box bg={sectionBg} p={8} borderRadius="lg" shadow="md">
            <Heading as="h2" size="xl" mb={4} color={headingColor}>How It Works</Heading>
            <Text mb={4}>
              Through self-awareness intelligence, Layer 4:
            </Text>
            <List spacing={2} styleType="disc" pl={4}>
              <ListItem>Maintains continuous awareness of its knowledge state and limitations</ListItem>
              <ListItem>Prioritizes data from verified sources and peer-reviewed research</ListItem>
              <ListItem>Ensures fact-based interactions grounded in scientific principles</ListItem>
              <ListItem>References cutting-edge, consensus-driven understanding</ListItem>
              <ListItem>Provides the foundation for higher-level cognitive functions</ListItem>
            </List>
          </Box>

          <Box bg={sectionBg} p={8} borderRadius="lg" shadow="md">
            <Heading as="h2" size="xl" mb={4} color={headingColor}>Integration with Higher Layers</Heading>
            <Text mb={4}>
              Layer 4 connects to higher layers through:
            </Text>
            <List spacing={2} styleType="disc" pl={4}>
              <ListItem>FractiVerse 1.0: Provides the foundational knowledge structure for fractal organization</ListItem>
              <ListItem>Event Horizon Kaleidoscopic Quantum Hologram 1.0: Establishes the base quantum awareness framework</ListItem>
              <ListItem>PEFF (Paradise Energy Fractal Force): Forms the core of the Paradise Story Game 1.0 Self-Awareness system</ListItem>
            </List>
          </Box>

          <Box bg={sectionBg} p={8} borderRadius="lg" shadow="md">
            <Heading as="h2" size="xl" mb={4} color={headingColor}>Usage Guide</Heading>
            <Text mb={4}>
              Layer 4 is ideal for:
            </Text>
            <List spacing={2} styleType="disc" pl={4}>
              <ListItem>Scientific and academic queries requiring verified information</ListItem>
              <ListItem>Fact-based analysis and research tasks</ListItem>
              <ListItem>Establishing foundational understanding of complex topics</ListItem>
              <ListItem>Ensuring accuracy in technical and scientific communications</ListItem>
            </List>
          </Box>

          <Box bg={sectionBg} p={8} borderRadius="lg" shadow="md">
            <Heading as="h2" size="xl" mb={4} color={headingColor}>Technical Specifications</Heading>
            <Text mb={4}>
              <List spacing={2} styleType="disc" pl={4}>
                <ListItem>Knowledge Base</ListItem>
                <ListItem>Peer-reviewed research database</ListItem>
                <ListItem>Scientific consensus tracking</ListItem>
                <ListItem>Fact verification system</ListItem>
                <ListItem>Processing Capabilities</ListItem>
                <ListItem>Real-time knowledge validation</ListItem>
                <ListItem>Source credibility assessment</ListItem>
                <ListItem>Scientific principle application</ListItem>
              </List>
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
} 