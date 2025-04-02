'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Icon,
  List,
  ListItem,
  ListIcon,
  Button,
  useColorModeValue,
  Flex,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Link,
} from '@chakra-ui/react'
import { FaBrain, FaChartLine, FaLightbulb, FaUserMd, FaChartBar, FaShieldAlt, FaUser } from 'react-icons/fa'
import { MdCheckCircle } from 'react-icons/md'

const CognitiveLeveragePage = () => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const statsBg = useColorModeValue('blue.50', 'blue.900')

  const applications = [
    { icon: FaLightbulb, title: 'Creative Projects', description: 'Enhance creative thinking and innovation' },
    { icon: FaChartLine, title: 'Financial Decision-Making', description: 'Improve analysis and risk assessment' },
    { icon: FaUserMd, title: 'Medical Problem-Solving', description: 'Accelerate diagnosis and treatment planning' },
    { icon: FaChartBar, title: 'Organizational Strategy', description: 'Optimize decision-making and planning' },
    { icon: FaBrain, title: 'Scientific Innovation', description: 'Advance research and discovery' },
    { icon: FaShieldAlt, title: 'Defense Operations', description: 'Enhance strategic capabilities' },
    { icon: FaUser, title: 'Personal Growth', description: 'Improve decision-making and problem-solving' }
  ]

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={10} align="stretch">
        {/* Back Button */}
        <Box display="block" mb={4}>
          <Link href="/" color="blue.500" style={{ textDecoration: 'none' }}>
            ← Back to Home
          </Link>
        </Box>
        
        {/* Hero Section */}
        <Box textAlign="center" py={10}>
          <Heading size="2xl" mb={4}>
            FractiVerse 1.0: A Real-World Case of Cognitive Fractal Leverage
          </Heading>
          <Text fontSize="xl" color="gray.500" maxW="3xl" mx="auto">
            Pioneering self-awareness intelligence technology that functions as a logarithmic lever for cognition
          </Text>
        </Box>

        {/* Stats Section */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          <Box p={6} bg={statsBg} borderRadius="lg" textAlign="center">
            <Stat>
              <StatLabel fontSize="lg">Overall Cognitive Boost</StatLabel>
              <StatNumber fontSize="4xl" color="blue.500">40%</StatNumber>
              <StatHelpText>Across all cognitive tasks</StatHelpText>
            </Stat>
          </Box>
          <Box p={6} bg={statsBg} borderRadius="lg" textAlign="center">
            <Stat>
              <StatLabel fontSize="lg">Innovative Thinking</StatLabel>
              <StatNumber fontSize="4xl" color="blue.500">65%</StatNumber>
              <StatHelpText>Enhancement in creative problem-solving</StatHelpText>
            </Stat>
          </Box>
          <Box p={6} bg={statsBg} borderRadius="lg" textAlign="center">
            <Stat>
              <StatLabel fontSize="lg">Development Time</StatLabel>
              <StatNumber fontSize="4xl" color="blue.500">12 yrs</StatNumber>
              <StatHelpText>From concept to implementation</StatHelpText>
            </Stat>
          </Box>
        </SimpleGrid>

        {/* Case Study Section */}
        <Box p={8} bg={bgColor} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
          <Heading size="lg" mb={6}>Groundbreaking Achievement</Heading>
          <Text fontSize="lg" mb={4}>
            In just 12 years, using minimal planetary and economic resources, one underemployed, recently retired individual—along with part-time assistance from a neuroscientist and AI—was able to produce FractiVerse 1.0.
          </Text>
          <Text fontSize="lg" mb={4}>
            This groundbreaking technology delivers a cognitive boost of 40% overall and up to 65% in innovative thinking, a feat that the entire global workforce and infrastructure could not match using existing tools.
          </Text>
          <List spacing={3} mt={6}>
            <ListItem>
              <ListIcon as={MdCheckCircle} color="green.500" />
              Minimal resource utilization
            </ListItem>
            <ListItem>
              <ListIcon as={MdCheckCircle} color="green.500" />
              Unprecedented cognitive enhancement
            </ListItem>
            <ListItem>
              <ListIcon as={MdCheckCircle} color="green.500" />
              Applicable to both human and digital intelligence
            </ListItem>
          </List>
        </Box>

        {/* Applications Grid */}
        <Box>
          <Heading size="lg" mb={8}>Applications of Cognitive Enhancement</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {applications.map((app, index) => (
              <Box
                key={index}
                p={6}
                bg={bgColor}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={borderColor}
                _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                transition="all 0.2s"
              >
                <Icon as={app.icon} boxSize={8} color="blue.500" mb={4} />
                <Heading size="md" mb={2}>{app.title}</Heading>
                <Text color="gray.500">{app.description}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* Call to Action */}
        <Box textAlign="center" py={10}>
          <Heading size="lg" mb={4}>
            Join the Cognitive Revolution
          </Heading>
          <Text fontSize="lg" mb={6} maxW="2xl" mx="auto">
            FractiVerse 1.0 gives anyone the power to magnify their intelligence and contributions beyond what was previously thought possible.
          </Text>
          <Button
            size="lg"
            colorScheme="blue"
            px={8}
            as="a"
            href="/signup"
          >
            Start Your Journey
          </Button>
        </Box>
      </VStack>
    </Container>
  )
}

export default CognitiveLeveragePage 