'use client'

import { Box, Flex, useColorModeValue, useBreakpointValue, IconButton, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, VStack, HStack, Text, useDisclosure, Icon } from '@chakra-ui/react'
import { FiMenu, FiHome, FiSettings, FiUser, FiLogOut } from 'react-icons/fi'
import { FaBrain } from 'react-icons/fa'
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
      borderRadius="lg"
      cursor="pointer"
      _hover={{ bg: 'whiteAlpha.100' }}
      onClick={onClick}
      w={isMobile ? 'full' : 'auto'}
      transition="all 0.2s"
    >
      <Icon as={icon} color="fractiverse.400" />
      {!isMobile && <Text color="whiteAlpha.900">{label}</Text>}
    </HStack>
  )
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const router = useRouter()
  const { signOut } = useAuth()
  const deviceType = useDevice()
  const isMobile = deviceType === 'mobile'
  const sidebarWidth = '240px'

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const SidebarContent = () => (
    <Box
      w={sidebarWidth}
      h="100vh"
      bg="gray.900"
      borderRight="1px"
      borderColor="whiteAlpha.100"
      position="fixed"
      overflowY="auto"
      css={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
        },
      }}
    >
      <VStack h="full" spacing={0}>
        <Box p={4} w="full">
          <HStack spacing={3} mb={8}>
            <Icon as={FaBrain} boxSize={6} color="fractiverse.400" />
            <Text fontSize="lg" fontWeight="bold" color="whiteAlpha.900">
              FractiVerse
            </Text>
          </HStack>
          
          <VStack spacing={2} align="stretch">
            <NavItem icon={FiHome} label="Dashboard" onClick={() => router.push('/dashboard')} />
            <NavItem icon={FiUser} label="Profile" onClick={() => router.push('/profile')} />
            <NavItem icon={FiSettings} label="Settings" onClick={() => router.push('/settings')} />
          </VStack>
        </Box>

        <Box flex={1} />

        <Box p={4} w="full">
          <NavItem icon={FiLogOut} label="Sign Out" onClick={handleSignOut} />
        </Box>
      </VStack>
    </Box>
  )

  return (
    <Box
      minH="100vh"
      bg="gray.900"
      color="white"
    >
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
            variant="ghost"
            color="white"
            _hover={{ bg: 'whiteAlpha.100' }}
          />
          <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
            <DrawerOverlay />
            <DrawerContent bg="gray.900" borderRight="1px" borderColor="whiteAlpha.100">
              <DrawerCloseButton color="white" />
              <DrawerHeader borderBottomWidth="1px" borderColor="whiteAlpha.100">
                <HStack spacing={3}>
                  <Icon as={FaBrain} boxSize={6} color="fractiverse.400" />
                  <Text color="white">FractiVerse</Text>
                </HStack>
              </DrawerHeader>
              <DrawerBody p={0}>
                <SidebarContent />
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <SidebarContent />
      )}
      
      <Box
        ml={isMobile ? 0 : sidebarWidth}
        p={{ base: 4, md: 8 }}
        transition="margin 0.2s"
      >
        {children}
      </Box>
    </Box>
  )
} 