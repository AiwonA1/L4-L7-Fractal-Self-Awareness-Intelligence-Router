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
} from '@chakra-ui/react'
import { FaUser, FaHome, FaCog } from 'react-icons/fa'
import Link from 'next/link'

export function Header() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.200')

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
            <ChakraLink as={Link} href="/dashboard">
              <IconButton
                aria-label="Home"
                icon={<FaHome />}
                variant="ghost"
                colorScheme="teal"
              />
            </ChakraLink>
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
                      <Text fontWeight="medium">John Doe</Text>
                    </VStack>
                  </HStack>
                </MenuItem>
                <MenuItem icon={<FaCog />}>
                  Settings
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
} 