import React, { useState } from 'react';
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
  Divider,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaCoins, FaArrowRight } from 'react-icons/fa';
import { FRACTIVERSE_PRICES, TokenTier, formatPrice } from '@/app/lib/stripe';

interface TokenBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onPurchase: (amount: number) => void;
}

const TokenBalanceModal = ({ isOpen, onClose, balance, onPurchase }: TokenBalanceModalProps) => {
  const [selectedTier, setSelectedTier] = useState<TokenTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();
  const highlightColor = useColorModeValue('teal.50', 'teal.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleClose = () => {
    setSelectedTier(null);
    onClose();
  };

  const handleInitiateCheckout = async (tier: TokenTier) => {
    setSelectedTier(tier);
    setIsProcessing(true);
    
    try {
      // Create a Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: tier,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL provided');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: 'Error',
        description: 'Failed to initiate checkout. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>FractiTokens</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            <Box 
              p={4} 
              borderWidth="1px" 
              borderRadius="md" 
              borderColor={borderColor}
              bg={useColorModeValue('gray.50', 'gray.800')}
            >
              <HStack>
                <Box as={FaCoins} color="yellow.500" boxSize={5} />
                <Text fontWeight="bold" fontSize="lg">Current Balance</Text>
              </HStack>
              <Text fontSize="3xl" fontWeight="bold" mt={2}>
                {balance} <Text as="span" fontSize="md">FractiTokens</Text>
              </Text>
            </Box>

            <Divider />
            
            <Text fontWeight="bold" fontSize="lg">Purchase Plans</Text>
            <Text fontSize="sm" color="gray.500" mt={-2} mb={2}>
              Select a plan to enhance your FractiVerse experience
            </Text>

            <VStack spacing={4} align="stretch">
              {(Object.keys(FRACTIVERSE_PRICES) as TokenTier[]).map((tier) => (
                <Box
                  key={tier}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor={selectedTier === tier ? 'teal.500' : borderColor}
                  bg={selectedTier === tier ? highlightColor : 'transparent'}
                  _hover={{ 
                    borderColor: 'teal.500', 
                    bg: highlightColor,
                    cursor: 'pointer' 
                  }}
                  onClick={() => setSelectedTier(tier)}
                >
                  <HStack justify="space-between" mb={2}>
                    <HStack>
                      <Box as={FaCoins} color="yellow.500" />
                      <Text fontWeight="bold">
                        {FRACTIVERSE_PRICES[tier].tokens} FractiTokens
                      </Text>
                    </HStack>
                    <Badge colorScheme="teal" variant="solid" px={2}>
                      {formatPrice(FRACTIVERSE_PRICES[tier].price)}
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    {FRACTIVERSE_PRICES[tier].description}
                  </Text>
                </Box>
              ))}
            </VStack>
            
            <Button
              colorScheme="teal"
              size="lg"
              isDisabled={!selectedTier}
              onClick={() => selectedTier && handleInitiateCheckout(selectedTier)}
              isLoading={isProcessing}
              rightIcon={<FaArrowRight />}
            >
              Proceed to Checkout
            </Button>
            
            <Text fontSize="xs" color="gray.500" textAlign="center">
              Secure payment processing by Stripe. Your tokens will be added immediately after payment.
            </Text>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TokenBalanceModal; 