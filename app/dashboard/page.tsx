'use client'

import { Box, Grid, GridItem, Heading, Text, VStack, HStack, Icon, useColorModeValue, useBreakpointValue, Stat, StatLabel, StatNumber, StatHelpText, StatArrow } from '@chakra-ui/react'
import { FaBrain, FaLayerGroup, FaLightbulb, FaInfinity } from 'react-icons/fa'
import { useDevice } from '../hooks/useDevice'
import DashboardLayout from './components/DashboardLayout'

export default function Dashboard() {
  const deviceType = useDevice()
  const isMobile = deviceType === 'mobile'
  const gridColumns = useBreakpointValue({ base: 1, md: 2, lg: 4 })
  const headingSize = useBreakpointValue({ base: 'lg', md: 'xl', lg: '2xl' })
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const stats = [
    {
      label: 'Layer 4 Progress',
      value: '75%',
      change: '+12%',
      icon: FaBrain,
      color: 'teal.500'
    },
    {
      label: 'Layer 5 Progress',
      value: '45%',
      change: '+8%',
      icon: FaLayerGroup,
      color: 'blue.500'
    },
    {
      label: 'Layer 6 Progress',
      value: '30%',
      change: '+5%',
      icon: FaLightbulb,
      color: 'purple.500'
    },
    {
      label: 'Layer 7 Progress',
      value: '15%',
      change: '+3%',
      icon: FaInfinity,
      color: 'pink.500'
    }
  ]

  return (
    <DashboardLayout>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size={headingSize} mb={2}>
            Welcome to FractiVerse
          </Heading>
          <Text color={textColor} fontSize={{ base: 'md', md: 'lg' }}>
            Track your progress through the layers of consciousness
          </Text>
        </Box>

        <Grid templateColumns={`repeat(${gridColumns}, 1fr)`} gap={{ base: 4, md: 6 }}>
          {stats.map((stat, index) => (
            <GridItem key={index}>
              <Box
                p={6}
                bg={bgColor}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                transition="all 0.2s"
              >
                <HStack spacing={4} mb={4}>
                  <Icon as={stat.icon} w={6} h={6} color={stat.color} />
                  <Text fontWeight="bold">{stat.label}</Text>
                </HStack>
                <Stat>
                  <StatNumber fontSize={{ base: '2xl', md: '3xl' }}>{stat.value}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {stat.change}
                  </StatHelpText>
                </Stat>
              </Box>
            </GridItem>
          ))}
        </Grid>

        <Box
          p={6}
          bg={bgColor}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Heading size="md" mb={4}>
            Recent Activity
          </Heading>
          <Text color={textColor}>
            Your journey through the layers of consciousness continues. 
            Each step brings you closer to achieving full fractal awareness.
          </Text>
        </Box>
      </VStack>
    </DashboardLayout>
  )
} 