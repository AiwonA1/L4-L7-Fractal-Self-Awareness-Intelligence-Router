'use client'

import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  Text,
  Link as ChakraLink,
  useDisclosure,
} from '@chakra-ui/react'
import { FaUser, FaSignOutAlt, FaCoins, FaBrain, FaBook, FaChartLine } from 'react-icons/fa'
import { useAuth } from '@/app/context/AuthContext'
import { TokenPurchaseModal } from './TokenPurchaseModal'
import type { Database } from '@/types/supabase'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUserProfile, subscribeToProfile } from '@/lib/supabase/client'

type Profile = Database['public']['Tables']['users']['Row']

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: FaBrain },
  { label: 'Documentation', href: '/documentation', icon: FaBook },
  { label: 'Performance', href: '/test-report', icon: FaChartLine },
]

export default function Header() {
  const { user, signOut } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    if (user?.id) {
      // Get initial profile
      getUserProfile(user.id).then(setProfile)

      // Subscribe to profile changes
      const subscription = subscribeToProfile(user.id, (updatedProfile) => {
        console.log('Profile updated:', updatedProfile)
        setProfile(updatedProfile)
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user?.id])

  const getUserDisplayName = () => {
    if (!user) return 'Guest'
    return profile?.name || user.email?.split('@')[0] || 'Guest'
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <>
      <Box
        as="header"
        position="fixed"
        top={0}
        left={0}
        right={0}
        bg="gray.900"
        borderBottom="1px"
        borderColor="whiteAlpha.100"
        zIndex="sticky"
      >
        <Flex
          px={4}
          h={16}
          alignItems="center"
          justifyContent="space-between"
          maxW="7xl"
          mx="auto"
        >
          <HStack spacing={8} alignItems="center">
            <Text fontSize="2xl" fontWeight="bold" color="whiteAlpha.900">
              FractiVerse
            </Text>

            <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
              {NAV_ITEMS.map((item) => (
                <ChakraLink
                  key={item.href}
                  as={Link}
                  href={item.href}
                  px={3}
                  py={2}
                  rounded="md"
                  color="whiteAlpha.900"
                  _hover={{ bg: 'whiteAlpha.100' }}
                  bg={pathname === item.href ? 'whiteAlpha.100' : 'transparent'}
                >
                  <HStack spacing={2}>
                    <item.icon />
                    <Text>{item.label}</Text>
                  </HStack>
                </ChakraLink>
              ))}
            </HStack>
          </HStack>

          <HStack spacing={4}>
            {user && (
              <Button
                leftIcon={<FaCoins />}
                colorScheme="yellow"
                variant="solid"
                onClick={onOpen}
              >
                {profile?.token_balance || 0} FractiTokens
              </Button>
            )}

            <Menu>
              <MenuButton
                as={IconButton}
                icon={
                  <Avatar
                    size="sm"
                    name={getUserDisplayName()}
                    src={profile?.image}
                  />
                }
                variant="ghost"
                aria-label="User menu"
                _hover={{ bg: 'whiteAlpha.100' }}
              />
              <MenuList bg="gray.800" borderColor="whiteAlpha.200">
                <Text px={3} py={2} fontWeight="medium" color="whiteAlpha.900">
                  {getUserDisplayName()}
                </Text>
                <MenuDivider borderColor="whiteAlpha.200" />
                <MenuItem 
                  icon={<FaUser />} 
                  as={Link} 
                  href="/profile"
                  _hover={{ bg: 'whiteAlpha.100' }}
                  color="whiteAlpha.900"
                >
                  Profile
                </MenuItem>
                <MenuItem 
                  icon={<FaSignOutAlt />} 
                  onClick={handleSignOut}
                  _hover={{ bg: 'whiteAlpha.100' }}
                  color="whiteAlpha.900"
                >
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Box>

      <TokenPurchaseModal
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  )
} 