'use client';

import { useEffect } from 'react';
import { Box, Container, Text, Spinner, Heading, VStack } from '@chakra-ui/react';

export default function ResetDataPage() {
  useEffect(() => {
    // Clear all localStorage data
    try {
      console.log('Clearing localStorage data');
      localStorage.clear();
      
      // Clear all sessionStorage data
      try {
        sessionStorage.clear();
      } catch (e) {
        console.error('Error clearing sessionStorage:', e);
      }
      
      // Clear all cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      });
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = '/?clean=true';
      }, 2000);
    } catch (error) {
      console.error('Error clearing data:', error);
      
      // Fallback redirect
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
  }, []);

  return (
    <Container maxW="container.md" py={20}>
      <VStack spacing={6}>
        <Heading size="lg">Clearing All Data</Heading>
        <Spinner size="xl" color="blue.500" />
        <Text>Clearing localStorage, cookies, and all session data...</Text>
        <Text fontSize="sm">You will be redirected to the home page in a moment.</Text>
      </VStack>
    </Container>
  );
} 