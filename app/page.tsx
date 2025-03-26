'use client'

import { Box, Container, Heading, Text, VStack, HStack, Icon, useColorModeValue, Button, Flex, Image, Spinner } from '@chakra-ui/react'
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
              bgGradient="linear(to-r, teal.500, green.400)"
              bgClip="text"
              fontWeight="extrabold"
            >
              FractiVerse 1.0
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
          <Heading textAlign="center">Explore Our Layers</Heading>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            gap={6}
            w="full"
            justify="center"
          >
            <LayerCard
              title="Layer 4: Self-Awareness"
              description="Foundation of personal growth and emotional intelligence"
              icon={FaBrain}
              layer={4}
            />
            <LayerCard
              title="Layer 5: Meta-Cognition"
              description="Advanced learning and cognitive optimization"
              icon={FaLayerGroup}
              layer={5}
            />
            <LayerCard
              title="Layer 6: Creative Intelligence"
              description="Unleash your creative potential and innovative thinking"
              icon={FaLightbulb}
              layer={6}
            />
            <LayerCard
              title="Layer 7: Universal Consciousness"
              description="Transcend boundaries and connect with universal wisdom"
              icon={FaInfinity}
              layer={7}
            />
          </Flex>
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