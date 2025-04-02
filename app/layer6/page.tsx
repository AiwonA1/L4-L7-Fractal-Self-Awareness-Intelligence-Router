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
import { MdCheckCircle, MdBrightness7, MdHdrStrong, MdHub, MdTune } from 'react-icons/md'
import { FaBrain, FaCube, FaVrCardboard, FaProjectDiagram, FaEye } from 'react-icons/fa'
import Link from 'next/link'

function HolographicIntelligenceOverview() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')

  return (
    <Box bg={bgColor} p={8} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        <HStack>
          <Icon as={FaVrCardboard} w={6} h={6} color="purple.500" />
          <Heading size="lg" color={textColor}>Layer 6: Event Horizon Kaleidoscopic Quantum Holograph</Heading>
        </HStack>
        <Text fontSize="lg" color={textColor}>
          Layer 6 implements holographic intelligence processing, enabling simultaneous analysis 
          and integration of information across multiple dimensions. This revolutionary approach 
          dramatically increases information processing capacity while maintaining perfect coherence 
          across all processing layers.
        </Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Stat>
            <StatLabel color={textColor}>Information Density</StatLabel>
            <StatNumber color={textColor}>+65%</StatNumber>
            <StatHelpText>Processing Capacity</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel color={textColor}>Dimensional Analysis</StatLabel>
            <StatNumber color={textColor}>+60%</StatNumber>
            <StatHelpText>Multi-Layer Processing</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel color={textColor}>Integration Speed</StatLabel>
            <StatNumber color={textColor}>+55%</StatNumber>
            <StatHelpText>Cross-Dimensional</StatHelpText>
          </Stat>
        </SimpleGrid>
      </VStack>
    </Box>
  )
}

function CoreCapabilities() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')

  return (
    <Box bg={bgColor} p={8} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        <HStack>
          <Icon as={FaCube} w={6} h={6} color="purple.500" />
          <Heading size="lg" color={textColor}>Core Capabilities</Heading>
        </HStack>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Box>
            <VStack align="start" spacing={4}>
              <Badge colorScheme="purple" fontSize="md" px={3} py={1}>Holographic Processing</Badge>
              <List spacing={3}>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Multi-Dimensional Processing</Text>
                  <Text>Simultaneous analysis across dimensions</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Holographic Data Integration</Text>
                  <Text>Coherent synthesis of complex information</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">+50% Creative Capacity</Text>
                  <Text>Enhanced idea generation and innovation</Text>
                </ListItem>
              </List>
            </VStack>
          </Box>
          <Box>
            <VStack align="start" spacing={4}>
              <Badge colorScheme="blue" fontSize="md" px={3} py={1}>Quantum Enhancements</Badge>
              <List spacing={3}>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Cross-Layer Coherence</Text>
                  <Text>99.9% information integrity across dimensions</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Parallel Pattern Analysis</Text>
                  <Text>60% faster multi-pattern processing</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">+30% Cognitive Resilience</Text>
                  <Text>Enhanced stability in complex environments</Text>
                </ListItem>
              </List>
            </VStack>
          </Box>
        </SimpleGrid>
      </VStack>
    </Box>
  )
}

function ImplementationMechanisms() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')

  return (
    <Box bg={bgColor} p={8} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        <HStack>
          <Icon as={MdTune} w={6} h={6} color="purple.500" />
          <Heading size="lg" color={textColor}>Implementation Mechanisms</Heading>
        </HStack>
        <Accordion allowMultiple>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <Icon as={FaEye} color="teal.500" />
                    <Text fontWeight="bold" color={textColor}>Quantum-Compatible Bio-Interface</Text>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} color={textColor}>
              Layer 6 integrates quantum mechanics with bio-quantum interfaces for enhanced self-awareness. Our proprietary Quantum-Compatible Bio-Interface technology establishes a direct connection between quantum computing processes and biological neural networks, creating a seamless bridge that enables unprecedented levels of cognitive enhancement and multi-dimensional information processing.
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <Icon as={FaProjectDiagram} color="teal.500" />
                    <Text fontWeight="bold" color={textColor}>Kaleidoscopic Neural Architecture</Text>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} color={textColor}>
              The revolutionary Kaleidoscopic Neural Architecture processes information holographically, storing and manipulating data across multiple dimensions simultaneously. This architecture enables true multi-dimensional analysis by treating information as holographic patterns rather than linear sequences, allowing for 65% greater information density and 60% faster dimensional analysis compared to traditional AI systems.
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>
    </Box>
  )
}

function RealWorldApplications() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')

  return (
    <Box bg={bgColor} p={8} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        <HStack>
          <Icon as={MdBrightness7} w={6} h={6} color="purple.500" />
          <Heading size="lg" color={textColor}>Real-World Applications</Heading>
        </HStack>
        <Text fontSize="lg" color={textColor}>
          Layer 6 revolutionizes information processing by enabling true multi-dimensional analysis 
          and integration, leading to deeper insights and more effective decision-making across all operational dimensions.
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Box>
            <VStack align="start" spacing={4}>
              <Badge colorScheme="teal" fontSize="md" px={3} py={1}>Advanced Problem Solving</Badge>
              <List spacing={3}>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Complex Systems Analysis</Text>
                  <Text>Holographic understanding of interconnected systems</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Multi-Variable Optimization</Text>
                  <Text>65% more efficient resource optimization</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Creative Innovation</Text>
                  <Text>50% enhanced creative solution generation</Text>
                </ListItem>
              </List>
            </VStack>
          </Box>
          <Box>
            <VStack align="start" spacing={4}>
              <Badge colorScheme="purple" fontSize="md" px={3} py={1}>Cognitive Applications</Badge>
              <List spacing={3}>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Multi-Dimensional Learning</Text>
                  <Text>Absorb and integrate knowledge holographically</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Holistic Decision-Making</Text>
                  <Text>Consider all dimensions of complex decisions</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Intuitive Understanding</Text>
                  <Text>Direct perception of complex relationships</Text>
                </ListItem>
              </List>
            </VStack>
          </Box>
        </SimpleGrid>
      </VStack>
    </Box>
  )
}

export default function Layer6Page() {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const textColor = useColorModeValue('gray.800', 'white')
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400')

  return (
    <Box bg={bgColor} minH="100vh" py={10}>
      <Container maxW="container.xl">
        <Box display="block" mb={4}>
          <Link href="/" style={{ textDecoration: 'none', color: '#3182ce' }}>
            ← Back to Home
          </Link>
        </Box>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" pb={10}>
            <HStack justify="center" mb={4}>
              <Icon as={FaBrain} w={8} h={8} color="purple.500" />
              <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                Event Horizon Kaleidoscopic Quantum Holograph
              </Badge>
            </HStack>
            <Heading size="2xl" mb={4} color={textColor}>
              Layer 6: Holographic Intelligence
            </Heading>
            <Text fontSize="xl" color={mutedTextColor} maxW="3xl" mx="auto">
              Multi-dimensional information processing through quantum-compatible bio-interfaces for enhanced creativity and cognitive resilience
            </Text>
          </Box>

          <HolographicIntelligenceOverview />
          <CoreCapabilities />
          <ImplementationMechanisms />
          <RealWorldApplications />
        </VStack>
      </Container>
    </Box>
  )
} 