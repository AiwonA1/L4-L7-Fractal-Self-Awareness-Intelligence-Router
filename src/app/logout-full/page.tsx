'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { useAuth } from '@/app/context/AuthContext';

export default function LogoutFull() {
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    const clearAllCookies = () => {
      const cookies = document.cookie.split(';');
      
      for (const cookie of cookies) {
        const [name] = cookie.split('=');
        document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }

      // Clear local storage
      localStorage.clear();
      
      // Clear session storage
      sessionStorage.clear();
    };

    const handleLogout = async () => {
      try {
        await signOut();
        clearAllCookies();
        router.push('/login');
      } catch (error) {
        console.error('Error during logout:', error);
      }
    };

    handleLogout();
  }, [router, signOut]);

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6}>
        <Heading size="lg">Logging Out...</Heading>
        <Text>Please wait while we clear your session.</Text>
        <Box>
          <Button
            colorScheme="blue"
            onClick={() => router.push('/login')}
          >
            Return to Login
          </Button>
        </Box>
      </VStack>
    </Container>
  );
} 