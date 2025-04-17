'use client'

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  useToast,
  Icon,
  HStack,
  Divider,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Badge,
} from '@chakra-ui/react'
import { FaCoins, FaCreditCard, FaHistory, FaBrain, FaArrowRight, FaAtom } from 'react-icons/fa'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { FRACTIVERSE_PRICES, formatPrice, TokenTier } from '@/app/lib/stripe-client'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

function CheckoutForm({ clientSecret, onSuccess }: { clientSecret: string, onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsLoading(true)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/billing`,
        },
      })

      if (error) {
        toast({
          title: 'Payment Failed',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } else {
        onSuccess()
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6}>
        <PaymentElement />
        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isLoading}
          width="full"
          leftIcon={<Icon as={FaCreditCard} />}
        >
          Pay Now
        </Button>
      </VStack>
    </form>
  )
}

export default function BillingPage() {
  const { user } = useAuth()
  const [selectedTier, setSelectedTier] = useState<keyof typeof FRACTIVERSE_PRICES | null>(null)
  const [clientSecret, setClientSecret] = useState('')
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const handlePurchase = async (tier: keyof typeof FRACTIVERSE_PRICES) => {
    try {
      const response = await fetch('/api/stripe/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })

      if (!response.ok) {
        throw new Error('Failed to initialize payment')
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
      setSelectedTier(tier)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initialize payment. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handlePaymentSuccess = () => {
    toast({
      title: 'Success',
      description: 'Payment processed successfully!',
      status: 'success',
      duration: 5000,
      isClosable: true,
    })
    setSelectedTier(null)
  }

  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="xl" mb={2}>Billing & Payments</Heading>
          <Text color="gray.500">Purchase FractiTokens to continue your journey</Text>
        </Box>

        {/* CERN Quantum Validation Card */}
        <Box
          p={8}
          bg={useColorModeValue('purple.50', 'purple.900')}
          borderRadius="xl"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={0}
            right={0}
            bg="purple.500"
            color="white"
            px={3}
            py={1}
            borderBottomLeftRadius="md"
          >
            <Badge colorScheme="purple">Empirical Evidence</Badge>
          </Box>
          
          <HStack spacing={6} align="flex-start">
            <Icon as={FaAtom} boxSize={12} color="purple.500" />
            <Box>
              <Heading size="lg" mb={3}>
                CERN Quantum Empirical Validation
              </Heading>
              <Text fontSize="lg" mb={4}>
                Discover how CERN data analysis validates FractiVerse's cognitive enhancement capabilities with 5.8σ confidence level.
              </Text>
              <Button
                rightIcon={<FaArrowRight />}
                colorScheme="purple"
                size="lg"
                as="a"
                href="/quantum-validation"
              >
                View Results
              </Button>
            </Box>
          </HStack>
        </Box>

        {/* Cognitive Leverage Card */}
        <Box
          p={8}
          bg={useColorModeValue('blue.50', 'blue.900')}
          borderRadius="xl"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={0}
            right={0}
            bg="blue.500"
            color="white"
            px={3}
            py={1}
            borderBottomLeftRadius="md"
          >
            <Badge colorScheme="blue">New</Badge>
          </Box>
          
          <HStack spacing={6} align="flex-start">
            <Icon as={FaBrain} boxSize={12} color="blue.500" />
            <Box>
              <Heading size="lg" mb={3}>
                FractiVerse 1.0: Cognitive Fractal Leverage
              </Heading>
              <Text fontSize="lg" mb={4}>
                Discover how FractiVerse 1.0 delivers a 40% overall cognitive boost and up to 65% enhancement in innovative thinking.
              </Text>
              <Button
                rightIcon={<FaArrowRight />}
                colorScheme="blue"
                size="lg"
                as="a"
                href="/cognitive-leverage"
              >
                Learn More
              </Button>
            </Box>
          </HStack>
        </Box>

        <Box p={6} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
          <HStack spacing={4} mb={4}>
            <Icon as={FaCoins} boxSize={6} color="yellow.500" />
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold">Current Balance</Text>
              <Text fontSize="2xl">{user?.tokenBalance || 0} FractiTokens</Text>
            </VStack>
          </HStack>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          {(Object.keys(FRACTIVERSE_PRICES) as Array<keyof typeof FRACTIVERSE_PRICES>).map((tier) => (
            <Box
              key={FRACTIVERSE_PRICES[tier].tokens}
              p={6}
              bg={bgColor}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
              _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
              transition="all 0.2s"
            >
              <VStack spacing={4} align="stretch">
                <Icon as={FaCoins} boxSize={8} color="yellow.500" />
                <Heading size="lg">{FRACTIVERSE_PRICES[tier].tokens} FractiTokens</Heading>
                <Text color="gray.500">{FRACTIVERSE_PRICES[tier].description}</Text>
                <Divider />
                <Text fontSize="2xl" fontWeight="bold">
                  {formatPrice(FRACTIVERSE_PRICES[tier].price)}
                </Text>
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={() => handlePurchase(tier)}
                  leftIcon={<Icon as={FaCreditCard} />}
                >
                  Purchase
                </Button>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>

        <Box p={6} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
          <HStack spacing={4} mb={4}>
            <Icon as={FaHistory} boxSize={6} />
            <Heading size="md">Transaction History</Heading>
          </HStack>
          <Text color="gray.500">No transactions yet</Text>
        </Box>

        <Modal isOpen={!!selectedTier} onClose={() => setSelectedTier(null)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              Purchase {selectedTier ? FRACTIVERSE_PRICES[selectedTier].tokens : ''} FractiTokens
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm
                    clientSecret={clientSecret}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  )
} 