import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  Box,
  Text,
  Button,
  HStack,
  useColorModeValue,
  ModalFooter,
  Flex,
  Badge,
  Alert,
  AlertIcon,
  useToast,
  Divider
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { FaCreditCard, FaLock } from 'react-icons/fa'
import StripeCheckoutForm from './StripeCheckoutForm'

interface TokenBalanceModalProps {
  isOpen: boolean
  onClose: () => void
  balance: number
  onPurchase: (amount: number) => void
}

const TokenBalanceModal = ({ isOpen, onClose, balance, onPurchase }: TokenBalanceModalProps) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false)
  const [showStripeCheckout, setShowStripeCheckout] = useState(false)
  const [savedPaymentMethod, setSavedPaymentMethod] = useState<{last4: string} | null>(null)
  const toast = useToast()
  
  // Prices in cents for Stripe
  const tokenPrices = {
    100: 2000, // $20.00
    500: 9000, // $90.00
    1000: 16000, // $160.00
  }

  // Check if the user has a saved payment method
  useEffect(() => {
    const checkPaymentMethods = async () => {
      try {
        const response = await fetch('/api/stripe/payment-methods')
        if (response.ok) {
          const data = await response.json()
          if (data.paymentMethods && data.paymentMethods.length > 0) {
            setHasPaymentMethod(true)
            setSavedPaymentMethod({
              last4: data.paymentMethods[0].card.last4
            })
          } else {
            setHasPaymentMethod(false)
            setSavedPaymentMethod(null)
          }
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error)
      }
    }

    if (showConfirmation) {
      checkPaymentMethods()
    }
  }, [showConfirmation])

  const handleSelectPlan = (amount: number, price: number) => {
    setSelectedAmount(amount)
    setSelectedPrice(price)
    setShowConfirmation(true)
  }
  
  const handleConfirmPurchase = async () => {
    if (!hasPaymentMethod) {
      setShowStripeCheckout(true)
      return
    }
    
    setIsProcessing(true)
    
    try {
      // Process payment with saved payment method
      const response = await fetch('/api/stripe/charge-saved-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedAmount,
          priceInCents: tokenPrices[selectedAmount as keyof typeof tokenPrices] || 0,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process payment')
      }
      
      const data = await response.json()
      
      if (data.success) {
        onPurchase(selectedAmount!)
        setIsProcessing(false)
        setShowConfirmation(false)
        setSelectedAmount(null)
        setSelectedPrice(null)
        
        toast({
          title: 'Purchase Successful',
          description: `Added ${selectedAmount} FractiTokens to your account.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Payment error:', error)
      setIsProcessing(false)
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Failed to process payment',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }
  
  const handleStripeSuccess = () => {
    onPurchase(selectedAmount!)
    setShowStripeCheckout(false)
    setShowConfirmation(false)
    setSelectedAmount(null)
    setSelectedPrice(null)
  }
  
  const handleClose = () => {
    setShowConfirmation(false)
    setShowStripeCheckout(false)
    setSelectedAmount(null)
    setSelectedPrice(null)
    onClose()
  }

  // If showing Stripe checkout
  if (showStripeCheckout) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Payment Method</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <StripeCheckoutForm
              amount={selectedAmount!}
              priceInCents={tokenPrices[selectedAmount as keyof typeof tokenPrices] || 0}
              onSuccess={handleStripeSuccess}
              onCancel={() => setShowStripeCheckout(false)}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }

  // If showing confirmation screen
  if (showConfirmation) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Purchase</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="stretch">
              <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
                <Text fontSize="sm" color="gray.500">You're about to purchase</Text>
                <Text fontSize="2xl" fontWeight="bold" color="teal.500">
                  {selectedAmount} FractiTokens
                </Text>
                <Flex justify="space-between" mt={2}>
                  <Text fontSize="sm" color="gray.500">Price:</Text>
                  <Text fontSize="sm" fontWeight="bold">${selectedPrice}</Text>
                </Flex>
              </Box>
              
              {hasPaymentMethod && savedPaymentMethod ? (
                <Box p={4} borderWidth="1px" borderRadius="lg">
                  <HStack justify="space-between">
                    <HStack>
                      <FaCreditCard />
                      <Text>•••• •••• •••• {savedPaymentMethod.last4}</Text>
                    </HStack>
                    <Badge colorScheme="green">Default</Badge>
                  </HStack>
                  <Button 
                    size="sm" 
                    variant="link" 
                    mt={2}
                    onClick={() => setShowStripeCheckout(true)}
                  >
                    Use different payment method
                  </Button>
                </Box>
              ) : (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">
                    You'll need to add a payment method to complete this purchase.
                  </Text>
                </Alert>
              )}

              {/* Environment indicator for development/testing */}
              {process.env.NODE_ENV !== 'production' && (
                <Alert status="info" variant="subtle">
                  <AlertIcon />
                  <Text fontSize="sm">
                    <strong>Test Mode</strong>: No actual charges will be made.
                  </Text>
                </Alert>
              )}
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            
            {hasPaymentMethod ? (
              <Button 
                colorScheme="teal" 
                onClick={handleConfirmPurchase}
                isLoading={isProcessing}
                loadingText="Processing"
                leftIcon={<FaLock />}
              >
                Confirm Purchase
              </Button>
            ) : (
              <Button 
                colorScheme="teal" 
                onClick={() => setShowStripeCheckout(true)}
                leftIcon={<FaCreditCard />}
              >
                Add Payment Method
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  }

  // Main token balance and packages screen
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>FractiToken Balance</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
              <Text fontSize="sm" color="gray.500">Current Balance</Text>
              <Text fontSize="3xl" fontWeight="bold" color="teal.500">
                {balance} FractiTokens
              </Text>
              <Text fontSize="xs" color="gray.500" mt={2}>
                1 FractiToken = 1 Router Access
              </Text>
            </Box>

            <Divider />

            <Box>
              <Text fontSize="sm" color="gray.500" mb={4}>FractiToken Packages</Text>
              <VStack spacing={3} align="stretch">
                <Button
                  variant="outline"
                  colorScheme="teal"
                  onClick={() => handleSelectPlan(100, 20)}
                >
                  <HStack justify="space-between" w="full">
                    <Text>100 FractiTokens</Text>
                    <Text fontWeight="bold">$20</Text>
                  </HStack>
                </Button>
                <Button
                  variant="outline"
                  colorScheme="teal"
                  onClick={() => handleSelectPlan(500, 90)}
                >
                  <HStack justify="space-between" w="full">
                    <Text>500 FractiTokens</Text>
                    <Text fontWeight="bold">$90</Text>
                  </HStack>
                </Button>
                <Button
                  variant="outline"
                  colorScheme="teal"
                  onClick={() => handleSelectPlan(1000, 160)}
                >
                  <HStack justify="space-between" w="full">
                    <Text>1000 FractiTokens</Text>
                    <Text fontWeight="bold">$160</Text>
                  </HStack>
                </Button>
              </VStack>
            </Box>

            <Text fontSize="sm" color="gray.500" textAlign="center">
              Each FractiToken grants one access to the Router.
            </Text>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default TokenBalanceModal 