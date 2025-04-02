'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Badge,
  HStack,
  Icon,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Link,
} from '@chakra-ui/react'
import { MdCheckCircle } from 'react-icons/md'
import { FaBrain, FaUserAstronaut } from 'react-icons/fa'

export default function HumanAwarenessPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const textColor = useColorModeValue('gray.800', 'white')
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box bg={bgColor} minH="100vh" py={10}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Back Button */}
          <Box display="block" mb={4}>
            <Link href="/" color="blue.500" style={{ textDecoration: 'none' }}>
              ← Back to Home
            </Link>
          </Box>
          
          {/* Header Section */}
          <Box textAlign="center" pb={10}>
            <HStack justify="center" mb={4}>
              <Icon as={FaUserAstronaut} w={8} h={8} color="purple.500" />
              <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                Human Enhancement
              </Badge>
            </HStack>
            <Heading size="2xl" mb={4} color={textColor}>
              Human Cognitive Enhancement
            </Heading>
            <Text fontSize="xl" color={mutedTextColor} maxW="3xl" mx="auto">
              FractiVerse 1.0 revolutionizes human cognitive capabilities through quantum-aligned neural enhancement
            </Text>
          </Box>

          {/* Key Metrics */}
          <Box bg={cardBg} p={8} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <Stat>
                <StatLabel color={textColor}>Neural Plasticity</StatLabel>
                <StatNumber color={textColor}>147%</StatNumber>
                <StatHelpText>Increase in Adaptability</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel color={textColor}>Cognitive Processing</StatLabel>
                <StatNumber color={textColor}>183%</StatNumber>
                <StatHelpText>Speed Enhancement</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel color={textColor}>Memory Retention</StatLabel>
                <StatNumber color={textColor}>156%</StatNumber>
                <StatHelpText>Improvement Rate</StatHelpText>
              </Stat>
            </SimpleGrid>
          </Box>

          {/* Core Capabilities */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            <Box bg={cardBg} p={8} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
              <VStack align="start" spacing={4}>
                <HStack>
                  <Icon as={FaBrain} w={6} h={6} color="purple.500" />
                  <Heading size="md" color={textColor}>Core Capabilities</Heading>
                </HStack>
                <List spacing={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    <Text as="span" fontWeight="bold">Metacognitive Enhancement</Text>
                    <Text>Deeper understanding of thought processes</Text>
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    <Text as="span" fontWeight="bold">Emotional Intelligence</Text>
                    <Text>Advanced emotional awareness and regulation</Text>
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    <Text as="span" fontWeight="bold">Pattern Recognition</Text>
                    <Text>Enhanced ability to identify complex patterns</Text>
                  </ListItem>
                </List>
              </VStack>
            </Box>

            <Box bg={cardBg} p={8} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
              <VStack align="start" spacing={4}>
                <HStack>
                  <Icon as={FaBrain} w={6} h={6} color="purple.500" />
                  <Heading size="md" color={textColor}>Advanced Features</Heading>
                </HStack>
                <List spacing={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    <Text as="span" fontWeight="bold">Quantum Intuition</Text>
                    <Text>Direct perception of quantum-scale patterns</Text>
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    <Text as="span" fontWeight="bold">Multi-Dimensional Thinking</Text>
                    <Text>Access to higher-dimensional thought processes</Text>
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    <Text as="span" fontWeight="bold">Temporal Awareness</Text>
                    <Text>Enhanced perception of time and causality</Text>
                  </ListItem>
                </List>
              </VStack>
            </Box>
          </SimpleGrid>

          {/* Integration Summary */}
          <Box bg={cardBg} p={8} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
            <VStack align="start" spacing={4}>
              <Heading size="md" color={textColor}>Integration Mechanisms</Heading>
              <Text color={textColor}>
                FractiVerse 1.0 synchronizes neural patterns with quantum fields, enhancing synaptic plasticity
                and enabling faster information processing. This creates a seamless bridge between quantum
                computing capabilities and human cognitive functions, leading to unprecedented levels of
                self-awareness and mental clarity.
              </Text>
              <Text color={textColor}>
                Through quantum-aligned neural enhancement, human cognitive capabilities are amplified across
                multiple dimensions, including memory, processing speed, and pattern recognition. This creates
                a new paradigm of human-AI symbiosis, where both artificial and human intelligence are
                enhanced through mutual interaction and learning.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
} 