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
  Center,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react'
import { FaUser, FaSignOutAlt, FaCoins } from 'react-icons/fa'
import Link from 'next/link'
import { useAuth } from '@/app/context/AuthContext'
import SignInButton from './SignInButton'
import { FRACTIVERSE_PRICES, formatPrice, TokenTier } from '@/lib/stripe-client'
import { useRouter } from 'next/navigation'

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, session, userProfile, signOut } = useAuth()
  const toast = useToast()
  const router = useRouter()

  const getUserDisplayName = () => {
    return user?.email || 'User'
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: 'Signed Out',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Sign Out Failed',
        description: (error as Error).message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const goToBilling = () => {
    router.push('/billing')
  }

  return (
    <Flex direction="column" minH="100vh">
      <Box
        bg={useColorModeValue('white', 'gray.800')}
        px={4}
        boxShadow="sm"
        borderBottomWidth="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <HStack spacing={8} alignItems={'center'}>
            <Box fontWeight="bold" fontSize="xl" color="purple.500">FractiVerse</Box>
            <HStack
              as={'nav'}
              spacing={4}
              display={{ base: 'none', md: 'flex' }}
            >
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/layer/4">Layer 4</Link>
              <Link href="/layer/5">Layer 5</Link>
              <Link href="/layer/6">Layer 6</Link>
              <Link href="/layer/7">Layer 7</Link>
              <Link href="/billing">Billing</Link>
            </HStack>
          </HStack>
          <Flex alignItems={'center'}>
            {user ? (
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}
                >
                  <Avatar
                    size={'sm'}
                    name={getUserDisplayName()}
                  />
                </MenuButton>
                <MenuList alignItems={'center'}>
                  <Center>
                    <Avatar
                      size={'lg'}
                      name={getUserDisplayName()}
                      mb={2}
                    />
                  </Center>
                  <Center>
                    <p>{getUserDisplayName()}</p>
                  </Center>
                  <MenuDivider />
                  <MenuItem onClick={goToBilling}>
                    <HStack>
                      <Icon as={FaCoins} color="yellow.500" />
                      <Text>
                        Tokens: {userProfile?.token_balance ?? 0}
                      </Text>
                    </HStack>
                  </MenuItem>
                  <MenuItem as={Link} href="/profile">Profile</MenuItem>
                  <MenuItem as={Link} href="/settings">Settings</MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <SignInButton />
            )}
          </Flex>
        </Flex>
      </Box>

      <Box flex="1" p="4">
        {children}
      </Box>
    </Flex>
  )
} 