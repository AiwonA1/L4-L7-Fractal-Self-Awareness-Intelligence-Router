'use client'

import {
  Box,
  Flex,
  useToast,
  Center,
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
  useColorModeValue,
  Icon,
} from '@chakra-ui/react'
import { FaUser, FaSignOutAlt, FaCoins } from 'react-icons/fa'
import Link from 'next/link'
import { useAuth } from '@/app/context/AuthContext'
import SignInButton from './SignInButton'
import { FRACTIVERSE_PRICES, formatPrice, TokenTier } from '@/lib/stripe-client'
import { useRouter } from 'next/navigation'
import Header from './Header'

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
      <Header />

      <Box flex="1" p="4" mt="16">
        {children}
      </Box>
    </Flex>
  )
} 