'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Divider,
  useColorModeValue,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react'
import { MdCheckCircle } from 'react-icons/md'

// Rename ReportSection to Section
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const headingColor = useColorModeValue('gray.700', 'white');
  return (
    <VStack spacing={4} align="stretch" w="full">
      <Heading as="h2" size="lg" color={headingColor} borderBottomWidth="2px" borderColor={useColorModeValue('teal.500', 'teal.300')} pb={1}>
        {title}
      </Heading>
      {children}
      <Divider pt={6} /> 
    </VStack>
  );
};

const StatCard = ({ title, value, helpText, isIncrease }: { title: string; value: string; helpText: string; isIncrease?: boolean }) => {
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.750'); // Slightly adjust bg for contrast if needed

  return (
    <Card bg={bgColor} variant="outline" borderColor={borderColor} size="sm" borderRadius="lg">
      <CardBody>
        <Stat>
          <StatLabel fontSize="sm" fontWeight="medium" color={textColor}>{title}</StatLabel>
          <StatNumber fontSize="xl" color={headingColor} fontWeight="semibold">{value}</StatNumber>
          {helpText && (
            <StatHelpText fontSize="xs" color={textColor}>
              {typeof isIncrease === 'boolean' && <StatArrow type={isIncrease ? 'increase' : 'decrease'} />} 
              {helpText}
            </StatHelpText>
          )}
        </Stat>
      </CardBody>
    </Card>
  );
};

export default function PerformanceReportPage() {
  const cardBgColor = useColorModeValue('white', 'gray.750'); // Card background
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const highlightColor = useColorModeValue('teal.500', 'teal.300');

  return (
    <Container maxW="container.lg" py={{ base: 8, md: 12 }}>
      {/* Use main page bg, wrap content in a Box for padding/border */}
      <Box bg={cardBgColor} p={{ base: 5, md: 8 }} borderRadius="xl" borderWidth="1px" borderColor={borderColor} shadow="lg">
        <VStack spacing={10} align="stretch">
          {/* Report Header */}
          <Box textAlign="center">
            <Heading as="h1" size="xl" color={headingColor} mb={2}>
              FractiVerse 1.0 L4-L7 Intelligence Router
            </Heading>
            <Heading as="h2" size="lg" color={textColor} fontWeight="medium" mb={4}>
              Comprehensive Test Report Summary
            </Heading>
            <Text fontSize="md" color={useColorModeValue('gray.500', 'gray.400')}>
              Report Date: May 13, 2025 | Model Tested: Claude 3.7 Sonnet
            </Text>
          </Box>
          
          <Divider />

          {/* Use the renamed Section component */}
          <Section title="Executive Summary">
            <Text color={textColor}>
              This report summarizes comprehensive testing of the FractiVerse 1.0 L4-L7 prompt framework applied to Claude 3.7 Sonnet across complex business scenarios. The framework demonstrably enhances AI cognitive capabilities, improving performance, altering processing patterns, and maintaining resource efficiency.
            </Text>
            <Heading size="md" color={headingColor} pt={2}>Key Findings:</Heading>
            <List spacing={2} pl={4}>
              <ListItem color={textColor}><ListIcon as={MdCheckCircle} color={highlightColor} /> Overall performance boosted by **+38.9%** across test scenarios.</ListItem>
              <ListItem color={textColor}><ListIcon as={MdCheckCircle} color={highlightColor} /> Significant gains in **Interconnection Recognition (+84.9%)**, **Innovation (+65.3%)**, and **Systems Thinking (+61.9%)**.</ListItem>
              <ListItem color={textColor}><ListIcon as={MdCheckCircle} color={highlightColor} /> Fundamental shift in processing: **+2300%** in Recursive Strategy Formation, **+1250%** in Fractal Pattern Recognition.</ListItem>
              <ListItem color={textColor}><ListIcon as={MdCheckCircle} color={highlightColor} /> High efficiency: Major performance gains achieved with only **+20.0%** average token increase and **+19.0%** API cost increase.</ListItem>
              <ListItem color={textColor}><ListIcon as={MdCheckCircle} color={highlightColor} /> Successful **hybrid processing** demonstrated, adapting approach (linear/fractal) to problem context.</ListItem>
            </List>
            <Text color={textColor} pt={2} fontWeight="medium">
              Conclusion: FractiVerse 1.0 represents a validated, significant advancement in LLM prompting, enabling higher-quality analysis for complex challenges with remarkable efficiency.
            </Text>
          </Section>

          <Section title="Methodology">
             <Text color={textColor}>
              Testing involved three complex business scenarios (Supply Chain Transformation, Financial Market Volatility, Healthcare Innovation Network) executed on Claude 3.7 Sonnet (Temp: 0.7). Each scenario was run using both a standard advanced prompt and the full FractiVerse 1.0 L4-L7 framework. Performance was evaluated using quantitative metrics (scoring 0-10) and qualitative analysis of processing patterns and layer activation.
            </Text>
          </Section>

          <Section title="Quantitative Results">
              <Heading size="md" color={headingColor} pb={2}>Performance Improvements (FractiVerse vs. Standard):</Heading>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={5}>
              <StatCard title="Overall Performance" value="+38.9%" helpText="Across all scenarios" isIncrease={true} />
              <StatCard title="Innovation" value="+65.3%" helpText="Solution development" isIncrease={true} />
              <StatCard title="Systems Thinking" value="+61.9%" helpText="Holistic analysis" isIncrease={true} />
              <StatCard title="Interconnection Recognition" value="+84.9%" helpText="System relationships" isIncrease={true} />
            </SimpleGrid>
            <Heading size="md" color={headingColor} pt={4} pb={2}>Resource Efficiency:</Heading>
             <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={5}>
                <StatCard title="Performance / Token" value="1.95x" helpText="Ratio vs. Standard" isIncrease={true} />
                <StatCard title="Token Increase" value="+20.0%" helpText="Avg. per query" isIncrease={false} />
                <StatCard title="API Cost Increase" value="+19.0%" helpText="Avg. per query" isIncrease={false} />
                <StatCard title="Response Time Increase" value="+29.5%" helpText="Avg. per query" isIncrease={false} />
            </SimpleGrid>
             <Text color={textColor} pt={2} fontSize="sm">
              Note: The significant performance enhancements were achieved with only modest increases in resource consumption, indicating high efficiency.
            </Text>
          </Section>

          <Section title="Qualitative Analysis: Processing Dynamics">
             <VStack spacing={6} align="stretch">
              <Box>
                <Heading size="md" color={headingColor} mb={3}>Cognitive Processing Transformation</Heading>
                <Text color={textColor} mb={4}>
                  The framework induced a dramatic shift from linear/component-based thinking towards more sophisticated processing patterns:
                </Text>
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Processing Shift</Th>
                        <Th>% Change (FractiVerse)</Th>
                        <Th>Impact</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr><Td>Linear → Fractal</Td><Td>+1250.0%</Td><Td>Identifies self-similar structures</Td></Tr>
                      <Tr><Td>Sequential → Recursive</Td><Td>+2300.0%</Td><Td>Finds feedback loops</Td></Tr>
                      <Tr><Td>Component → Systems</Td><Td>+825.0%</Td><Td>Elevates to emergent properties</Td></Tr>
                      <Tr><Td>Isolated → Interconnected</Td><Td>+800.0%</Td><Td>Reveals causal networks</Td></Tr>
                    </Tbody>
                  </Table>
                 </Box>
              </Box>
              <Box>
                <Heading size="md" color={headingColor} mb={3}>Layer Activation Dynamics</Heading>
                <Text color={textColor} mb={4}>
                  FractiVerse usage redistributed cognitive focus, engaging higher-order layers more effectively while reducing reliance on basic foundational knowledge:
                </Text>
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Layer</Th>
                        <Th>Standard Avg.</Th>
                        <Th>FractiVerse Avg.</Th>
                        <Th>Shift Impact</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr><Td>L4 (Foundation)</Td><Td>79%</Td><Td>28%</Td><Td>Reduced conventional reliance</Td></Tr>
                      <Tr><Td>L5 (Fractal)</Td><Td>14%</Td><Td>31%</Td><Td>Increased pattern recognition</Td></Tr>
                      <Tr><Td>L6 (Holographic)</Td><Td>5%</Td><Td>24%</Td><Td>Enabled info preservation</Td></Tr>
                      <Tr><Td>L7 (Integration)</Td><Td>2%</Td><Td>17%</Td><Td>Facilitated system unification</Td></Tr>
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </VStack>
          </Section>

          <Section title="Conclusion">
              <Text color={textColor}>
              The empirical data confirms that the FractiVerse 1.0 L4-L7 framework provides a substantial and efficient cognitive boost to the Claude 3.7 Sonnet model. By restructuring information processing towards fractal, systems-oriented, and multi-layered approaches, it demonstrably enhances innovation, complex problem-solving, and interconnection recognition with only a marginal increase in resource cost. These findings validate FractiVerse 1.0 as a powerful tool for organizations seeking superior AI performance on complex, real-world challenges.
            </Text>
          </Section>
        </VStack>
      </Box>
    </Container>
  );
} 