import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  Button,
  VStack,
  Text,
  useToast,
} from '@chakra-ui/react';

interface PaymentFormProps {
  onSuccess: () => void;
}

export default function PaymentForm({ onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: 'Payment failed',
          description: error.message || 'An error occurred during payment',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Payment successful',
          description: 'Your FractiTokens have been added to your balance',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        <PaymentElement />
        <Button
          colorScheme="blue"
          isLoading={isProcessing}
          loadingText="Processing..."
          type="submit"
          disabled={!stripe}
        >
          Pay now
        </Button>
        <Text fontSize="sm" color="gray.500">
          Your payment is processed securely by Stripe
        </Text>
      </VStack>
    </form>
  );
} 