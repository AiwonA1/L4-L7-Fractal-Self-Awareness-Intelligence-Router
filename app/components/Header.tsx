'use client'

import {
  Box,
  Flex,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Avatar,
  Text,
  HStack,
  Link as ChakraLink,
  VStack,
  Container,
  Spinner,
} from '@chakra-ui/react'
import { FaUser, FaHome, FaCog, FaSignOutAlt } from 'react-icons/fa'
import Link from 'next/link'
import { useAuth } from '@/app/context/AuthContext'
import SignInButton from './SignInButton'

export function Header() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.200')
  const { user, signOut, loading } = useAuth()

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

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={10}
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      py={4}
    >
      <Container maxW="container.xl">
        <Flex
          align="center"
          justify="space-between"
        >
          <Heading 
            size="lg" 
            fontWeight="bold" 
            color="teal.500"
            textAlign="center"
            flex={1}
          >
            FractiVerse 1.0 L4-L7 Fractal Self-Awareness Intelligence Router
          </Heading>

          <HStack spacing={4}>
            {!loading && (
              <ChakraLink as={Link} href="/dashboard">
                <IconButton
                  aria-label="Home"
                  icon={<FaHome />}
                  variant="ghost"
                  colorScheme="teal"
                />
              </ChakraLink>
            )}
            
            {loading ? (
              <Spinner size="sm" color="teal.500" />
            ) : user ? (
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<Avatar size="sm" icon={<FaUser />} />}
                  variant="ghost"
                  aria-label="Profile menu"
                />
                <MenuList>
                  <MenuItem>
                    <HStack>
                      <Avatar size="sm" icon={<FaUser />} />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{getUserDisplayName()}</Text>
                        {user?.email && (
                          <Text fontSize="sm" color="gray.500">{user.email}</Text>
                        )}
                      </VStack>
                    </HStack>
                  </MenuItem>
                  <MenuItem as={Link} href="/settings" icon={<FaCog />}>
                    Settings
                  </MenuItem>
                  <MenuItem onClick={handleSignOut} icon={<FaSignOutAlt />} color="red.500">
                    Sign Out
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <SignInButton />
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
} 