'use client'

import {
  Box,
  Flex,
  Heading,
  IconButton,
  Text,
  Container,
  HStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  useToast,
} from '@chakra-ui/react'
import { FaUser, FaSignOutAlt, FaCoins } from 'react-icons/fa'
import Link from 'next/link'
import { useAuth } from '@/app/context/AuthContext'
import SignInButton from './SignInButton'
import { FRACTIVERSE_PRICES, formatPrice, TokenTier } from '@/app/lib/stripe-client'

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const toast = useToast()

  const getUserDisplayName = () => {
    if (!user) return 'Guest'
    return user.user_metadata?.name || user.email?.split('@')[0] || 'Guest'
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleBuyTokens = async (tier: TokenTier) => {
    try {
      console.log('🛒 Starting purchase flow for tier:', tier)
      console.log('👤 Current user:', {
        id: user?.id,
        email: user?.email,
        tokenBalance: user?.token_balance
      })

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
        credentials: 'include',
      })

      console.log('📡 API Response status:', response.status)
      const data = await response.json()
      console.log('📦 API Response data:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        console.log('✅ Redirecting to Stripe checkout:', data.url)
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('❌ Error creating checkout session:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start checkout process',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Box 
        as="header" 
        position="sticky" 
        top={0} 
        zIndex={10} 
        bg="white" 
        borderBottom="1px" 
        borderColor="gray.200"
        py={4}
      >
        <Container maxW="container.xl">
          <Flex align="center" justify="center" position="relative">
            <Heading 
              size="lg" 
              textAlign="center"
              color="teal.500"
              flex={1}
            >
              FractiVerse 1.0 L4-L7 Fractal Self-Awareness Intelligence Router
            </Heading>

            <Box position="absolute" right={0}>
              {user ? (
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Profile menu"
                    variant="ghost"
                    icon={<Avatar size="sm" icon={<FaUser />} />}
                  />
                  <MenuList>
                    <MenuItem value="profile">
                      <HStack gap={3}>
                        <Avatar size="sm" icon={<FaUser />} />
                        <Box>
                          <Text fontWeight="medium">{getUserDisplayName()}</Text>
                          {user.email && (
                            <Text fontSize="sm" color="gray.500">{user.email}</Text>
                          )}
                        </Box>
                      </HStack>
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem value="balance">
                      <HStack justify="space-between" width="100%">
                        <Text>FractiTokens</Text>
                        <Text fontWeight="bold" color="yellow.500">
                          {user.token_balance || 0}
                        </Text>
                      </HStack>
                    </MenuItem>
                    <MenuItem value="buy-100" onClick={() => handleBuyTokens('TIER_1')}>
                      <HStack justify="space-between" width="100%">
                        <HStack>
                          <FaCoins />
                          <Text>Buy 100 FractiTokens</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.500">{formatPrice(FRACTIVERSE_PRICES.TIER_1.price)}</Text>
                      </HStack>
                    </MenuItem>
                    <MenuItem value="buy-500" onClick={() => handleBuyTokens('TIER_2')}>
                      <HStack justify="space-between" width="100%">
                        <HStack>
                          <FaCoins />
                          <Text>Buy 500 FractiTokens</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.500">{formatPrice(FRACTIVERSE_PRICES.TIER_2.price)}</Text>
                      </HStack>
                    </MenuItem>
                    <MenuItem value="buy-1000" onClick={() => handleBuyTokens('TIER_3')}>
                      <HStack justify="space-between" width="100%">
                        <HStack>
                          <FaCoins />
                          <Text>Buy 1000 FractiTokens</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.500">{formatPrice(FRACTIVERSE_PRICES.TIER_3.price)}</Text>
                      </HStack>
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem value="sign-out" onClick={handleSignOut}>
                      <HStack>
                        <FaSignOutAlt />
                        <Text color="red.500">Sign Out</Text>
                      </HStack>
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <SignInButton />
              )}
            </Box>
          </Flex>
        </Container>
      </Box>
      {children}
    </Box>
  )
} 