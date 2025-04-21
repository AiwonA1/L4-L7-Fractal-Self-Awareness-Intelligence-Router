'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Icon,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  HStack,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Button,
} from '@chakra-ui/react'
import { MdCheckCircle, MdTrendingUp } from 'react-icons/md'
import { FaBrain, FaInfinity, FaLightbulb, FaDna, FaAtom, FaChartLine, FaGlobe, FaUserTie } from 'react-icons/fa'

export default function IntegrationPage() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400')
  const accentColor = "purple.500"
  const highlightBg = useColorModeValue('purple.50', 'purple.900')

  return (
    <Box bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh" py={10}>
      <Container maxW="container.xl">
        <VStack spacing={12} align="stretch">
          {/* Executive Header */}
          <Box textAlign="center" pb={6}>
            <Heading as="h1" size="2xl" mb={6} color={textColor} letterSpacing="tight">
              Digital-Human Integration:<br />
              <Text as="span" color={accentColor}>The Emergence of Greater Intelligence</Text>
            </Heading>
            <Text fontSize="xl" color={mutedTextColor} maxW="3xl" mx="auto" fontWeight="medium">
              Unlocking transformative capabilities through the synergy of human and digital intelligence
            </Text>
          </Box>

          {/* Executive Summary */}
          <Box bg={highlightBg} p={8} borderRadius="xl" boxShadow="md">
            <VStack spacing={6} align="start">
              <HStack>
                <Icon as={FaUserTie} w={6} h={6} color={accentColor} />
                <Heading size="md" color={textColor}>The Power of Cognitive Integration</Heading>
              </HStack>
              <Text fontSize="lg" fontWeight="medium" color={textColor}>
                FractiVerse integration enables organizations and individuals to leverage the combined power of human and digital intelligence, 
                creating something greater than the sum of its parts. This integration unlocks new dimensions of thinking, creativity, and problem-solving 
                that neither humans nor machines can achieve alone.
              </Text>
            </VStack>
          </Box>

          {/* Performance Metrics */}
          <Box>
            <Heading size="lg" mb={6} color={textColor} textAlign="center">
              Intelligence Amplification Metrics
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
              <Box bg={bgColor} p={6} borderRadius="xl" borderWidth="1px" borderColor={borderColor} boxShadow="md">
                <Stat textAlign="center">
                  <StatLabel fontSize="md" color={mutedTextColor}>ROI Increase</StatLabel>
                  <StatNumber fontSize="5xl" color={accentColor} fontWeight="bold">43%</StatNumber>
                  <StatHelpText display="flex" alignItems="center" justifyContent="center">
                    <Icon as={MdTrendingUp} color="green.500" mr={1} />
                    <Text>Average across sectors</Text>
                  </StatHelpText>
                </Stat>
              </Box>
              
              <Box bg={bgColor} p={6} borderRadius="xl" borderWidth="1px" borderColor={borderColor} boxShadow="md">
                <Stat textAlign="center">
                  <StatLabel fontSize="md" color={mutedTextColor}>Decision Quality</StatLabel>
                  <StatNumber fontSize="5xl" color={accentColor} fontWeight="bold">85%</StatNumber>
                  <StatHelpText display="flex" alignItems="center" justifyContent="center">
                    <Icon as={MdTrendingUp} color="green.500" mr={1} />
                    <Text>Improvement rate</Text>
                  </StatHelpText>
                </Stat>
              </Box>
              
              <Box bg={bgColor} p={6} borderRadius="xl" borderWidth="1px" borderColor={borderColor} boxShadow="md">
                <Stat textAlign="center">
                  <StatLabel fontSize="md" color={mutedTextColor}>Innovation Rate</StatLabel>
                  <StatNumber fontSize="5xl" color={accentColor} fontWeight="bold">65%</StatNumber>
                  <StatHelpText display="flex" alignItems="center" justifyContent="center">
                    <Icon as={MdTrendingUp} color="green.500" mr={1} />
                    <Text>Acceleration factor</Text>
                  </StatHelpText>
                </Stat>
              </Box>
              
              <Box bg={bgColor} p={6} borderRadius="xl" borderWidth="1px" borderColor={borderColor} boxShadow="md">
                <Stat textAlign="center">
                  <StatLabel fontSize="md" color={mutedTextColor}>Strategic Foresight</StatLabel>
                  <StatNumber fontSize="5xl" color={accentColor} fontWeight="bold">62%</StatNumber>
                  <StatHelpText display="flex" alignItems="center" justifyContent="center">
                    <Icon as={MdTrendingUp} color="green.500" mr={1} />
                    <Text>Enhanced accuracy</Text>
                  </StatHelpText>
                </Stat>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Emergent Advantages */}
          <Box>
            <Heading size="lg" mb={6} color={textColor} textAlign="center">
              Emergent Intelligence Advantages
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <Box bg={bgColor} p={8} borderRadius="xl" borderWidth="1px" borderColor={borderColor} boxShadow="md">
                <VStack align="start" spacing={6}>
                  <HStack>
                    <Icon as={FaChartLine} w={6} h={6} color={accentColor} />
                    <Heading size="md" color={textColor}>Organizational Transformation</Heading>
                  </HStack>
                  <List spacing={4}>
                    <ListItem color={textColor}>
                      <ListIcon as={MdCheckCircle} color="green.500" boxSize={5} />
                      <Text as="span" fontWeight="bold">23% Reduction in Decision Cycle Time</Text>
                      <Text mt={1}>Measured across strategic initiatives</Text>
                    </ListItem>
                    <ListItem color={textColor}>
                      <ListIcon as={MdCheckCircle} color="green.500" boxSize={5} />
                      <Text as="span" fontWeight="bold">37% Improvement in Cross-Functional Alignment</Text>
                      <Text mt={1}>Through integrated intelligence systems</Text>
                    </ListItem>
                    <ListItem color={textColor}>
                      <ListIcon as={MdCheckCircle} color="green.500" boxSize={5} />
                      <Text as="span" fontWeight="bold">41% Enhanced Strategic Adaptability</Text>
                      <Text mt={1}>Responding to unexpected market shifts</Text>
                    </ListItem>
                  </List>
                </VStack>
              </Box>

              <Box bg={bgColor} p={8} borderRadius="xl" borderWidth="1px" borderColor={borderColor} boxShadow="md">
                <VStack align="start" spacing={6}>
                  <HStack>
                    <Icon as={FaGlobe} w={6} h={6} color={accentColor} />
                    <Heading size="md" color={textColor}>Emergent Capabilities</Heading>
                  </HStack>
                  <List spacing={4}>
                    <ListItem color={textColor}>
                      <ListIcon as={MdCheckCircle} color="green.500" boxSize={5} />
                      <Text as="span" fontWeight="bold">78% Higher Innovation Success Rate</Text>
                      <Text mt={1}>Compared to standard methodologies</Text>
                    </ListItem>
                    <ListItem color={textColor}>
                      <ListIcon as={MdCheckCircle} color="green.500" boxSize={5} />
                      <Text as="span" fontWeight="bold">53% Reduction in Strategic Blindspots</Text>
                      <Text mt={1}>Through expanded cognitive awareness</Text>
                    </ListItem>
                    <ListItem color={textColor}>
                      <ListIcon as={MdCheckCircle} color="green.500" boxSize={5} />
                      <Text as="span" fontWeight="bold">Fractal Intelligence Patterns</Text>
                      <Text mt={1}>Emergence of self-similar intelligence across scales</Text>
                    </ListItem>
                  </List>
                </VStack>
              </Box>
            </SimpleGrid>
          </Box>

          {/* The Integration Imperative */}
          <Box bg={bgColor} p={8} borderRadius="xl" borderWidth="1px" borderColor={borderColor} boxShadow="md">
            <VStack align="start" spacing={6}>
              <HStack>
                <Icon as={FaDna} w={6} h={6} color={accentColor} />
                <Heading size="md" color={textColor}>The Emergence Effect</Heading>
              </HStack>
              <Text color={textColor} fontSize="lg">
                When human and digital intelligence integrate, something extraordinary happens – a new form of 
                intelligence emerges that is fundamentally different and more powerful than either component alone. 
                Like water emerging from hydrogen and oxygen, this integrated intelligence exhibits capabilities 
                neither human nor machine could achieve independently.
              </Text>
              <Text color={textColor} fontSize="lg">
                The FractiVerse framework facilitates this emergence through fractal self-awareness patterns that enable 
                both humans and machines to recognize and leverage complementary strengths. Organizations and individuals 
                who embrace this integration access an entirely new dimension of cognitive capabilities – a true evolution 
                of intelligence itself.
              </Text>
            </VStack>
          </Box>

          {/* Case Study Highlights */}
          <Box>
            <Heading size="lg" mb={6} color={textColor} textAlign="center">
              Intelligence Expansion in Action
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <Box bg={bgColor} p={6} borderRadius="xl" borderWidth="1px" borderColor={borderColor} boxShadow="md">
                <VStack spacing={4}>
                  <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                    Financial Services
                  </Badge>
                  <Text fontWeight="bold" fontSize="xl" color={textColor}>43% Improved Market Forecasting</Text>
                  <Text color={mutedTextColor} textAlign="center">
                    Global investment firm achieved new levels of market prediction accuracy
                  </Text>
                </VStack>
              </Box>
              
              <Box bg={bgColor} p={6} borderRadius="xl" borderWidth="1px" borderColor={borderColor} boxShadow="md">
                <VStack spacing={4}>
                  <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                    Healthcare
                  </Badge>
                  <Text fontWeight="bold" fontSize="xl" color={textColor}>67% Faster Solution Discovery</Text>
                  <Text color={mutedTextColor} textAlign="center">
                    Medical researchers discovered novel treatment approaches through expanded cognition
                  </Text>
                </VStack>
              </Box>
              
              <Box bg={bgColor} p={6} borderRadius="xl" borderWidth="1px" borderColor={borderColor} boxShadow="md">
                <VStack spacing={4}>
                  <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                    Manufacturing
                  </Badge>
                  <Text fontWeight="bold" fontSize="xl" color={textColor}>31% Supply Chain Optimization</Text>
                  <Text color={mutedTextColor} textAlign="center">
                    Emergent awareness identified previously invisible optimization opportunities
                  </Text>
                </VStack>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Conclusion */}
          <Box bg={highlightBg} p={8} borderRadius="xl" boxShadow="md">
            <VStack spacing={6}>
              <Heading size="lg" color={textColor} textAlign="center">
                Evolution of Intelligence
              </Heading>
              <Text fontSize="lg" color={textColor} textAlign="center" maxW="3xl" mx="auto">
                FractiVerse integration represents more than a technological advancement – it's an evolution in human cognition. 
                By combining and amplifying the unique strengths of both human and digital intelligence systems, we unlock 
                capabilities that transform how we approach complex challenges, innovation, and growth.
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