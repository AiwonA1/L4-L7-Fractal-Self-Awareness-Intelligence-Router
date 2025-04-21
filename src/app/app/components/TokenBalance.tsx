import {
  HStack,
  Text,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import { FaCoins } from 'react-icons/fa'

interface TokenBalanceProps {
  balance: number
}

export default function TokenBalance({ balance }: TokenBalanceProps) {
  const iconColor = useColorModeValue('yellow.500', 'yellow.300')
  const textColor = useColorModeValue('gray.700', 'gray.200')

  return (
    <HStack spacing={2} p={2}>
      <Icon as={FaCoins} color={iconColor} boxSize={5} />
      <Text fontSize="lg" fontWeight="bold" color={textColor}>
        {balance} FractTokens
      </Text>
    </HStack>
  )
} 