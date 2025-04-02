'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Container, Heading, Text, VStack, HStack, Divider, Code, Alert, AlertIcon, Spinner } from '@chakra-ui/react';
import LogoutExplanation from './explanation';

export default function LogoutFullPage() {
  const [status, setStatus] = useState<string>('Starting logout process...');
  const [logs, setLogs] = useState<string[]>([]);
  const [complete, setComplete] = useState<boolean>(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString().slice(11, 19)} - ${message}`]);
    setStatus(message);
  };

  // Server-side logout approach
  const callServerLogout = async () => {
    try {
      addLog("Calling server logout endpoints...");
      
      // Call multiple endpoints that might help clear cookies
      await fetch('/api/auth/signout', { method: 'GET' });
      await fetch('/api/auth/force-logout', { method: 'GET' });
      
      addLog("Server logout calls complete");
      return true;
    } catch (error) {
      addLog(`Server logout error: ${error}`);
      return false;
    }
  };

  // Client-side logout approach
  const clearClientStorage = () => {
    try {
      addLog("Clearing local storage...");
      localStorage.clear();
      
      addLog("Clearing session storage...");
      try { sessionStorage.clear(); } catch (e) {}
      
      addLog("Clearing cookies...");
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        if (name) {
          // Clear with multiple paths
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/dashboard`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/api`;
        }
      });
      
      // Specifically try to clear NextAuth cookies in multiple ways
      const nextAuthCookies = [
        'next-auth.session-token',
        'next-auth.callback-url',
        'next-auth.csrf-token',
        '__Secure-next-auth.callback-url',
        '__Secure-next-auth.session-token',
        '__Secure-next-auth.csrf-token',
        '__Host-next-auth.csrf-token',
        'auth-token'
      ];
      
      for (const cookieName of nextAuthCookies) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/api`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/dashboard`;
      }
      
      addLog("Client storage cleared");
      return true;
    } catch (error) {
      addLog(`Client storage clear error: ${error}`);
      return false;
    }
  };
  
  // Main logout process
  useEffect(() => {
    const logoutProcess = async () => {
      addLog("Starting comprehensive logout process");
      
      // Use both server and client methods
      await callServerLogout();
      clearClientStorage();
      
      // Use cookies.remove approach
      addLog("Using document.cookie direct assignment approach");
      document.cookie = "next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

      // Create authentication-state changing request
      addLog("Executing iframe approach");
      try {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = '/api/auth/signout?callbackUrl=/logout-callback';
        document.body.appendChild(iframe);
        
        // Set timeout to remove iframe
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 5000);
      } catch (e) {
        addLog(`Iframe approach error: ${e}`);
      }
      
      // Set a timeout to complete the process
      setTimeout(() => {
        addLog("Logout process complete");
        setComplete(true);
      }, 3000);
    };
    
    logoutProcess();
  }, []);

  const navigateHome = () => {
    // Force a clean navigation by using a timestamp parameter
    window.location.href = `/?fresh=true&t=${Date.now()}`;
  };
  
  const navigateToCookieFree = () => {
    window.location.href = `/dashboard/no-auth?t=${Date.now()}`;
  };

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg" textAlign="center">Nuclear Logout Option</Heading>
        
        <Alert status={complete ? "success" : "info"}>
          <AlertIcon />
          <Box>
            <Heading size="sm">{status}</Heading>
            <Text fontSize="sm">
              {complete 
                ? "Logout process has completed. You've been completely logged out." 
                : "Attempting to logout using multiple approaches..."}
            </Text>
          </Box>
        </Alert>
        
        {!complete && (
          <Box textAlign="center">
            <Spinner size="xl" />
          </Box>
        )}
        
        <Box bg="gray.50" p={4} borderRadius="md" maxH="200px" overflowY="auto">
          <Text fontWeight="bold" mb={2}>Logout Process Log:</Text>
          <Code display="block" whiteSpace="pre" p={2} fontSize="xs">
            {logs.join('\n')}
          </Code>
        </Box>
        
        <Box mt={4}>
          <Divider mb={4} />
          <Heading size="sm" mb={4}>Next Steps</Heading>
          <HStack spacing={4} justify="center">
            <Button colorScheme="blue" onClick={navigateHome}>
              Return to Home
            </Button>
            <Button colorScheme="teal" onClick={navigateToCookieFree}>
              Use Cookie-Free Dashboard
            </Button>
          </HStack>
        </Box>
        
        <LogoutExplanation />
      </VStack>
    </Container>
  );
} 