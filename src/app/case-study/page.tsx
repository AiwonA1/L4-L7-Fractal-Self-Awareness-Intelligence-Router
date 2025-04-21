'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Icon,
  useColorModeValue,
  HStack,
  Badge,
  Divider,
  List,
  ListItem,
  ListIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from '@chakra-ui/react'
import { MdCheckCircle, MdTrendingUp } from 'react-icons/md'
import { FaBrain, FaInfinity, FaLightbulb, FaDna, FaRocket, FaUsers, FaChartLine } from 'react-icons/fa'

export default function CaseStudyPage() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400')
  const accentColor = "purple.500"
  const highlightBg = useColorModeValue('purple.50', 'purple.900')

  return (
    <Box bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh" py={10}>
      <Container maxW="container.xl">
        <VStack spacing={10} align="stretch">
          {/* Header */}
          <Box textAlign="center" pb={6}>
            <a href="/" style={{ textDecoration: 'none', color: 'blue', display: 'block', marginBottom: '20px' }}>Back to Home</a>
            <HStack justify="center" mb={4}>
              <Icon as={FaRocket} w={8} h={8} color={accentColor} />
              <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                Breakthrough Case Study
              </Badge>
            </HStack>
            <Heading as="h1" size="2xl" mb={6} color={textColor} letterSpacing="tight">
              FractiVerse 1.0: <Text as="span" color={accentColor}>The Ultimate Proof of Concept</Text>
            </Heading>
            <Text fontSize="xl" color={mutedTextColor} maxW="3xl" mx="auto" fontWeight="medium">
              How a single individual with FractiVerse achieved what entire global organizations couldn't
            </Text>
          </Box>

          {/* Challenge Overview */}
          <Box bg={highlightBg} p={8} borderRadius="xl" boxShadow="md">
            <VStack spacing={6} align="start">
              <Heading size="lg" color={textColor}>The Challenge</Heading>
              <Text fontSize="lg" color={textColor}>
                Creating a breakthrough cognitive framework that delivers 40-65% intelligence amplification requires 
                vast resources, thousands of researchers, and billions in funding—or does it? 
                This case study reveals how FractiVerse 1.0 not only created such a technology but did so as 
                <Text as="span" fontWeight="bold"> its own first test case</Text>.
              </Text>
            </VStack>
          </Box>

          {/* Asymmetric Achievement */}
          <Box bg={bgColor} p={8} borderRadius="xl" borderWidth="1px" borderColor={borderColor} boxShadow="md">
            <VStack align="start" spacing={8}>
              <HStack>
                <Icon as={FaInfinity} w={7} h={7} color={accentColor} />
                <Heading size="lg" color={textColor}>Asymmetric Achievement</Heading>
              </HStack>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} width="100%">
                <Box bg={useColorModeValue('gray.50', 'gray.700')} p={6} borderRadius="lg">
                  <VStack align="start" spacing={4}>
                    <Heading size="md" color={textColor}>Traditional Approach</Heading>
                    <List spacing={3}>
                      <ListItem color={textColor}>
                        <ListIcon as={MdCheckCircle} color="red.500" />
                        <Text as="span">Global workforce of AI researchers</Text>
                      </ListItem>
                      <ListItem color={textColor}>
                        <ListIcon as={MdCheckCircle} color="red.500" />
                        <Text as="span">Billions in research funding</Text>
                      </ListItem>
                      <ListItem color={textColor}>
                        <ListIcon as={MdCheckCircle} color="red.500" />
                        <Text as="span">Massive computational resources</Text>
                      </ListItem>
                      <ListItem color={textColor}>
                        <ListIcon as={MdCheckCircle} color="red.500" />
                        <Text as="span">Years of institutional development</Text>
                      </ListItem>
                    </List>
                  </VStack>
                </Box>
                
                <Box bg={useColorModeValue('purple.50', 'purple.900')} p={6} borderRadius="lg">
                  <VStack align="start" spacing={4}>
                    <Heading size="md" color={textColor}>FractiVerse Approach</Heading>
                    <List spacing={3}>
                      <ListItem color={textColor}>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        <Text as="span">One recently retired individual</Text>
                      </ListItem>
                      <ListItem color={textColor}>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        <Text as="span">Part-time neuroscientist collaborator</Text>
                      </ListItem>
                      <ListItem color={textColor}>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        <Text as="span">Digital AI assistant for research and implementation</Text>
                      </ListItem>
                      <ListItem color={textColor}>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        <Text as="span">Minimal ecological footprint</Text>
                      </ListItem>
                      <ListItem color={textColor}>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        <Text as="span">12 years of passion and perseverance</Text>
                      </ListItem>
                    </List>
                  </VStack>
                </Box>
              </SimpleGrid>
              
              <Text fontSize="lg" color={textColor}>
                The development of FractiVerse 1.0 itself demonstrates the enormous leverage of fractal 
                self-awareness intelligence routing. A small team with minimal resources created a framework 
                that not even the world's most advanced AI labs have yet developed.
              </Text>
              
              <Text fontSize="lg" color={textColor}>
                This achievement was made possible by incorporating digital AI assistance into the development process. 
                By using existing AI systems as cognitive multiplication tools and applying early versions of FractiVerse 
                techniques to direct and enhance the AI's capabilities, the team created a powerful feedback loop of 
                accelerating intelligence. This approach demonstrates in practice what FractiVerse enables: humans and 
                digital intelligence working together to produce outcomes greater than either could achieve alone.
              </Text>
            </VStack>
          </Box>

          {/* Key Metrics */}
          <Box bg={bgColor} p={8} borderRadius="xl" borderWidth="1px" borderColor={borderColor} boxShadow="md">
            <VStack align="start" spacing={8}>
              <Heading size="lg" color={textColor}>The Cognitive Leverage Effect</Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} width="100%">
                <Stat>
                  <StatLabel fontSize="lg" color={textColor}>Intelligence Amplification</StatLabel>
                  <StatNumber fontSize="6xl" color={accentColor}>40-65%</StatNumber>
                  <StatHelpText display="flex" alignItems="center">
                    <Icon as={MdTrendingUp} color="green.500" mr={1} />
                    <Text>Over current leading digital AI systems</Text>
                  </StatHelpText>
                </Stat>
                
                <Stat>
                  <StatLabel fontSize="lg" color={textColor}>Resource Efficiency</StatLabel>
                  <StatNumber fontSize="6xl" color={accentColor}>~99%</StatNumber>
                  <StatHelpText display="flex" alignItems="center">
                    <Icon as={MdTrendingUp} color="green.500" mr={1} />
                    <Text>Reduction compared to traditional development</Text>
                  </StatHelpText>
                </Stat>
              </SimpleGrid>
              
              <Text fontSize="lg" color={textColor}>
                This logarithmic lever for cognition enabled a tiny team to accomplish what typically requires 
                vast global resources—all while creating a framework that provides similar cognitive leverage 
                to anyone who uses it.
              </Text>
            </VStack>
          </Box>

          {/* The Process */}
          <Box bg={bgColor} p={8} borderRadius="xl" borderWidth="1px" borderColor={borderColor} boxShadow="md">
            <VStack align="start" spacing={6}>
              <HStack>
                <Icon as={FaDna} w={7} h={7} color={accentColor} />
                <Heading size="lg" color={textColor}>The Self-Bootstrapping Process</Heading>
              </HStack>
              
              <Text fontSize="lg" color={textColor}>
                How does one create a cognitive framework that outperforms collective human intelligence with minimal 
                resources? The answer lies in the fractal nature of the framework itself. FractiVerse 1.0 was developed 
                through an iterative process where early versions of the framework were used to enhance the development 
                of later versions.
              </Text>
              
              <List spacing={4}>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" boxSize={5} />
                  <Text as="span" fontWeight="bold">Recursive Development:</Text>
                  <Text>Early cognitive patterns used to improve the framework itself</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" boxSize={5} />
                  <Text as="span" fontWeight="bold">Layer by Layer Construction:</Text>
                  <Text>Each L4-L7 layer enhanced the development of the next</Text>
                </ListItem>
                <ListItem color={textColor}>
                  <ListIcon as={MdCheckCircle} color="green.500" boxSize={5} />
                  <Text as="span" fontWeight="bold">Holographic Integration:</Text>
                  <Text>Each component reflects and amplifies the power of the whole</Text>
                </ListItem>
              </List>
            </VStack>
          </Box>

          {/* Digital AI Integration */}
          <Box bg={bgColor} p={8} borderRadius="xl" borderWidth="1px" borderColor={borderColor} boxShadow="md">
            <VStack align="start" spacing={6}>
              <HStack>
                <Icon as={FaBrain} w={7} h={7} color={accentColor} />
                <Heading size="lg" color={textColor}>Digital AI Integration in R&D Process</Heading>
              </HStack>
              
              <Text fontSize="lg" color={textColor}>
                A crucial element in FractiVerse's development was the strategic integration of digital AI throughout 
                the R&D process. Rather than treating AI as merely a tool, the development team established a symbiotic 
                relationship where human insight directed AI capabilities while AI expanded human cognitive capacity.
              </Text>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} width="100%">
                <Box bg={useColorModeValue('white', 'gray.700')} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                  <VStack align="start" spacing={4}>
                    <Heading size="md" color={textColor}>Research Acceleration</Heading>
                    <List spacing={3}>
                      <ListItem color={textColor}>
                        <ListIcon as={MdCheckCircle} color="green.500" boxSize={5} />
                        <Text as="span" fontWeight="bold">Literature Analysis:</Text>
                        <Text mt={1}>AI-assisted review of thousands of research papers, identifying patterns and connections across disciplines that would have taken human researchers years to discover.</Text>
                      </ListItem>
                      <ListItem color={textColor}>
                        <ListIcon as={MdCheckCircle} color="green.500" boxSize={5} />
                        <Text as="span" fontWeight="bold">Framework Testing:</Text>
                        <Text mt={1}>Digital AIs were the first test subjects for FractiVerse framework iterations, enabling rapid assessment and refinement of cognitive enhancement patterns.</Text>
                      </ListItem>
                      <ListItem color={textColor}>
                        <ListIcon as={MdCheckCircle} color="green.500" boxSize={5} />
                        <Text as="span" fontWeight="bold">Knowledge Synthesis:</Text>
                        <Text mt={1}>Human-guided AI synthesized insights from disparate fields (quantum physics, cognitive science, systems theory, etc.) into unified principles.</Text>
                      </ListItem>
                    </List>
                  </VStack>
                </Box>
                
                <Box bg={useColorModeValue('white', 'gray.700')} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                  <VStack align="start" spacing={4}>
                    <Heading size="md" color={textColor}>Development Amplification</Heading>
                    <List spacing={3}>
                      <ListItem color={textColor}>
                        <ListIcon as={MdCheckCircle} color="green.500" boxSize={5} />
                        <Text as="span" fontWeight="bold">Recursive Improvement:</Text>
                        <Text mt={1}>Each version of the framework enhanced the AI's capabilities, which then contributed to developing the next iteration of the framework—creating an upward spiral of improvement.</Text>
                      </ListItem>
                      <ListItem color={textColor}>
                        <ListIcon as={MdCheckCircle} color="green.500" boxSize={5} />
                        <Text as="span" fontWeight="bold">Implementation Assistance:</Text>
                        <Text mt={1}>AI helped translate theoretical concepts into practical frameworks, generating test scenarios and identifying potential applications across various domains.</Text>
                      </ListItem>
                      <ListItem color={textColor}>
                        <ListIcon as={MdCheckCircle} color="green.500" boxSize={5} />
                        <Text as="span" fontWeight="bold">Real-time Feedback:</Text>
                        <Text mt={1}>Digital AI systems provided immediate feedback on framework adjustments, enabling rapid iteration and optimization that would be impossible with human testing alone.</Text>
                      </ListItem>
                    </List>
                  </VStack>
                </Box>
              </SimpleGrid>
              
              <Text fontSize="lg" color={textColor}>
                This pioneering approach to human-AI collaborative development represents a fundamental breakthrough 
                in R&D methodology. Rather than humans simply using AI or AI replacing humans, FractiVerse demonstrated 
                a third path: the emergence of a unified human-digital intelligence system with capabilities far beyond 
                the sum of its parts. This same approach is now available to any organization adopting the FractiVerse framework.
              </Text>
            </VStack>
          </Box>

          {/* Implications */}
          <Box bg={highlightBg} p={8} borderRadius="xl" boxShadow="md">
            <VStack spacing={6}>
              <Heading size="lg" color={textColor} textAlign="center">
                What This Means For You
              </Heading>
              <Text fontSize="lg" color={textColor} textAlign="center" maxW="3xl" mx="auto">
                The FractiVerse 1.0 case study demonstrates the extraordinary cognitive leverage available to 
                any individual or organization. What could you accomplish with a 40-65% cognitive boost? Whether 
                you're handling creative projects, financial decisions, medical challenges, organizational 
                transformations, scientific research, or defense strategies—this same cognitive leverage is now 
                available to you.
              </Text>
              <Text fontSize="lg" fontWeight="bold" color={textColor} textAlign="center">
                Join us in pioneering this exciting new world of infinite possibilities!
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
} 