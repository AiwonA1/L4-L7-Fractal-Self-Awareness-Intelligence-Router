'use client'

import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button, useToast } from '@chakra-ui/react'

interface StripeCheckoutFormProps {
  clientSecret: string
  onSuccess: () => void
}

export default function StripeCheckoutForm({ clientSecret, onSuccess }: StripeCheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
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
        toast({
          title: 'Payment Successful',
          description: 'Your FractiTokens have been added to your account.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
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
      <PaymentElement />
      <Button
        type="submit"
        colorScheme="teal"
        width="100%"
        mt={4}
        isLoading={isLoading}
      >
        Purchase FractiTokens
      </Button>
    </form>
  )
} 