'use client'

import { useState, useEffect } from 'react'
import { Box, Button, Text, Link, useToast } from '@chakra-ui/react'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const toast = useToast()

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem('cookieConsent')
    if (!hasAccepted) {
      setIsVisible(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true')
    setIsVisible(false)
    toast({
      title: 'Cookies accepted',
      description: 'Thank you for accepting our cookie policy.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  if (!isVisible) return null

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="gray.800"
      color="white"
      p={4}
      zIndex={1000}
      boxShadow="0 -2px 10px rgba(0, 0, 0, 0.1)"
    >
      <Box maxW="container.lg" mx="auto" display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={4}>
        <Text fontSize="sm" flex="1">
          We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{' '}
          <Link href="/privacy-policy" color="teal.300" textDecoration="underline">
            Learn more
          </Link>
        </Text>
        <Button
          colorScheme="teal"
          size="sm"
          onClick={acceptCookies}
          minW="120px"
        >
          Accept
        </Button>
      </Box>
    </Box>
  )
} 