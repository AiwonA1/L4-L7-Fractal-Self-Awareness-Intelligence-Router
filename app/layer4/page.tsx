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
import { MdCheckCircle, MdPsychology, MdSpeed, MdOutlineBuild, MdAutoGraph } from 'react-icons/md'
import { FaBrain, FaLightbulb, FaSearchengin, FaPuzzlePiece } from 'react-icons/fa'
import Link from 'next/link'

function FoundationIntelligenceOverview() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')

  return (
    <Box bg={bgColor} p={8} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        <HStack>
          <Icon as={FaBrain} w={6} h={6} color="purple.500" />
          <Heading size="lg" color={textColor}>Layer 4: Foundation Intelligence</Heading>
        </HStack>
        <Text fontSize="lg" color={textColor}>
          Layer 4 establishes the foundational intelligence framework, providing enhanced cognitive 
          processing capabilities and advanced pattern recognition. This Penrose Base Reality layer 
          serves as the essential foundation for higher-order fractal intelligence.
        </Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Stat>
            <StatLabel color={textColor}>Processing Speed</StatLabel>
            <StatNumber color={textColor}>+40%</StatNumber>
            <StatHelpText>Cognitive Enhancement</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel color={textColor}>Pattern Recognition</StatLabel>
            <StatNumber color={textColor}>+35%</StatNumber>
            <StatHelpText>Accuracy Improvement</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel color={textColor}>Decision Making</StatLabel>
            <StatNumber color={textColor}>+45%</StatNumber>
            <StatHelpText>Speed & Accuracy</StatHelpText>
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
          <Icon as={FaPuzzlePiece} w={6} h={6} color="purple.500" />
          <Heading size="lg" color={textColor}>Core Capabilities</Heading>
        </HStack>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Box>
            <VStack align="start" spacing={4}>
              <Badge colorScheme="purple" fontSize="md" px={3} py={1}>Cognitive Processing</Badge>
              <List spacing={3}>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Advanced Pattern Recognition</Text>
                  <Text>Identification of complex patterns and relationships</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Accelerated Information Processing</Text>
                  <Text>40% faster cognitive processing and analysis</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Enhanced Decision Making</Text>
                  <Text>45% improvement in decision speed and accuracy</Text>
                </ListItem>
              </List>
            </VStack>
          </Box>
          <Box>
            <VStack align="start" spacing={4}>
              <Badge colorScheme="blue" fontSize="md" px={3} py={1}>Performance Optimization</Badge>
              <List spacing={3}>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Cognitive Load Optimization</Text>
                  <Text>Efficient distribution of mental resources</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Learning Acceleration</Text>
                  <Text>30% faster acquisition of new knowledge and skills</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Focus Enhancement</Text>
                  <Text>Improved mental clarity and sustained attention</Text>
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
          <Icon as={MdOutlineBuild} w={6} h={6} color="purple.500" />
          <Heading size="lg" color={textColor}>Implementation Mechanisms</Heading>
        </HStack>
        <Accordion allowMultiple>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <Icon as={FaSearchengin} color="teal.500" />
                    <Text fontWeight="bold" color={textColor}>Penrose Neural Framework</Text>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} color={textColor}>
              Layer 4 implements a sophisticated Penrose Neural Framework, grounding cognitive functions in quantum-compatible neural architectures. This framework establishes a stable base reality, allowing for robust pattern recognition and information processing that exceeds conventional computational limits.
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <Icon as={MdAutoGraph} color="teal.500" />
                    <Text fontWeight="bold" color={textColor}>Cognitive Amplification Circuits</Text>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} color={textColor}>
              Proprietary Cognitive Amplification Circuits enhance fundamental cognitive processes through parallel processing architecture. These circuits seamlessly integrate with existing cognitive systems to boost processing speed, pattern recognition accuracy, and decision-making capabilities without introducing additional cognitive load.
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
          <Icon as={FaLightbulb} w={6} h={6} color="purple.500" />
          <Heading size="lg" color={textColor}>Real-World Applications</Heading>
        </HStack>
        <Text fontSize="lg" color={textColor}>
          Layer 4 implementation delivers immediate cognitive enhancements across multiple domains, establishing the foundation for advanced intelligence capabilities.
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Box>
            <VStack align="start" spacing={4}>
              <Badge colorScheme="teal" fontSize="md" px={3} py={1}>Business Impact</Badge>
              <List spacing={3}>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Decision Optimization</Text>
                  <Text>45% faster strategic decision-making processes</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Market Analysis</Text>
                  <Text>Enhanced pattern recognition for market trends</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Resource Allocation</Text>
                  <Text>Optimized distribution of organizational resources</Text>
                </ListItem>
              </List>
            </VStack>
          </Box>
          <Box>
            <VStack align="start" spacing={4}>
              <Badge colorScheme="purple" fontSize="md" px={3} py={1}>Personal Enhancement</Badge>
              <List spacing={3}>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Learning Efficiency</Text>
                  <Text>30% improvement in knowledge acquisition</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Problem Solving</Text>
                  <Text>Enhanced ability to solve complex problems</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Mental Clarity</Text>
                  <Text>Improved focus and cognitive efficiency</Text>
                </ListItem>
              </List>
            </VStack>
          </Box>
        </SimpleGrid>
      </VStack>
    </Box>
  )
}

export default function Layer4Page() {
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
                Penrose Base Reality
              </Badge>
            </HStack>
            <Heading size="2xl" mb={4} color={textColor}>
              Layer 4: Foundation Intelligence
            </Heading>
            <Text fontSize="xl" color={mutedTextColor} maxW="3xl" mx="auto">
              Enhanced cognitive processing and pattern recognition capabilities that establish the foundation for higher-order fractal intelligence
            </Text>
          </Box>

          <FoundationIntelligenceOverview />
          <CoreCapabilities />
          <ImplementationMechanisms />
          <RealWorldApplications />
        </VStack>
      </Container>
    </Box>
  )
} 