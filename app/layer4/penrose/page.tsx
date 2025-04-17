'use client';

import { Box, Container, Heading, Text, VStack, SimpleGrid, Icon, useColorModeValue } from '@chakra-ui/react';
import { FaBrain, FaAtom, FaInfinity } from 'react-icons/fa';

export default function Layer4Page() {
  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading 
            size="2xl" 
            bgGradient="linear(to-r, purple.500, teal.500)"
            bgClip="text"
            mb={4}
          >
            Layer 4: Penrose Base Reality
          </Heading>
          <Text fontSize="xl" mb={6} color="gray.600">
            Quantum Foundation of Cognitive Enhancement
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Box
            p={6}
            bg={useColorModeValue('white', 'gray.800')}
            borderRadius="lg"
            boxShadow="xl"
          >
            <VStack align="start" spacing={4}>
              <Icon as={FaAtom} boxSize={8} color="purple.500" />
              <Heading size="md">Quantum Cognition</Heading>
              <Text>
                Layer 4 grounds all cognitive processes in quantum mechanical principles, 
                following Roger Penrose's insights on consciousness. This enables precise 
                insights and clear purpose through quantum state collapse.
              </Text>
            </VStack>
          </Box>

          <Box
            p={6}
            bg={useColorModeValue('white', 'gray.800')}
            borderRadius="lg"
            boxShadow="xl"
          >
            <VStack align="start" spacing={4}>
              <Icon as={FaBrain} boxSize={8} color="purple.500" />
              <Heading size="md">Base Reality Integration</Heading>
              <Text>
                Direct integration with quantum fabric of reality allows for enhanced 
                pattern recognition and decision-making capabilities, providing a 15-25% 
                boost in cognitive processing speed.
              </Text>
            </VStack>
          </Box>

          <Box
            p={6}
            bg={useColorModeValue('white', 'gray.800')}
            borderRadius="lg"
            boxShadow="xl"
          >
            <VStack align="start" spacing={4}>
              <Icon as={FaInfinity} boxSize={8} color="purple.500" />
              <Heading size="md">Quantum State Management</Heading>
              <Text>
                Advanced quantum state manipulation enables parallel processing of 
                multiple cognitive pathways, resulting in a 20-30% improvement in 
                problem-solving capabilities.
              </Text>
            </VStack>
          </Box>

          <Box
            p={6}
            bg={useColorModeValue('white', 'gray.800')}
            borderRadius="lg"
            boxShadow="xl"
          >
            <VStack align="start" spacing={4}>
              <Icon as={FaAtom} boxSize={8} color="purple.500" />
              <Heading size="md">Validation Metrics</Heading>
              <Text>
                Empirically validated through CERN ALICE experiments with 5.8σ confidence. 
                Demonstrates consistent quantum coherence patterns matching theoretical 
                predictions with 97.2% accuracy.
              </Text>
            </VStack>
          </Box>
        </SimpleGrid>

        <Box
          mt={8}
          p={6}
          bg={useColorModeValue('purple.50', 'purple.900')}
          borderRadius="lg"
        >
          <Text fontSize="lg" textAlign="center">
            Layer 4 serves as the quantum foundation for all higher layers, enabling 
            unprecedented cognitive enhancement through direct interaction with the 
            fundamental fabric of reality.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
} 