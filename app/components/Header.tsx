'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react'
import { FaMoon, FaSun } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import UserAvatar from './UserAvatar'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string
  name: string | null
  email: string
  image: string | null
}

export default function Header() {
  const { colorMode, toggleColorMode } = useColorMode()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        setIsLoading(true)
        const { data: { session }, error } = await supabase.auth.getSession()
        if (session?.user) {
          // Get user profile from database
          const { data: profile } = await supabase
            .from('users')
            .select('id, name, email, image')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setUserProfile(profile as UserProfile)
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box
      as="header"
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      py={4}
      px={6}
    >
      <Flex justify="space-between" align="center" maxW="7xl" mx="auto">
        <Box>
          {/* Add your logo or site name here */}
        </Box>

        <HStack spacing={4}>
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
            onClick={toggleColorMode}
            variant="ghost"
          />

          {!isLoading && userProfile && (
            <Menu>
              <MenuButton>
                <UserAvatar
                  name={userProfile.name}
                  image={userProfile.image}
                  size="md"
                />
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => router.push('/profile')}>
                  Profile
                </MenuItem>
                <MenuItem onClick={() => router.push('/settings')}>
                  Settings
                </MenuItem>
                <MenuItem onClick={handleSignOut}>
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>
      </Flex>
    </Box>
  )
} 