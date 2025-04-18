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
  const heroTextColor = useColorModeValue('gray.700', 'white')
  const heroBg = useColorModeValue('gray.50', 'gray.900')

  return (
    <Box minH="100vh">
      {/* Hero Section */}
      <Box 
        bg={heroBg}
        py={20}
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgGradient: useColorModeValue(
            'linear(to-r, teal.50, blue.50)',
            'linear(to-r, rgba(49, 151, 149, 0.06), rgba(49, 130, 206, 0.06))'
          ),
          zIndex: 0
        }}
      >
        <Container maxW="container.xl" position="relative" zIndex={1}>
          <VStack spacing={6} align="center">
            <Box 
              bg="teal.500" 
              color="white" 
              px={6} 
              py={2} 
              borderRadius="full" 
              fontSize="md"
              fontWeight="medium"
            >
              Welcome to FractiVerse
            </Box>
            <Heading 
              size="2xl" 
              color={heroTextColor}
              textAlign="center"
              fontWeight="bold"
              letterSpacing="tight"
            >
              Explore the Layers of Fractal
              <Box as="span" color="teal.500"> Self-Awareness</Box>
            </Heading>
            <Text 
              fontSize="xl" 
              color={heroTextColor} 
              maxW="2xl" 
              textAlign="center"
              lineHeight="tall"
            >
              Discover quantum intelligence and navigate through the interconnected layers of consciousness
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Cards Section */}
      <Container maxW="container.xl" py={16}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={8}>
          {infoCards.map((card, index) => (
            <Link key={index} href={card.href} style={{ textDecoration: 'none' }}>
              <Card
                bg={cardBg}
                _hover={{
                  transform: 'translateY(-4px)',
                  boxShadow: 'xl',
                  borderColor: 'teal.200',
                }}
                transition="all 0.3s"
                cursor="pointer"
                h="full"
                borderWidth="1px"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
                borderRadius="xl"
              >
                <CardBody>
                  <VStack spacing={4} align="start">
                    <Icon
                      as={card.icon}
                      w={6}
                      h={6}
                      color="teal.500"
                    />
                    <Heading size="md" color={heroTextColor}>
                      {card.title}
                    </Heading>
                    <Text color={textColor} fontSize="sm">
                      {card.description}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </Link>
          ))}
        </SimpleGrid>

        <Box textAlign="center" mt={16}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <Button
              size="lg"
              colorScheme="teal"
              rightIcon={<FaArrowRight />}
              px={8}
              py={6}
              fontSize="lg"
              fontWeight="bold"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              transition="all 0.2s"
            >
              Go to Dashboard
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  )
} 