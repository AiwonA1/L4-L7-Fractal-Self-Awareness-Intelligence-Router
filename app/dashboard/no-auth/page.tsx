'use client';

import DashboardMain from '../../components/DashboardMain';
import { Box, Container, Text, Button, VStack, Heading, Alert, AlertIcon, Divider, Code } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export default function DashboardNoAuthPage() {
  const [showWarning, setShowWarning] = useState(true);
  
  useEffect(() => {
    // Set up a mock session for the dashboard that doesn't rely on cookies
    window.localStorage.setItem('bypassAuth', 'true');
    window.localStorage.setItem('userName', 'Guest User');
    window.localStorage.setItem('userData', JSON.stringify({
      email: 'guest@example.com',
      name: 'Guest User',
      id: 'guest-123',
      tokenBalance: 33,
      image: null
    }));
  }, []);

  return (
    <>
      {showWarning && (
        <Container maxW="container.xl" py={4}>
          <Alert status="warning" variant="solid" mb={4}>
            <AlertIcon />
            <Box flex="1">
              <Heading size="sm">Running without authentication</Heading>
              <Text fontSize="sm">
                This version of the dashboard runs completely without cookies or NextAuth. 
                It uses localStorage and props instead.
              </Text>
              <Divider my={2} />
              <Text fontSize="xs">
                How it works: The page passes mock authentication data directly to the dashboard 
                component, bypassing the NextAuth cookie system. This approach allows you to view 
                and use the dashboard without any cookie-based authentication.
              </Text>
            </Box>
            <Button 
              size="sm" 
              onClick={() => setShowWarning(false)}
              colorScheme="orange"
              variant="outline"
            >
              Hide
            </Button>
          </Alert>
        </Container>
      )}
      
      <DashboardMain 
        bypassAuth={true} 
        mockUser={{
          name: 'Guest User',
          email: 'guest@example.com',
          id: 'guest-123',
          tokenBalance: 33,
          image: null
        }}
      />
    </>
  );
} 