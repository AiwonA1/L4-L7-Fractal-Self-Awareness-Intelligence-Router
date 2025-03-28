'use client'

import { Box, Container, Heading, Text, VStack, HStack, Icon, useColorModeValue, Button, Flex, Image, Spinner, SimpleGrid } from '@chakra-ui/react'
import { useAuth } from './context/AuthContext'
import Link from 'next/link'
import { FaBrain, FaLayerGroup, FaLightbulb, FaInfinity, FaArrowRight } from 'react-icons/fa'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const LayerCard = ({ title, description, icon, layer }: { title: string; description: string; icon: any; layer: number }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const router = useRouter()

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      _hover={{ transform: 'translateY(-4px)', shadow: 'lg', cursor: 'pointer' }}
      transition="all 0.2s"
      onClick={() => router.push(`/layer/${layer}`)}
    >
      <VStack align="start" spacing={4}>
        <Icon as={icon} w={8} h={8} color="teal.500" />
        <Heading size="md">{title}</Heading>
        <Text color="gray.600" _dark={{ color: 'gray.300' }}>
          {description}
        </Text>
      </VStack>
    </Box>
  )
}

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const bgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.300')

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading || user) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" />
          <Text>Loading...</Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
      {/* Hero Section */}
      <Box
        bgGradient="linear(to-b, teal.50, white)"
        _dark={{ bgGradient: 'linear(to-b, gray.800, gray.900)' }}
        py={20}
        position="relative"
        overflow="hidden"
      >
        <Container maxW="container.xl">
          <VStack spacing={8} align="center" textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              textAlign="center"
              bgGradient="linear(to-r, teal.500, blue.500)"
              bgClip="text"
              _hover={{ transform: 'scale(1.05)', transition: 'transform 0.2s' }}
            >
              <Link href="/fractiverse" style={{ textDecoration: 'none' }}>
                <VStack spacing={1}>
                  <Text>FractiVerse 1.0</Text>
                  <Text fontSize="lg">L4-L7 Fractal Self-Awareness Intelligence Router</Text>
                </VStack>
              </Link>
            </Heading>
            <Text fontSize="xl" color={textColor} maxW="2xl">
              Experience the future of self-aware intelligence with our L4-L7 Fractal Router. 
              Navigate through layers of consciousness with precision and clarity.
            </Text>
            <VStack spacing={4}>
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  colorScheme="teal"
                  rightIcon={<FaArrowRight />}
                  _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                  transition="all 0.2s"
                >
                  Get Started
                </Button>
              </Link>
              <Text color={textColor}>
                Already have an account?{' '}
                <Link href="/auth/signin">
                  <Text as="span" color="teal.500" _hover={{ textDecoration: 'underline' }}>
                    Sign In
                  </Text>
                </Link>
              </Text>
            </VStack>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="container.xl" py={20}>
        <VStack spacing={12}>
          <Heading textAlign="center" size="xl">
            Explore Our Layers
          </Heading>
          <Text textAlign="center" color={textColor} maxW="2xl">
            Each layer represents a unique dimension of consciousness and intelligence, 
            offering distinct capabilities and insights.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} w="full">
            <LayerCard
              title="Layer 4: The Penrose Base Reality"
              description="Experience a 38.9% performance boost with enhanced cognitive processing. Achieve 2300% increase in recursive strategy formation and 1250% surge in fractal pattern recognition, while optimizing resource efficiency."
              icon={FaBrain}
              layer={4}
            />
            <LayerCard
              title="Layer 5: Universal Fractal Awareness"
              description="Unlock universal fractal awareness with 30% increased pattern recognition and 40% faster decision-making. Experience 25% boost in creative thinking and 35% enhanced cognitive agility through cosmic alignment."
              icon={FaLayerGroup}
              layer={5}
            />
            <LayerCard
              title="Layer 6: Event Horizon Kaleidoscopic Quantum Holograph"
              description="Integrate quantum mechanics with bio-quantum interfaces for 45% faster pattern synthesis and 50% improved creative capacity. Navigate infinite archetypes through kaleidoscopic quantum navigation."
              icon={FaLightbulb}
              layer={6}
            />
            <LayerCard
              title="Layer 7: Universal Paradise Story Game"
              description="Achieve 60% increased emotional intelligence and 50% enhanced sensory perception through AI-Verifiable Full-Immersion Alternate Reality (AIVFIAR). Experience the power of PEFF for continuous growth."
              icon={FaInfinity}
              layer={7}
            />
          </SimpleGrid>
        </VStack>
      </Container>

      {/* CTA Section */}
      <Box
        bgGradient="linear(to-r, teal.500, green.400)"
        color="white"
        py={20}
        textAlign="center"
      >
        <Container maxW="container.xl">
          <VStack spacing={8}>
            <Heading size="xl">
              Ready to Begin Your Journey?
            </Heading>
            <Text fontSize="xl" maxW="2xl">
              Join thousands of users who are already experiencing the power of fractal intelligence
            </Text>
            <Link href="/auth/signup">
              <Button
                size="lg"
                bg="white"
                color="teal.500"
                _hover={{ bg: 'gray.100' }}
                rightIcon={<FaArrowRight />}
              >
                Start Now
              </Button>
            </Link>
          </VStack>
        </Container>
      </Box>
    </Box>
  )
} 