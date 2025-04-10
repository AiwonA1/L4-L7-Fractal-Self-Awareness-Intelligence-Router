'use client'

import { Box, Flex, Heading, IconButton, Menu, MenuButton, MenuList, MenuItem, Avatar, Text, Container, HStack, Divider, Button, useToast } from '@chakra-ui/react'
import { FaUser, FaSignOutAlt, FaCoins, FaCreditCard } from 'react-icons/fa'
import Link from 'next/link'
import { useAuth } from '@/app/context/AuthContext'
import SignInButton from './SignInButton'

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

  const handleBuyTokens = async (amount: '100' | '500' | '1000') => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast({
        title: 'Error',
        description: 'Failed to start checkout process. Please try again.',
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
                    icon={<Avatar size="sm" icon={<FaUser />} />}
                    variant="ghost"
                    aria-label="Profile menu"
                  />
                  <MenuList>
                    <MenuItem>
                      <HStack spacing={3}>
                        <Avatar size="sm" icon={<FaUser />} />
                        <Box>
                          <Text fontWeight="medium">{getUserDisplayName()}</Text>
                          {user.email && (
                            <Text fontSize="sm" color="gray.500">{user.email}</Text>
                          )}
                        </Box>
                      </HStack>
                    </MenuItem>
                    <Divider my={2} />
                    <MenuItem>
                      <HStack justify="space-between" width="100%">
                        <Text>FractiTokens</Text>
                        <Text fontWeight="bold" color="yellow.500">
                          {user.token_balance || 0}
                        </Text>
                      </HStack>
                    </MenuItem>
                    <MenuItem onClick={() => handleBuyTokens('100')} icon={<FaCoins />}>
                      <HStack justify="space-between" width="100%">
                        <Text>Buy 100 Tokens</Text>
                        <Text fontSize="sm" color="gray.500">$1.00</Text>
                      </HStack>
                    </MenuItem>
                    <MenuItem onClick={() => handleBuyTokens('500')} icon={<FaCoins />}>
                      <HStack justify="space-between" width="100%">
                        <Text>Buy 500 Tokens</Text>
                        <Text fontSize="sm" color="gray.500">$5.00</Text>
                      </HStack>
                    </MenuItem>
                    <MenuItem onClick={() => handleBuyTokens('1000')} icon={<FaCoins />}>
                      <HStack justify="space-between" width="100%">
                        <Text>Buy 1000 Tokens</Text>
                        <Text fontSize="sm" color="gray.500">$10.00</Text>
                      </HStack>
                    </MenuItem>
                    <Divider my={2} />
                    <MenuItem onClick={handleSignOut} icon={<FaSignOutAlt />} color="red.500">
                      Sign Out
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