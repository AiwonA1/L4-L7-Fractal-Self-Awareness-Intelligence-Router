'use client'

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
  Card,
  CardBody,
  Icon,
  Heading,
  SimpleGrid,
} from '@chakra-ui/react';
import { FaCoins, FaRocket, FaCrown } from 'react-icons/fa';
import { useAuth } from '@/app/context/AuthContext';
import { FRACTIVERSE_PRICES, TokenTier, formatPrice } from '@/lib/stripe-client';

interface TokenPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
}

const pricingTiers = [
  {
    tier: 'TIER_1' as TokenTier,
    name: 'Basic Package',
    icon: FaCoins,
    color: 'teal',
  },
  {
    tier: 'TIER_2' as TokenTier,
    name: 'Popular Package',
    icon: FaRocket,
    color: 'purple',
  },
  {
    tier: 'TIER_3' as TokenTier,
    name: 'Pro Package',
    icon: FaCrown,
    color: 'yellow',
  },
];

export default function TokenPurchaseModal({ isOpen, onClose, onPurchase }: TokenPurchaseModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<{ [key in TokenTier]?: boolean }>({});
  const toast = useToast();

  const handlePurchase = async (tier: TokenTier) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to purchase tokens',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    console.log(`Purchase initiated for tier: ${tier}, closing modal.`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxW="7xl">
        <ModalHeader py={6}>
          <VStack spacing={2} align="center">
            <Heading size="lg">Purchase FractiTokens</Heading>
            <Text color="gray.600">
              Power up your AI with L4-L7 Fractal Intelligence
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={8}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} mb={8}>
            {pricingTiers.map((tierInfo) => {
              const price = FRACTIVERSE_PRICES[tierInfo.tier];
              return (
                <Card
                  key={tierInfo.tier}
                  border="2px"
                  borderColor="gray.200"
                  borderRadius="xl"
                  _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                  transition="all 0.2s"
                >
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack spacing={3}>
                        <Icon as={tierInfo.icon} w={6} h={6} color={`${tierInfo.color}.400`} />
                        <Heading size="md">{tierInfo.name}</Heading>
                      </HStack>
                      <Text fontSize="3xl" fontWeight="bold">
                        {formatPrice(price.price)}
                      </Text>
                      <Text>
                        {price.tokens} FractiTokens
                      </Text>
                      <Button
                        colorScheme={tierInfo.color}
                        size="lg"
                        onClick={() => handlePurchase(tierInfo.tier)}
                        isDisabled={!user}
                      >
                        {user ? 'Select Package' : 'Sign in to Purchase'}
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>
          <Text fontSize="sm" color="gray.600" textAlign="center">
            All purchases are processed securely through Stripe. Tokens are non-refundable.
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 