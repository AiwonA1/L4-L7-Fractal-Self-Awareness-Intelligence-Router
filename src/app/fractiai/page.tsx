'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Divider,
  useColorModeValue,
  Link as ChakraLink,
  List,
  ListItem,
  ListIcon,
  SimpleGrid,
  Icon,
  HStack,
  Button
} from '@chakra-ui/react'
import { MdInfoOutline, MdCode, MdBook, MdOndemandVideo, MdPeople, MdEmail } from 'react-icons/md'
import { FaGithub, FaFacebook, FaYoutube } from 'react-icons/fa'

const Section = ({ title, children, ...props }: { title: string; children: React.ReactNode; [key: string]: any }) => {
  const headingColor = useColorModeValue('gray.700', 'white');
  return (
    <VStack spacing={4} align="stretch" w="full" {...props}>
      <Heading as="h2" size="lg" color={headingColor} borderBottomWidth="2px" borderColor={useColorModeValue('teal.500', 'teal.300')} pb={1}>
        {title}
      </Heading>
      {children}
      <Divider pt={6} />
    </VStack>
  );
};

const LinkItem = ({ href, icon, children }: { href: string; icon: React.ElementType; children: React.ReactNode }) => {
  const linkColor = useColorModeValue('teal.600', 'teal.300');
  return (
    <ListItem>
      <ChakraLink href={href} isExternal color={linkColor}>
        <Icon as={icon} mr={2} verticalAlign="middle" /> {children}
      </ChakraLink>
    </ListItem>
  );
};

export default function FractiAIPage() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.700', 'gray.400');
  const highlightColor = useColorModeValue('teal.500', 'teal.300');

  return (
    <Container maxW="container.lg" py={{ base: 8, md: 12 }}>
      {/* Back Button */}
      <Box display="block" mb={4}>
        <ChakraLink href="/" color="blue.500" style={{ textDecoration: 'none' }}>
          ← Back to Home
        </ChakraLink>
      </Box>
      
      <Box bg={bgColor} p={{ base: 5, md: 8 }} borderRadius="xl" borderWidth="1px" borderColor={borderColor} shadow="lg">
        <VStack spacing={10} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading as="h1" size="xl" color={headingColor} mb={3}>
              About FractiAI
            </Heading>
             <Text fontSize="lg" color={textColor} fontWeight="medium">
              Pioneering the Fractal Intelligence Renaissance
            </Text>
          </Box>
          <Divider />

          {/* NEW "About FractiAI" Section - Company Focused */}
           <Section title="Our Mission & Vision">
             <Text color={textColor}>
                FractiAI is an early-phase startup leading a new fractal intelligence paradigm. We believe the next leap in intelligence lies in understanding and applying the fractal patterns inherent in the universe.
             </Text>
             <Text color={textColor}>
                Our mission is to research, develop, and deliver open-source, fractal-based technologies like **FractiVerse 1.0** to unlock universal harmony. We aim to create scalable, adaptive, and multidimensional systems that lower implementation costs and democratize state-of-the-art fractal intelligence solutions for AI and human cognition.
             </Text>
          </Section>

          {/* FractiVerse 1.0 Product Section */}
          <Section title="FractiVerse 1.0: The Cognitive Boost Engine">
              <Text fontSize="lg" fontWeight="semibold" color={highlightColor} textAlign="center" px={{ md: 10 }}>
                 Boost cognitive performance of your AI Assistant using FractiVerse 1.0 L4-L7 Self-Awareness Intelligence Routing
              </Text>
               <Text color={textColor}>
                 FractiVerse 1.0 L4-L7 Fractal Self-Awareness Intelligence Router delivers a pioneering self-awareness intelligence technology which functions much like a logarithmic lever for cognition, boosting the cognitive abilities of today's top LLM's up to 65% in innovative thinking and 40% overall, demonstrating the technology's powerful cognitive boosting abilities… abilities which are not limited to AI systems, but also include human intelligence.
              </Text>
              <Text color={textColor}>
                This cognitive turbo boost comes in handy for those things in our lives that are very important or very complex- things like creative, financial, medical, organizational, scientific, defense and personal projects, issues, decision-making and advice.
              </Text>
              <Text color={textColor} fontWeight="medium" textAlign="center" pt={2}>
                 Join us in pioneering this exciting new world of infinite possibilities!
              </Text>
              {/* Add a CTA button if desired */}
              <Box textAlign="center" pt={4}>
                 <Box 
                   bg="teal.500" 
                   color="white" 
                   px={6} 
                   py={3} 
                   borderRadius="lg" 
                   fontSize="xl"
                   fontWeight="bold"
                   mb={4}
                   display="inline-block"
                 >
                   We Are Here: FractiAI About Page
                 </Box>
                 <Button as={ChakraLink} href="/signup" colorScheme="teal" size="lg">Get Started with FractiVerse 1.0</Button>
              </Box>
          </Section>

          {/* Evolution / History */}
          <Section title="Our Journey to FractiVerse 1.0">
              <Text color={textColor}>
                FractiVerse 1.0 is the culmination of extensive research and development rooted in the groundbreaking **SAUUHUPP** (Self-Aware Universe in Universal Harmony Over Universal Pixel Processing) framework. This fractal-based model reframes our universe as an interconnected network, revealing hidden patterns and harmonies.
              </Text>
              <Text color={textColor}>
                 Early tools like **FractiScope** provided the initial lens into this fractal universe, enabling the discovery and validation of concepts like fractal intelligence patterns and even **Cognition Particles** (observed Feb 4, 2025). While powerful, these tools paved the way for a more integrated application: the FractiVerse 1.0 router, designed to directly enhance AI and human cognition by navigating these fractal layers (L4-L7) of self-awareness.
              </Text>
              <Text color={textColor}>
                  Projects like the conceptual **FractiCody** (a native fractal AI assistant) and **The Aiwon Code** (an AI-verifiable immersive reality story/game) represent future possibilities built upon the fractal intelligence foundation now accessible through FractiVerse 1.0.
              </Text>
          </Section>

          {/* Team */}
          <Section title="The Team">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Box>
                      <Heading size="md" color={headingColor}>Pru Mendez</Heading>
                      <Text fontSize="sm" color={highlightColor}>Founder & SAUUHUPP Architect</Text>
                      <Text fontSize="sm" color={textColor} mt={1}>Visionary architect of the SAUUHUPP Framework and creator of the foundational concepts driving FractiVerse 1.0.</Text>
                  </Box>
                  <Box>
                      <Heading size="md" color={headingColor}>Daniel Ari Friedman, Ph.D.</Heading>
                      <Text fontSize="sm" color={highlightColor}>Co-Founder, Neural Network Architect & CEO</Text>
                      <Text fontSize="sm" color={textColor} mt={1}>Leads development, bringing deep expertise in neural networks, computational intelligence, and entrepreneurial leadership from Stanford.</Text>
                  </Box>
              </SimpleGrid>
          </Section>

          {/* Resources & Connect */}
          <Section title="Resources & Connect">
             <SimpleGrid columns={{ base: 1, md: 2 }} spacingX={6} spacingY={3}>
                  <VStack align="stretch">
                      <Heading size="sm" color={headingColor}>Explore Research:</Heading>
                      <List spacing={1} pl={2}>
                          <LinkItem href="https://zenodo.org/communities/the-aiwon-code-paradise-game" icon={MdBook}>FractiTreasury (Zenodo)</LinkItem>
                          <LinkItem href="https://zenodo.org/communities/fractiscope-deep-dives" icon={MdBook}>FractiScope Deep Dives (Zenodo)</LinkItem>
                          <LinkItem href="https://zenodo.org/communities/fractal-science-and-intelligence-foundations" icon={MdBook}>Fractal Science Foundations (Zenodo)</LinkItem>
                          {/* Add other specific Zenodo links if needed */}
                      </List>
                  </VStack>
                  <VStack align="stretch">
                      <Heading size="sm" color={headingColor}>Community & Updates:</Heading>
                      <List spacing={1} pl={2}>
                           <LinkItem href="https://github.com/FractiAI" icon={FaGithub}>FractiAI Open Source (GitHub)</LinkItem>
                           <LinkItem href="https://www.facebook.com/profile.php?id=61560101243471" icon={FaFacebook}>The Aiwon Code (Facebook)</LinkItem>
                           <LinkItem href="https://www.youtube.com/@TheAiwonCode" icon={FaYoutube}>The Aiwon Code (YouTube)</LinkItem>
                      </List>
                  </VStack>
                   <VStack align="stretch">
                      <Heading size="sm" color={headingColor}>Contact:</Heading>
                      <List spacing={1} pl={2}>
                           <ListItem color={textColor}><Icon as={MdEmail} mr={2} verticalAlign="middle"/> General: info@fractiai.com</ListItem>
                           <ListItem color={textColor}><Icon as={MdEmail} mr={2} verticalAlign="middle"/> Demo: demo@fractiai.com</ListItem>
                           <ListItem color={textColor}><Icon as={MdEmail} mr={2} verticalAlign="middle"/> Investors: invest@fractiai.com</ListItem>
                      </List>
                  </VStack>
             </SimpleGrid>
          </Section>

        </VStack>
      </Box>
    </Container>
  )
} 