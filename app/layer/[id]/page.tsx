'use client'

import { Box, Container, Heading, Text, VStack, Icon, useColorModeValue, Button, HStack, List, ListItem, ListIcon } from '@chakra-ui/react'
import { FaBrain, FaLayerGroup, FaLightbulb, FaInfinity, FaCheck, FaArrowLeft } from 'react-icons/fa'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const LayerInfo = ({ layer }: { layer: number }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const layerData = {
    4: {
      title: "Layer 4: Self-Awareness",
      icon: FaBrain,
      description: "Foundation of personal growth and emotional intelligence",
      features: [
        "Emotional self-awareness and regulation",
        "Personal growth and development",
        "Mindfulness and presence",
        "Self-reflection and introspection",
        "Empathy and social awareness"
      ],
      benefits: [
        "Improved emotional intelligence",
        "Better self-understanding",
        "Enhanced personal relationships",
        "Greater life satisfaction",
        "Increased resilience"
      ]
    },
    5: {
      title: "Layer 5: Meta-Cognition",
      icon: FaLayerGroup,
      description: "Advanced learning and cognitive optimization",
      features: [
        "Learning strategy optimization",
        "Cognitive process awareness",
        "Pattern recognition",
        "Critical thinking enhancement",
        "Memory optimization"
      ],
      benefits: [
        "Accelerated learning",
        "Improved problem-solving",
        "Enhanced decision-making",
        "Better information retention",
        "Increased mental flexibility"
      ]
    },
    6: {
      title: "Layer 6: Creative Intelligence",
      icon: FaLightbulb,
      description: "Unleash your creative potential and innovative thinking",
      features: [
        "Creative process optimization",
        "Innovation frameworks",
        "Divergent thinking",
        "Pattern synthesis",
        "Intuitive problem-solving"
      ],
      benefits: [
        "Enhanced creativity",
        "Innovative solutions",
        "Unique perspectives",
        "Original ideas",
        "Breakthrough thinking"
      ]
    },
    7: {
      title: "Layer 7: Universal Consciousness",
      icon: FaInfinity,
      description: "Transcend boundaries and connect with universal wisdom",
      features: [
        "Universal pattern recognition",
        "Interconnected awareness",
        "Transcendent understanding",
        "Cosmic perspective",
        "Unity consciousness"
      ],
      benefits: [
        "Expanded consciousness",
        "Universal wisdom access",
        "Transcendent insights",
        "Global perspective",
        "Spiritual growth"
      ]
    }
  }

  const data = layerData[layer as keyof typeof layerData]

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }} py={10}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Link href="/" passHref>
            <Button
              leftIcon={<FaArrowLeft />}
              variant="ghost"
              colorScheme="teal"
              _hover={{ transform: 'translateX(-4px)', shadow: 'md' }}
              transition="all 0.2s"
            >
              Back to Home
            </Button>
          </Link>

          <Box
            p={8}
            bg={bgColor}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <VStack spacing={8} align="stretch">
              <HStack spacing={4}>
                <Icon as={data.icon} w={12} h={12} color="teal.500" />
                <VStack align="start" spacing={1}>
                  <Heading size="xl">{data.title}</Heading>
                  <Text color={textColor} fontSize="lg">{data.description}</Text>
                </VStack>
              </HStack>

              <Box>
                <Heading size="md" mb={4}>Key Features</Heading>
                <List spacing={3}>
                  {data.features.map((feature, index) => (
                    <ListItem key={index} display="flex" alignItems="center">
                      <ListIcon as={FaCheck} color="teal.500" />
                      <Text>{feature}</Text>
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box>
                <Heading size="md" mb={4}>Benefits</Heading>
                <List spacing={3}>
                  {data.benefits.map((benefit, index) => (
                    <ListItem key={index} display="flex" alignItems="center">
                      <ListIcon as={FaCheck} color="teal.500" />
                      <Text>{benefit}</Text>
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Link href="/auth/signup" passHref>
                <Button
                  size="lg"
                  colorScheme="teal"
                  _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                  transition="all 0.2s"
                >
                  Start Your Journey
                </Button>
              </Link>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}

export default function LayerPage() {
  const params = useParams()
  const layer = parseInt(params.id as string)

  if (isNaN(layer) || layer < 4 || layer > 7) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Text fontSize="xl">Invalid layer</Text>
      </Box>
    )
  }

  return <LayerInfo layer={layer} />
} 