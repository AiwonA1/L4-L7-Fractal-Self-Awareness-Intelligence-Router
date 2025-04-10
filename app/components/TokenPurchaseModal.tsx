import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  useToast,
  Radio,
  RadioGroup,
  Divider,
} from '@chakra-ui/react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { FRACTIVERSE_PRICES, TokenTier, formatPrice } from '@/app/lib/stripe';
import PaymentForm from './PaymentForm';
import { useSession } from 'next-auth/react';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Missing Stripe publishable key');
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

interface TokenPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
}

interface ExtendedUser extends User {
  token_balance: number;
}

export default function TokenPurchaseModal({
  isOpen,
  onClose,
  onPurchase,
}: TokenPurchaseModalProps) {
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(false)
  const currentBalance = (session?.user as ExtendedUser)?.token_balance || 0
  const [selectedTier, setSelectedTier] = useState<TokenTier>('TIER_1');
  const [clientSecret, setClientSecret] = useState<string>();
  const toast = useToast();

  useEffect(() => {
    if (isOpen && selectedTier) {
      createPaymentIntent();
    }
  }, [isOpen, selectedTier]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier: selectedTier }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initialize payment',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleTierChange = (newTier: TokenTier) => {
    setSelectedTier(newTier);
    createPaymentIntent();
  };

  const handlePurchase = async (amount: number) => {
    try {
      setLoading(true)
      const response = await fetch('/api/purchase-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          userId: session?.user?.id,
          currentBalance,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to purchase tokens')
      }

      const { newBalance } = await response.json()
      
      // Update the session with the new token balance
      await update({
        ...session,
        user: {
          ...session?.user,
          token_balance: newBalance,
        },
      })

      onClose()
    } catch (error) {
      console.error('Error purchasing tokens:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Purchase FractiTokens</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            <RadioGroup value={selectedTier} onChange={handleTierChange}>
              <VStack spacing={4} align="stretch">
                <Radio value="TIER_1">
                  {FRACTIVERSE_PRICES.TIER_1.tokens} FractiTokens - {formatPrice(FRACTIVERSE_PRICES.TIER_1.price)}
                </Radio>
                <Radio value="TIER_2">
                  {FRACTIVERSE_PRICES.TIER_2.tokens} FractiTokens - {formatPrice(FRACTIVERSE_PRICES.TIER_2.price)}
                </Radio>
                <Radio value="TIER_3">
                  {FRACTIVERSE_PRICES.TIER_3.tokens} FractiTokens - {formatPrice(FRACTIVERSE_PRICES.TIER_3.price)}
                </Radio>
              </VStack>
            </RadioGroup>

            <Divider />

            <Text fontSize="sm" color="gray.600">
              Each FractiToken grants access to the router.
            </Text>

            {clientSecret && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                  },
                }}
              >
                <PaymentForm onSuccess={onPurchase} />
              </Elements>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 