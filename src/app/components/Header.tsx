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
import TokenPurchaseModal from './TokenPurchaseModal'
import type { Database } from '@/types/supabase'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUserProfileClient } from '@/lib/supabase/client'

type Profile = Database['public']['Tables']['users']['Row']

export default function Header() {
  const { user, signOut } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    let isMounted = true; // Flag to prevent setting state on unmounted component

    if (user?.id) {
      // Get initial profile using the correctly imported function
      getUserProfileClient(user.id).then(profileData => {
        if (isMounted && profileData) {
           setProfile(profileData as Profile); // Cast might be needed depending on select query
        }
      }).catch(error => {
        console.error("Error fetching profile in Header:", error);
      });
    }

    return () => {
      isMounted = false; // Set flag on unmount
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
                    src={profile?.image ?? undefined}
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
        onPurchase={() => { 
            console.log("Purchase callback triggered from Header"); 
        }} 
      />
    </>
  )
} 