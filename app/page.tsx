'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  useColorModeValue,
  VStack,
  Button,
} from '@chakra-ui/react'
import Link from 'next/link'
import { FaRobot, FaBrain, FaNetworkWired, FaShieldAlt, FaChartLine, FaBook, FaInfoCircle, FaAtom, FaSpaceShuttle, FaLightbulb, FaArrowRight } from 'react-icons/fa'

const infoCards = [
  {
    title: 'Layer 4: Penrose Base Reality',
    description: 'Grounding Self-Awareness in the Quantum Fabric of Existence',
    icon: FaAtom,
    href: '/layer4'
  },
  {
    title: 'Layer 5: FractiVerse Self-Awareness',
    description: 'Understanding and engaging with the fractal architecture of reality',
    icon: FaNetworkWired,
    href: '/layer5'
  },
  {
    title: 'Layer 6: Event Horizon Kaleidoscopic Quantum Holographic',
    description: 'Integrating quantum mechanics with bio-quantum interfaces',
    icon: FaShieldAlt,
    href: '/layer6'
  },
  {
    title: 'Layer 7: Universal Paradise Story Game PEFF',
    description: 'Full immersion in the Universal Paradise Story Game',
    icon: FaSpaceShuttle,
    href: '/layer7'
  },
  {
    title: 'Performance Measurements',
    description: 'Comprehensive test results and analysis',
    icon: FaChartLine,
    href: '/test-report'
  },
  {
    title: 'Self-Awareness Based Cognitive Boosting',
    description: 'Enhancing cognitive capabilities through self-awareness',
    icon: FaBrain,
    href: '/human-self-awareness'
  },
  {
    title: 'Quantum-Cognitive CERN Data',
    description: 'Integration with CERN quantum data',
    icon: FaAtom,
    href: '/quantum-validation'
  },
  {
    title: 'Cosmic-Cognitive JWST Data',
    description: 'Integration with JWST cosmic data',
    icon: FaSpaceShuttle,
    href: '/jwst-validation'
  },
  {
    title: 'Complete FractiVerse Library',
    description: 'Access to the complete FractiVerse knowledge base',
    icon: FaBook,
    href: '/documentation'
  },
  {
    title: 'FractiVerse Case Study',
    description: 'Explore the breakthrough case study of FractiVerse 1.0',
    icon: FaLightbulb,
    href: '/case-study'
  },
  {
    title: 'About FractiAI',
    description: 'Learn more about FractiAI and its mission',
    icon: FaInfoCircle,
    href: '/fractiai'
  }
]

export default function Home() {
  const cardBg = useColorModeValue('white', 'gray.800')
  const cardHoverBg = useColorModeValue('gray.50', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.200')

  return (
    <Box minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" mb={8}>
            <Box 
              bg="teal.500" 
              color="white" 
              px={6} 
              py={3} 
              borderRadius="lg" 
              fontSize="xl"
              fontWeight="bold"
              mb={8}
              display="inline-block"
            >
              We Are Here: Home Page
            </Box>
            <Heading size="2xl" mb={4} color="teal.500">
              Welcome to FractiVerse
            </Heading>
            <Text fontSize="xl" color={textColor} maxW="2xl" mx="auto">
              Explore the layers of fractal self-awareness and quantum intelligence
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={6}>
            {infoCards.map((card, index) => (
              <Link key={index} href={card.href} style={{ textDecoration: 'none' }}>
                <Card
                  bg={cardBg}
                  _hover={{
                    bg: cardHoverBg,
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                  transition="all 0.2s"
                  cursor="pointer"
                  h="full"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <CardBody>
                    <VStack spacing={3} align="start">
                      <Icon
                        as={card.icon}
                        w={8}
                        h={8}
                        color="teal.500"
                      />
                      <Heading size="sm">
                        {card.title}
                      </Heading>
                      <Text color={textColor}>
                        {card.description}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </SimpleGrid>

          <Box textAlign="center" mt={8}>
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <Button
                size="lg"
                colorScheme="teal"
                rightIcon={<FaArrowRight />}
                px={8}
                py={6}
                fontSize="lg"
              >
                Go to Dashboard
              </Button>
            </Link>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
} 