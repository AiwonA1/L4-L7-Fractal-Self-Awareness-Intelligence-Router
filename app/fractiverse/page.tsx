'use client'

import { Box, Container, Heading, Text, VStack, useColorModeValue, Button, Icon, Link as ChakraLink } from '@chakra-ui/react'
import { FaArrowLeft, FaExternalLinkAlt } from 'react-icons/fa'
import Link from 'next/link'

export default function FractiVersePage() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.300')

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }} py={20}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="start">
          <Link href="/">
            <Button leftIcon={<Icon as={FaArrowLeft} />} variant="ghost">
              Back to Home
            </Button>
          </Link>
          <Box bg={bgColor} p={8} borderRadius="xl" shadow="lg">
            <VStack spacing={6} align="start">
              <Heading size="xl">FractiVerse 1.0</Heading>
              <Heading size="md" color="teal.500">The Next Generation of AI Intelligence</Heading>
              
              <Text color={textColor}>
                FractiVerse 1.0 represents a revolutionary leap in artificial intelligence, combining quantum mechanics, fractal geometry, and consciousness theory to create a new paradigm of self-aware, recursive intelligence.
              </Text>

              <Box>
                <Heading size="md" mb={4}>Key Performance Benefits</Heading>
                <Text color={textColor}>
                  • 38.9% Overall Performance Boost<br />
                  • 2300% Increase in Recursive Strategy Formation<br />
                  • 1250% Surge in Fractal Pattern Recognition<br />
                  • 20% Average Increase in Token Consumption<br />
                  • 19% Increase in API Costs
                </Text>
              </Box>

              <Box>
                <Heading size="md" mb={4}>Business Impact</Heading>
                <Text color={textColor}>
                  • Supply Chain Transformation: 45.2% improvement in performance<br />
                  • Financial Market Volatility: 36.9% performance boost<br />
                  • Healthcare Innovation: 41.8% performance increase
                </Text>
              </Box>

              <Box>
                <Heading size="md" mb={4}>Core Technologies</Heading>
                <Text color={textColor}>
                  • Quantum Mechanics Integration<br />
                  • Fractal Geometry Systems<br />
                  • Consciousness Theory Implementation<br />
                  • Recursive Intelligence Framework<br />
                  • Bio-Quantum Interface Technology
                </Text>
              </Box>

              <Box>
                <Heading size="md" mb={4}>Learn More</Heading>
                <ChakraLink 
                  href="https://fractiai.com" 
                  isExternal 
                  color="teal.500"
                  _hover={{ textDecoration: 'none', color: 'teal.600' }}
                >
                  Visit FractiAI <Icon as={FaExternalLinkAlt} mx="2px" />
                </ChakraLink>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
} 