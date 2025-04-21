'use client';

import { useEffect } from 'react';
import { Container, VStack, Text, Spinner } from '@chakra-ui/react';

export default function LogoutCallbackPage() {
  useEffect(() => {
    // Log that we've reached the callback
    console.log("Logout callback reached - signalling parent window if possible");
    
    // Try to signal parent window (if in iframe)
    try {
      if (window.parent && window.parent !== window) {
        // Signal parent that logout is complete
        window.parent.postMessage('logout-complete', '*');
      }
    } catch (e) {
      console.error("Error communicating with parent:", e);
    }
    
    // If we're in a main window (not iframe), redirect to homepage
    if (window.top === window) {
      window.location.href = '/?logout=complete';
    }
  }, []);

  return (
    <Container centerContent py={10}>
      <VStack spacing={4}>
        <Spinner size="xl" />
        <Text>Logout complete, redirecting...</Text>
      </VStack>
    </Container>
  );
} 