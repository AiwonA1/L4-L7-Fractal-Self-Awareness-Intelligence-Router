'use client'

import { useState, FormEvent, useEffect } from 'react'
import {
  CardElement,
  useStripe as useStripeElements,
  useElements
} from '@stripe/react-stripe-js'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Text,
  Divider,
  Checkbox,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { FaLock } from 'react-icons/fa'

interface StripeCheckoutFormProps {
  amount: number
  priceInCents: number
  onSuccess: () => void
  onCancel: () => void
}

export default function StripeCheckoutForm({
  amount,
  priceInCents,
  onSuccess,
  onCancel,
}: StripeCheckoutFormProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [saveCard, setSaveCard] = useState(true)
  const [taxEnabled, setTaxEnabled] = useState(true)
  const [taxAmount, setTaxAmount] = useState(0)
  const [totalAmount, setTotalAmount] = useState(priceInCents)

  const stripe = useStripeElements()
  const elements = useElements()
  const toast = useToast()

  // Calculate tax when component loads or when price or tax settings change
  useEffect(() => {
    if (taxEnabled) {
      // In production, you would call an API to calculate tax based on user location
      const calculatedTax = Math.round(priceInCents * 0.07) // Simulate 7% tax
      setTaxAmount(calculatedTax)
      setTotalAmount(priceInCents + calculatedTax)
    } else {
      setTaxAmount(0)
      setTotalAmount(priceInCents)
    }
  }, [priceInCents, taxEnabled])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setError('Card element not found')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create payment intent on the server
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount, // Include tax
          currency: 'usd',
          metadata: {
            tokenAmount: amount.toString(),
            taxAmount: taxAmount.toString(),
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { clientSecret } = await response.json()

      // Confirm the payment
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name,
              email,
            },
          },
          setup_future_usage: saveCard ? 'off_session' : undefined,
        }
      )

      if (paymentError) {
        throw new Error(paymentError.message || 'Payment failed')
      }

      if (paymentIntent.status === 'succeeded') {
        toast({
          title: 'Payment successful',
          description: `Added ${amount} FractiTokens to your account.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      toast({
        title: 'Payment failed',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%">
      <VStack spacing={4} align="stretch">
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Text fontSize="sm">Your payment information is processed securely via Stripe</Text>
        </Alert>

        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Cardholder Name</FormLabel>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Smith"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Card Details</FormLabel>
          <Box
            borderWidth="1px"
            borderRadius="md"
            p={3}
            borderColor="gray.300"
          >
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </Box>
        </FormControl>

        <Checkbox
          isChecked={saveCard}
          onChange={(e) => setSaveCard(e.target.checked)}
        >
          Save card for future purchases
        </Checkbox>

        <Checkbox
          isChecked={taxEnabled}
          onChange={(e) => setTaxEnabled(e.target.checked)}
        >
          Calculate applicable taxes
        </Checkbox>

        <Divider />

        <Box>
          <HStack justify="space-between">
            <Text>Subtotal</Text>
            <Text>${(priceInCents / 100).toFixed(2)}</Text>
          </HStack>
          
          {taxEnabled && (
            <HStack justify="space-between">
              <Text>Tax</Text>
              <Text>${(taxAmount / 100).toFixed(2)}</Text>
            </HStack>
          )}
          
          <HStack justify="space-between" fontWeight="bold" mt={2}>
            <Text>Total</Text>
            <Text>${(totalAmount / 100).toFixed(2)}</Text>
          </HStack>
        </Box>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text>{error}</Text>
          </Alert>
        )}

        <HStack justify="space-between" mt={4}>
          <Button variant="ghost" onClick={onCancel} isDisabled={isProcessing}>
            Cancel
          </Button>
          <Button
            type="submit"
            colorScheme="teal"
            isDisabled={!stripe || isProcessing}
            leftIcon={isProcessing ? <Spinner size="sm" /> : <FaLock />}
          >
            {isProcessing ? 'Processing...' : `Pay $${(totalAmount / 100).toFixed(2)}`}
          </Button>
        </HStack>

        {process.env.NODE_ENV !== 'production' && (
          <Alert status="info" variant="subtle">
            <AlertIcon />
            <Text fontSize="sm">
              <strong>Test Mode</strong>: Use card 4242 4242 4242 4242, any future date, any 3 digits for CVC.
            </Text>
          </Alert>
        )}
      </VStack>
    </Box>
  )
} 