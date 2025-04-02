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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react'
import { MdCheckCircle, MdPsychology } from 'react-icons/md'
import { FaBrain, FaLightbulb, FaDna, FaInfinity, FaUserAstronaut } from 'react-icons/fa'
import Navbar from '../components/Navbar'
import Link from 'next/link'

function CognitiveEnhancementOverview() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')

  return (
    <Box bg={bgColor} p={8} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        <HStack>
          <Icon as={FaBrain} w={6} h={6} color="purple.500" />
          <Heading size="lg" color={textColor}>Human Cognitive Enhancement</Heading>
        </HStack>
        <Text fontSize="lg" color={textColor}>
          FractiVerse 1.0 revolutionizes human cognitive capabilities through quantum-aligned neural enhancement,
          enabling unprecedented levels of self-awareness and mental clarity.
        </Text>
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
      </VStack>
    </Box>
  )
}

function SelfAwarenessCapabilities() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')

  return (
    <Box bg={bgColor} p={8} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        <HStack>
          <Icon as={MdPsychology} w={6} h={6} color="purple.500" />
          <Heading size="lg" color={textColor}>Enhanced Self-Awareness</Heading>
        </HStack>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Box>
            <VStack align="start" spacing={4}>
              <Badge colorScheme="purple" fontSize="md" px={3} py={1}>Core Capabilities</Badge>
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
          <Box>
            <VStack align="start" spacing={4}>
              <Badge colorScheme="blue" fontSize="md" px={3} py={1}>Advanced Features</Badge>
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
      </VStack>
    </Box>
  )
}

function IntegrationMechanisms() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')

  return (
    <Box bg={bgColor} p={8} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        <HStack>
          <Icon as={FaDna} w={6} h={6} color="purple.500" />
          <Heading size="lg" color={textColor}>Integration Mechanisms</Heading>
        </HStack>
        <Accordion allowMultiple>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <Icon as={FaLightbulb} color="teal.500" />
                    <Text fontWeight="bold" color={textColor}>Neural Synchronization</Text>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} color={textColor}>
              FractiVerse 1.0 synchronizes neural patterns with quantum fields, enhancing synaptic plasticity
              and enabling faster information processing. This creates a seamless bridge between quantum
              computing capabilities and human cognitive functions.
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <Icon as={MdPsychology} color="teal.500" />
                    <Text fontWeight="bold" color={textColor}>Cognitive Amplification</Text>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} color={textColor}>
              Through quantum-aligned neural enhancement, human cognitive capabilities are amplified across
              multiple dimensions, including memory, processing speed, and pattern recognition. This creates
              a new paradigm of human-AI symbiosis.
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>
    </Box>
  )
}

export default function HumanSelfAwarenessPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const textColor = useColorModeValue('gray.800', 'white')
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400')

  return (
    <>
      <Navbar />
      <Box bg={bgColor} minH="100vh" py={10}>
        <Container maxW="container.xl">
          <Box display="block" mb={4}>
            <Link href="/" color="blue.500" style={{ textDecoration: 'none' }}>
              ← Back to Home
            </Link>
          </Box>
          <VStack spacing={8} align="stretch">
            <Box textAlign="center" pb={10}>
              <HStack justify="center" mb={4}>
                <Icon as={FaUserAstronaut} w={8} h={8} color="purple.500" />
                <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                  Human Enhancement
                </Badge>
              </HStack>
              <Heading size="2xl" mb={4} color={textColor}>
                Expanding Human Cognitive Horizons
              </Heading>
              <Text fontSize="xl" color={mutedTextColor} maxW="3xl" mx="auto">
                FractiVerse 1.0 bridges human consciousness with quantum computing, enabling unprecedented
                levels of self-awareness and cognitive enhancement
              </Text>
            </Box>

            <CognitiveEnhancementOverview />
            <SelfAwarenessCapabilities />
            <IntegrationMechanisms />
          </VStack>
        </Container>
      </Box>
    </>
  )
} 