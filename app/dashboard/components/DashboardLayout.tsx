'use client'

import { Box, Flex, useColorModeValue, useBreakpointValue, IconButton, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, VStack, HStack, Text, useDisclosure, Icon } from '@chakra-ui/react'
import { FiMenu, FiHome, FiSettings, FiUser, FiLogOut } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { useDevice } from '../../hooks/useDevice'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const NavItem = ({ icon, label, onClick }: { icon: any; label: string; onClick: () => void }) => {
  const deviceType = useDevice()
  const isMobile = deviceType === 'mobile'
  
  return (
    <HStack
      spacing={4}
      p={3}
      borderRadius="md"
      cursor="pointer"
      _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
      onClick={onClick}
      w={isMobile ? 'full' : 'auto'}
    >
      <Icon as={icon} />
      {!isMobile && <Text>{label}</Text>}
    </HStack>
  )
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const router = useRouter()
  const { signOut } = useAuth()
  const deviceType = useDevice()
  const isMobile = deviceType === 'mobile'
  const sidebarWidth = useBreakpointValue({ base: 'full', md: '250px' })
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const SidebarContent = () => (
    <VStack
      spacing={4}
      align="stretch"
      w={sidebarWidth}
      h="100vh"
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      p={4}
    >
      <Text fontSize="xl" fontWeight="bold" mb={8}>
        FractiVerse
      </Text>
      <NavItem icon={FiHome} label="Home" onClick={() => router.push('/dashboard')} />
      <NavItem icon={FiUser} label="Profile" onClick={() => router.push('/dashboard/profile')} />
      <NavItem icon={FiSettings} label="Settings" onClick={() => router.push('/dashboard/settings')} />
      <Box flex={1} />
      <NavItem icon={FiLogOut} label="Sign Out" onClick={handleSignOut} />
    </VStack>
  )

  return (
    <Flex h="100vh">
      {isMobile ? (
        <>
          <IconButton
            aria-label="Open menu"
            icon={<FiMenu />}
            onClick={onOpen}
            position="fixed"
            top={4}
            left={4}
            zIndex={100}
          />
          <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>Menu</DrawerHeader>
              <DrawerBody p={0}>
                <SidebarContent />
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <SidebarContent />
      )}
      
      <Box flex={1} overflow="auto" p={{ base: 4, md: 8 }}>
        {children}
      </Box>
    </Flex>
  )
} 