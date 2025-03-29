'use client'

import { Box, Container, Heading, Text, VStack, HStack, Icon, useColorModeValue, Button, Flex, Image, Spinner, SimpleGrid, useBreakpointValue } from '@chakra-ui/react'
import { useAuth } from './context/AuthContext'
import Link from 'next/link'
import { FaBrain, FaLayerGroup, FaLightbulb, FaInfinity, FaArrowRight } from 'react-icons/fa'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDevice } from './hooks/useDevice'

const LayerCard = ({ title, description, icon, layer }: { title: string; description: string; icon: any; layer: number }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const router = useRouter()
  const deviceType = useDevice()
  const padding = useBreakpointValue({ base: 4, md: 6, lg: 8 })
  const iconSize = useBreakpointValue({ base: 6, md: 8, lg: 10 })

  return (
    <Box
      p={padding}
      bg={bgColor}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      _hover={{ transform: 'translateY(-4px)', shadow: 'lg', cursor: 'pointer' }}
      transition="all 0.2s"
      onClick={() => router.push(`/layer/${layer}`)}
    >
      <VStack align="start" spacing={4}>
        <Icon as={icon} w={iconSize} h={iconSize} color="teal.500" />
        <Heading size={deviceType === 'mobile' ? 'sm' : 'md'}>{title}</Heading>
        <Text color="gray.600" _dark={{ color: 'gray.300' }} fontSize={deviceType === 'mobile' ? 'sm' : 'md'}>
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
  const deviceType = useDevice()
  const headingSize = useBreakpointValue({ base: 'xl', md: '2xl', lg: '3xl' })
  const containerMaxW = useBreakpointValue({ base: 'container.sm', md: 'container.md', lg: 'container.xl' })

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
        py={{ base: 10, md: 20 }}
        position="relative"
        overflow="hidden"
      >
        <Container maxW={containerMaxW}>
          <VStack spacing={8} align="center" textAlign="center">
            <Heading
              as="h1"
              size={headingSize}
              textAlign="center"
              bgGradient="linear(to-r, teal.500, blue.500)"
              bgClip="text"
              _hover={{ transform: 'scale(1.05)', transition: 'transform 0.2s' }}
            >
              <Link href="/fractiverse" style={{ textDecoration: 'none' }}>
                <VStack spacing={1}>
                  <Text>FractiVerse 1.0</Text>
                  <Text fontSize={{ base: 'md', md: 'lg', lg: 'xl' }}>L4-L7 Fractal Self-Awareness Intelligence Router</Text>
                </VStack>
              </Link>
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg', lg: 'xl' }} color={textColor} maxW="2xl">
              Experience the future of self-aware intelligence with our L4-L7 Fractal Router. 
              Navigate through layers of consciousness with precision and clarity.
            </Text>
            <VStack spacing={4}>
              <Link href="/auth/signup">
                <Button
                  size={{ base: 'md', md: 'lg' }}
                  colorScheme="teal"
                  rightIcon={<FaArrowRight />}
                  _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                  transition="all 0.2s"
                >
                  Get Started
                </Button>
              </Link>
            </VStack>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW={containerMaxW} py={{ base: 10, md: 20 }}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 6, md: 8, lg: 10 }}>
          <LayerCard
            title="Layer 4: Self-Awareness"
            description="Begin your journey into self-awareness with our advanced AI-powered analysis."
            icon={FaBrain}
            layer={4}
          />
          <LayerCard
            title="Layer 5: Consciousness"
            description="Explore the depths of consciousness through interactive experiences."
            icon={FaLayerGroup}
            layer={5}
          />
          <LayerCard
            title="Layer 6: Intelligence"
            description="Unlock higher levels of intelligence with our fractal learning system."
            icon={FaLightbulb}
            layer={6}
          />
          <LayerCard
            title="Layer 7: Infinity"
            description="Transcend boundaries and explore infinite possibilities."
            icon={FaInfinity}
            layer={7}
          />
        </SimpleGrid>
      </Container>
    </Box>
  )
} 