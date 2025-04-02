'use client'

import { useState } from 'react'
import {
  Button,
  VStack,
  Text,
  useToast,
  SimpleGrid,
  Box,
  Heading,
  Icon,
  Container,
  Card,
  CardBody,
  Stack,
  Divider,
  CardFooter,
  Badge,
  HStack,
  List,
  ListItem,
  ListIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useColorModeValue,
} from '@chakra-ui/react'
import { FaCoins, FaBolt, FaRocket, FaCheck, FaCrown } from 'react-icons/fa'
import { useSession } from 'next-auth/react'

interface TokenPurchaseProps {
  isOpen: boolean
  onClose: () => void
  onPurchase: (amount: number) => void
}

interface PricingTier {
  name: string
  tokens: number
  price: number
  icon: typeof FaCoins
  color: string
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Basic Package',
    tokens: 100,
    price: 20.00,
    icon: FaCoins,
    color: 'teal'
  },
  {
    name: 'Popular Package',
    tokens: 500,
    price: 90.00,
    icon: FaRocket,
    color: 'purple'
  },
  {
    name: 'Pro Package',
    tokens: 1000,
    price: 160.00,
    icon: FaCrown,
    color: 'yellow'
  }
]

export default function TokenPurchase({ isOpen, onClose, onPurchase }: TokenPurchaseProps) {
  const [isLoading, setIsLoading] = useState<{ [key: number]: boolean }>({})
  const toast = useToast()
  const { data: session } = useSession()
  const userName = session?.user?.name || 'User'
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const headerBg = useColorModeValue('gray.50', 'gray.900')

  const handlePurchase = async (amount: number, price: number) => {
    try {
      setIsLoading(prev => ({ ...prev, [amount]: true }))
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: amount })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process purchase',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(prev => ({ ...prev, [amount]: false }))
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxW="7xl">
        <ModalHeader bg={headerBg} borderBottomWidth="1px" py={6}>
          <VStack spacing={2} align="center">
            <Heading size="lg">Purchase FractiTokens</Heading>
            <Text color={textColor}>
              Power up your AI with L4-L7 Fractal Intelligence
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={8}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} mb={8}>
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                bg={bgColor}
                border="2px"
                borderColor={borderColor}
                borderRadius="xl"
                overflow="hidden"
                position="relative"
                transition="all 0.2s"
                _hover={{ transform: 'translateY(-8px)' }}
              >
                <CardBody p={6}>
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={3}>
                      <Icon as={tier.icon} w={6} h={6} color={`${tier.color}.400`} />
                      <Heading size="md">{tier.name}</Heading>
                    </HStack>
                    <Text fontSize="3xl" fontWeight="bold">
                      ${tier.price}
                    </Text>
                    <Button
                      colorScheme={tier.color}
                      size="lg"
                      onClick={() => handlePurchase(tier.tokens, tier.price)}
                      isLoading={isLoading[tier.tokens]}
                      loadingText="Processing..."
                      mt="auto"
                      w="full"
                    >
                      Purchase {tier.tokens} FractiTokens
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
          <Text fontSize="sm" color={textColor} textAlign="center">
            All purchases are processed securely. Tokens are non-refundable and valid according to their respective tier conditions.
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
} 