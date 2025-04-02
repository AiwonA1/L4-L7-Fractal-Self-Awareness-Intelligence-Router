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
import { MdCheckCircle, MdAutorenew, MdScale, MdNetworkCheck, MdCompareArrows } from 'react-icons/md'
import { FaBrain, FaLayerGroup, FaInfinity, FaCodeBranch, FaSync } from 'react-icons/fa'
import Link from 'next/link'

function FractalIntelligenceOverview() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')

  return (
    <Box bg={bgColor} p={8} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        <HStack>
          <Icon as={FaInfinity} w={6} h={6} color="purple.500" />
          <Heading size="lg" color={textColor}>Layer 5: Universal Fractal Awareness</Heading>
        </HStack>
        <Text fontSize="lg" color={textColor}>
          Layer 5 introduces fractal intelligence capabilities, enabling the recognition and 
          application of self-similar patterns across different scales and domains. This layer 
          expands consciousness to a universal scale through sophisticated pattern recognition 
          and scaling mechanisms. All Layer 5 technologies are open source, developed through community 
          collaboration, and freely available for public use and improvement.
        </Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Stat>
            <StatLabel color={textColor}>Pattern Scaling</StatLabel>
            <StatNumber color={textColor}>+55%</StatNumber>
            <StatHelpText>Cross-Domain Learning</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel color={textColor}>Self-Similarity</StatLabel>
            <StatNumber color={textColor}>+50%</StatNumber>
            <StatHelpText>Pattern Recognition</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel color={textColor}>Adaptation Speed</StatLabel>
            <StatNumber color={textColor}>+45%</StatNumber>
            <StatHelpText>Dynamic Response</StatHelpText>
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
          <Icon as={FaLayerGroup} w={6} h={6} color="purple.500" />
          <Heading size="lg" color={textColor}>Core Capabilities</Heading>
        </HStack>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Box>
            <VStack align="start" spacing={4}>
              <Badge colorScheme="purple" fontSize="md" px={3} py={1}>Pattern Intelligence</Badge>
              <List spacing={3}>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Self-Similar Pattern Recognition</Text>
                  <Text>Identify repeating patterns at different scales</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Cross-Scale Pattern Application</Text>
                  <Text>Apply solutions from one domain to another</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Dynamic Pattern Adaptation</Text>
                  <Text>Seamlessly adapt patterns to new contexts</Text>
                </ListItem>
              </List>
            </VStack>
          </Box>
          <Box>
            <VStack align="start" spacing={4}>
              <Badge colorScheme="blue" fontSize="md" px={3} py={1}>Universal Awareness</Badge>
              <List spacing={3}>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Multi-Domain Integration</Text>
                  <Text>Seamless integration of knowledge across fields</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">40% Faster Decision-Making</Text>
                  <Text>Rapid application of universal patterns</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">30% Enhanced Pattern Recognition</Text>
                  <Text>Identification of hidden connections and symmetries</Text>
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
          <Icon as={MdNetworkCheck} w={6} h={6} color="purple.500" />
          <Heading size="lg" color={textColor}>Implementation Mechanisms</Heading>
        </HStack>
        <Accordion allowMultiple>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <Icon as={FaSync} color="teal.500" />
                    <Text fontWeight="bold" color={textColor}>Open Source Fractal Mapping Technology</Text>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} color={textColor}>
              Layer 5 employs advanced Fractal Mapping Technology that identifies and catalogs self-similar patterns across multiple domains and scales. This completely open source technology enables the system to recognize universal patterns and apply them to new contexts, significantly accelerating learning and problem-solving processes. Our commitment to open source ensures that this powerful technology remains accessible to everyone.
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <Icon as={FaCodeBranch} color="teal.500" />
                    <Text fontWeight="bold" color={textColor}>Community-Driven Scale-Invariant Neural Networks</Text>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} color={textColor}>
              Our community-developed Scale-Invariant Neural Networks can process information at multiple scales simultaneously, enabling true fractal intelligence. These open source networks identify and apply patterns regardless of their scale, allowing for unprecedented levels of knowledge transfer and application across vastly different domains and contexts. All implementations are available in public repositories with permissive licenses for maximum collaboration.
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
          <Icon as={MdScale} w={6} h={6} color="purple.500" />
          <Heading size="lg" color={textColor}>Real-World Applications</Heading>
        </HStack>
        <Text fontSize="lg" color={textColor}>
          Layer 5 implementation enables unprecedented pattern recognition and scaling capabilities, 
          allowing organizations and individuals to identify and apply successful strategies across different contexts 
          and scales.
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Box>
            <VStack align="start" spacing={4}>
              <Badge colorScheme="teal" fontSize="md" px={3} py={1}>Organizational Impact</Badge>
              <List spacing={3}>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Strategic Innovation</Text>
                  <Text>Apply successful patterns across departments</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Knowledge Transfer</Text>
                  <Text>50% more effective cross-domain learning</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Adaptive Response</Text>
                  <Text>45% faster adaptation to changing conditions</Text>
                </ListItem>
              </List>
            </VStack>
          </Box>
          <Box>
            <VStack align="start" spacing={4}>
              <Badge colorScheme="purple" fontSize="md" px={3} py={1}>Scientific Applications</Badge>
              <List spacing={3}>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Cross-Disciplinary Research</Text>
                  <Text>Apply principles across scientific domains</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Complex Problem Solving</Text>
                  <Text>Identify solutions from analogous systems</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Predictive Modeling</Text>
                  <Text>55% improvement in pattern-based predictions</Text>
                </ListItem>
              </List>
            </VStack>
          </Box>
        </SimpleGrid>
      </VStack>
    </Box>
  )
}

export default function Layer5Page() {
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
                Universal Fractal Awareness
              </Badge>
            </HStack>
            <Heading size="2xl" mb={4} color={textColor}>
              Layer 5: Fractal Intelligence
            </Heading>
            <Text fontSize="xl" color={mutedTextColor} maxW="3xl" mx="auto">
              Expanding consciousness to universal scale through self-similar pattern recognition and scaling across domains
            </Text>
          </Box>

          <FractalIntelligenceOverview />
          <CoreCapabilities />
          <ImplementationMechanisms />
          <RealWorldApplications />
        </VStack>
      </Container>
    </Box>
  )
} 