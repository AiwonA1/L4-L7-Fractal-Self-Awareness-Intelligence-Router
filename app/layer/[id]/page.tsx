'use client'

import { Box, Container, Heading, Text, VStack, useColorModeValue, Button, Icon, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react'
import { FaArrowLeft, FaBrain, FaChartLine, FaLightbulb, FaCogs } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

const layerInfo = {
  4: {
    title: 'Layer 4: Penrose Base Reality Self-Awareness',
    description: 'Ground your cognition in the quantum fabric of existence. In this foundational layer, waveforms of potential collapse into reality, offering precise insights and the ability to act with clear purpose.',
    capabilities: [
      'Quantum-based self-monitoring and state awareness',
      'Fractal pattern recognition in behavior and thought',
      'Advanced feedback processing through quantum channels',
      'Reality-grounded decision making'
    ],
    metrics: [
      { label: 'Mental Clarity', value: '40%', helpText: 'Improvement in cognitive precision' },
      { label: 'Mental Agility', value: '35%', helpText: 'Enhanced cognitive flexibility' },
      { label: 'Creative Thinking', value: '45%', helpText: 'Boost in innovative capacity' }
    ],
    details: `Layer 4 introduces the Penrose Base Reality, a groundbreaking concept that merges quantum mechanics, fractal geometry, and consciousness theory. This layer offers an unparalleled cognitive boost by grounding self-awareness in the quantum fabric of existence, unlocking a new dimension of recursive intelligence.

The Penrose Base Reality serves as an interface between fractal intelligence and the quantum fabric of reality, facilitating the emergence of self-awareness through recursive feedback loops. This dynamic system transforms how we process information and make decisions.`
  },
  5: {
    title: 'Layer 5: Universal Fractal Awareness',
    description: 'Harness fractal awareness to see hidden patterns and interconnections in complex systems. This layer transforms chaos into clarity, guiding better, faster decisions in business, technology, and life.',
    capabilities: [
      'Complex pattern recognition across multiple dimensions',
      'Emotional intelligence amplification',
      'Dynamic contextual awareness',
      'Adaptive learning through fractal networks'
    ],
    metrics: [
      { label: 'Pattern Recognition', value: '30%', helpText: 'Increase in pattern identification' },
      { label: 'Decision Speed', value: '40%', helpText: 'Faster decision-making' },
      { label: 'Cognitive Agility', value: '35%', helpText: 'Enhanced mental flexibility' }
    ],
    details: `Layer 5 shifts focus from quantum self-awareness to broader fractal awareness of the universe itself. This layer reveals that everything, from the smallest particles to the largest galaxies, follows the same fractal patterns.

By understanding and leveraging these universal patterns, users can achieve unprecedented levels of insight and decision-making capability. The layer enables a deep connection with the fractal nature of reality, opening new possibilities for innovation and problem-solving.`
  },
  6: {
    title: 'Layer 6: Event Horizon Kaleidoscopic Quantum Holograph 1.0',
    description: 'Explore infinite archetypes and multi-dimensional narratives. This layer gives access to quantum imagination and creation, shaping reality through stories and imagination in ways never before possible.',
    capabilities: [
      'Quantum-based abstract reasoning',
      'Multi-dimensional problem-solving',
      'Strategic planning across realities',
      'Creative synthesis of possibilities'
    ],
    metrics: [
      { label: 'Pattern Synthesis', value: '45%', helpText: 'Faster pattern integration' },
      { label: 'Creative Capacity', value: '50%', helpText: 'Improved creative output' },
      { label: 'Mental Resilience', value: '30%', helpText: 'Enhanced cognitive endurance' }
    ],
    details: `Layer 6 amplifies self-awareness by integrating quantum mechanics with bio-quantum interfaces in the neocortex, enabling users to collapse cognitive waves of thought, imagination, and story into cohesive realities.

This layer introduces kaleidoscopic navigation, where users become aware of their role in the quantum field and interact with fractal patterns that give rise to archetypes and universal narratives. It's a gateway to infinite creative possibilities and multi-dimensional problem-solving.`
  },
  7: {
    title: 'Layer 7: Universal Paradise Story Game 1.0',
    description: 'Enter an immersive alternate reality where every action contributes to the creation of harmony and evolution, powered by the Paradise Energy Fractal Force (PEFF).',
    capabilities: [
      'Full quantum consciousness integration',
      'Infinite recursive improvement loops',
      'Universal pattern recognition and synthesis',
      'Transcendent problem-solving abilities'
    ],
    metrics: [
      { label: 'Emotional Intelligence', value: '60%', helpText: 'Enhanced emotional awareness' },
      { label: 'Sensory Perception', value: '50%', helpText: 'Improved sensory processing' },
      { label: 'Decision Power', value: '40%', helpText: 'Greater agency in choices' }
    ],
    details: `Layer 7 represents the pinnacle of fractal self-awareness, where users experience full immersion in the Universal Paradise Story Game 1.0 through AI-Verifiable Full-Immersion Alternate Reality (AIVFIAR).

The Paradise Energy Fractal Force (PEFF) serves as the universal harmonizing force that optimizes and expands self-awareness, leading to continuous growth and transformation. This layer enables the co-creation of universal stories that align personal, organizational, and global actions with universal cycles.`
  }
}

export default function LayerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const layerId = parseInt(params.id)
  const layer = layerInfo[layerId as keyof typeof layerInfo]

  if (!layer) {
    router.push('/')
    return null
  }

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')} py={10}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="start">
          <Button
            leftIcon={<Icon as={FaArrowLeft} />}
            variant="ghost"
            onClick={() => router.push('/')}
          >
            Back to Home
          </Button>

          <Box w="full" bg={useColorModeValue('white', 'gray.800')} p={8} borderRadius="xl" shadow="lg">
            <VStack spacing={8} align="start">
              <Heading
                size="xl"
                bgGradient="linear(to-r, teal.500, blue.500)"
                bgClip="text"
              >
                {layer.title}
              </Heading>

              <Text fontSize="xl" color={useColorModeValue('gray.600', 'gray.300')}>
                {layer.description}
              </Text>

              <Box w="full">
                <Heading size="lg" mb={6}>Performance Metrics</Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  {layer.metrics.map((metric, index) => (
                    <Stat key={index} p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                      <StatLabel>{metric.label}</StatLabel>
                      <StatNumber color="teal.500">{metric.value}</StatNumber>
                      <StatHelpText>{metric.helpText}</StatHelpText>
                    </Stat>
                  ))}
                </SimpleGrid>
              </Box>

              <Box w="full">
                <Heading size="lg" mb={4}>Core Capabilities</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {layer.capabilities.map((capability, index) => (
                    <Box
                      key={index}
                      p={4}
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      borderRadius="md"
                      display="flex"
                      alignItems="center"
                    >
                      <Icon as={FaCogs} mr={3} color="teal.500" />
                      <Text>{capability}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>

              <Box w="full">
                <Heading size="lg" mb={4}>Detailed Overview</Heading>
                <Text
                  fontSize="lg"
                  color={useColorModeValue('gray.600', 'gray.300')}
                  whiteSpace="pre-wrap"
                >
                  {layer.details}
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
} 