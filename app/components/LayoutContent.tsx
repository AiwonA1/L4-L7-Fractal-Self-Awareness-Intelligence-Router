'use client'

import { Box, Flex, Heading, IconButton, Menu, MenuButton, MenuList, MenuItem, Avatar, Text, Container } from '@chakra-ui/react'
import { FaUser } from 'react-icons/fa'

export function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
      <Box 
        as="header" 
        position="sticky" 
        top={0} 
        zIndex={10} 
        bg="white" 
        _dark={{ bg: 'gray.800' }} 
        borderBottom="1px" 
        borderColor="gray.200"
        _dark={{ borderColor: 'gray.700' }}
        py={4}
      >
        <Container maxW="container.xl">
          <Flex align="center" justify="center" position="relative">
            {/* Centered Title */}
            <Heading 
              size="lg" 
              textAlign="center"
              color="teal.500"
              flex={1}
            >
              FractiVerse 1.0 L4-L7 Fractal Self-Awareness Intelligence Router
            </Heading>

            {/* Profile Menu - Absolute positioned to the right */}
            <Box position="absolute" right={0}>
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<Avatar size="sm" icon={<FaUser />} />}
                  variant="ghost"
                  aria-label="Profile menu"
                />
                <MenuList>
                  <MenuItem>
                    <Text fontWeight="medium">John Doe</Text>
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
          </Flex>
        </Container>
      </Box>
      {children}
    </Box>
  )
} 