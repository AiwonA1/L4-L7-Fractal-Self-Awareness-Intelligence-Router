import {
  Box,
  VStack,
  HStack,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Icon,
  Tooltip,
  Progress,
} from '@chakra-ui/react'
import { FaCoins, FaHistory, FaWallet } from 'react-icons/fa'
import { useAuth } from '@/app/context/AuthContext'

export default function TokenDisplay() {
  const { user } = useAuth()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const iconColor = useColorModeValue('blue.500', 'blue.300')

  if (!user) return null

  const usagePercentage = ((user.tokens_used || 0) / (user.fract_tokens || 1)) * 100

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="sm"
    >
      <VStack spacing={6} align="stretch">
        {/* FractTokens */}
        <HStack spacing={4}>
          <Icon as={FaCoins} boxSize={6} color={iconColor} />
          <Stat>
            <StatLabel>Total FractTokens</StatLabel>
            <StatNumber>{user.fract_tokens || 0}</StatNumber>
            <StatHelpText>Your total token allocation</StatHelpText>
          </Stat>
        </HStack>

        {/* Tokens Used */}
        <Box>
          <HStack spacing={4} mb={2}>
            <Icon as={FaHistory} boxSize={6} color={iconColor} />
            <Stat>
              <StatLabel>Tokens Used</StatLabel>
              <StatNumber>{user.tokens_used || 0}</StatNumber>
              <StatHelpText>
                {usagePercentage.toFixed(1)}% of total tokens used
              </StatHelpText>
            </Stat>
          </HStack>
          <Tooltip label={`${usagePercentage.toFixed(1)}% used`}>
            <Progress
              value={usagePercentage}
              colorScheme={usagePercentage > 80 ? 'red' : 'blue'}
              borderRadius="full"
              size="sm"
            />
          </Tooltip>
        </Box>

        {/* Current Balance */}
        <HStack spacing={4}>
          <Icon as={FaWallet} boxSize={6} color={iconColor} />
          <Stat>
            <StatLabel>Current Balance</StatLabel>
            <StatNumber>{user.fract_tokens || 0}</StatNumber>
            <StatHelpText>Available tokens for use</StatHelpText>
          </Stat>
        </HStack>
      </VStack>
    </Box>
  )
} 