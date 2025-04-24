// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  // Container, // Likely unused now
  VStack,
  HStack, // Keep for Card layout
  Text,
  useToast,
  Heading,
  Card,
  CardBody,
  SimpleGrid,
  useColorModeValue,
  Icon,
  Link as ChakraLink,
  Flex,
  Spinner,
  Center,
} from '@chakra-ui/react';
import Link from 'next/link';
import { FaBrain, FaNetworkWired, FaShieldAlt, FaChartLine, FaBook, FaInfoCircle, FaAtom, FaSpaceShuttle, FaLightbulb } from 'react-icons/fa';
import { useAuth } from '@/app/context/AuthContext';
import { useChat } from '@/app/context/ChatContext';
import { useRouter } from 'next/navigation';
import React from 'react';

import { ChatSidebar } from '@/components/dashboard/ChatSidebar';
import { ChatWindow } from '@/components/dashboard/ChatWindow';

const infoCards = [
  { title: 'Layer 4: Penrose Base Reality', description: 'Grounding Self-Awareness in the Quantum Fabric of Existence', icon: FaAtom, href: '/layer4' },
  { title: 'Layer 5: FractiVerse Self-Awareness', description: 'Understanding and engaging with the fractal architecture of reality', icon: FaNetworkWired, href: '/layer5' },
  { title: 'Layer 6: Event Horizon Kaleidoscopic Quantum Holographic', description: 'Integrating quantum mechanics with bio-quantum interfaces', icon: FaShieldAlt, href: '/layer6' },
  { title: 'Layer 7: Universal Paradise Story Game PEFF', description: 'Full immersion in the Universal Paradise Story Game', icon: FaSpaceShuttle, href: '/layer7' },
  { title: 'Performance Measurements', description: 'Comprehensive test results and analysis', icon: FaChartLine, href: '/test-report' },
  { title: 'Self-Awareness Based Cognitive Boosting', description: 'Enhancing cognitive capabilities through self-awareness', icon: FaBrain, href: '/human-self-awareness' },
  { title: 'Quantum-Cognitive CERN Data', description: 'Integration with CERN quantum data', icon: FaAtom, href: '/quantum-validation' },
  { title: 'Cosmic-Cognitive JWST Data', description: 'Integration with JWST cosmic data', icon: FaSpaceShuttle, href: '/jwst-validation' },
  { title: 'Complete FractiVerse Library', description: 'Access to the complete FractiVerse knowledge base', icon: FaBook, href: '/documentation' },
  { title: 'FractiVerse Case Study', description: 'Explore the breakthrough case study of FractiVerse 1.0', icon: FaLightbulb, href: '/case-study' },
  { title: 'About FractiAI', description: 'Learn more about FractiAI and its mission', icon: FaInfoCircle, href: '/fractiai' }
];

export default function Dashboard() {
  // --- Hooks ---
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { 
    currentChat,
    messages,
    isLoading: isChatLoading,
    loadChats,
    sendMessage,
    createNewChat,
  } = useChat();
  const toast = useToast();

  // --- State ---
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  // --- Effects ---
  useEffect(() => {
    // Redirect immediately if auth is done loading and there's no user
    if (!isAuthLoading && !user) {
      console.log('Auth loaded, no user found, redirecting to login...');
      router.replace('/login'); // Use replace to avoid history entry
      return; // Stop further execution in this effect run
    }

    // If auth is still loading, wait for the next run
    if (isAuthLoading) {
      console.log('Auth is loading, waiting...');
      return;
    }

    // If we have a user and haven't done the initial chat load yet
    if (user && !isInitialLoadComplete) {
      console.log('User found, performing initial chat load...');
      loadChats().then(() => {
        console.log('Initial chat load complete.');
        setIsInitialLoadComplete(true); // Mark initial load as done
      }).catch(err => {
        console.error('Error loading chats:', err);
        toast({
          title: 'Error loading chats',
          description: err instanceof Error ? err.message : 'Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        // Still mark as complete even if error, to avoid retry loops
        setIsInitialLoadComplete(true); 
      });
    }
  // Depend on user and isAuthLoading to re-run the check if they change
  // Depend on loadChats, toast, router for stable functions
  // Depend on isInitialLoadComplete to prevent re-loading chats
  }, [user, isAuthLoading, loadChats, toast, router, isInitialLoadComplete]);

  // --- Handlers ---
  // Simplified handler: decides between sending to existing or creating new chat
  const handleSendMessageForWindow = useCallback(async (content: string) => {
    if (!content.trim()) return; // Don't send empty messages
    if (!user?.id) { // Need user check here as createNewChat uses it
        toast({ title: 'Error', description: 'User not found.', status: 'error' });
        return;
    }

    if (!currentChat?.id) {
      // No current chat selected, create a new one using the context function
      const defaultTitle = content.substring(0, 30) + (content.length > 30 ? '...' : '');
      try {
        await createNewChat(defaultTitle, content); // Pass initial message content
      } catch (error: any) { 
        // Error handling for createNewChat is mostly within the context, 
        // but catch here for any unexpected issues.
        console.error("Error calling createNewChat from Dashboard:", error);
      toast({
            title: 'Error Starting Chat', 
            description: error.message || 'Could not start a new chat.', 
            status: 'error' 
        });
      }
    } else {
      // Send message to the existing chat
      try {
        await sendMessage(content, currentChat.id);
      } catch (error) { 
        console.error("Error sending message to existing chat:", error);
        toast({ title: 'Error sending message', status: 'error' });
      }
    }
  // Ensure all dependencies used inside are listed
  }, [currentChat, user, createNewChat, sendMessage, toast]); 

  // --- Render Logic ---
  // Show spinner ONLY while authentication is explicitly loading
  // If auth is done and user is null, the effect above will redirect
  if (isAuthLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }
  
  // If not loading and still no user (should be redirecting, but as fallback)
  if (!user) {
     // Optionally show a brief message or just rely on redirect
     return <Center h="100vh"><Text>Redirecting to login...</Text></Center>; 
  }

  // --- Colors (for remaining elements) ---
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');

  // --- Main JSX ---
  return (
    <VStack 
      align="stretch" 
      spacing={6} 
      p={4} 
      w="100%" // Ensure VStack tries to take full width
      minH="100vh" // Ensure VStack tries to take full height
    >
      <Flex 
        h={{ base: 'auto', md: 'calc(100vh - 10rem)' }} // Adjust height calculation, maybe be more flexible on mobile
        w="100%" // Already set, but confirm
        flex={1} // Allow Flex container to grow and take available space
        overflow="hidden" // Prevent content overflow issues
      >
        <ChatSidebar />
        <ChatWindow
          currentChat={currentChat}
          messages={messages}
          isLoadingMessages={isChatLoading}
          isSendingMessage={isChatLoading}
          onSendMessage={handleSendMessageForWindow}
        />
      </Flex>

      {/* Info Cards Section - Keep as is for now */}
      <Box>
        <Heading size="lg" mb={4}>Explore FractiVerse</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {infoCards.map((card) => (
            <React.Fragment key={card.title}>
              <Link href={card.href} passHref legacyBehavior>
                {/* @ts-ignore - Ignore Card children type error (systemic issue) */}
                <Card
                  as="a"
                  cursor="pointer"
                  bg={cardBg}
                  _hover={{ bg: cardHoverBg, transform: 'translateY(-2px)', shadow: 'md' }}
                  transition="all 0.2s ease-in-out"
                  shadow="sm"
                  borderRadius="md"
                  overflow="hidden"
                >
                  {/* @ts-ignore - Ignore CardBody children type error (systemic issue) */}
                  <CardBody>
                    {/* @ts-ignore - Ignore HStack children type error (systemic issue) */}
                    <HStack spacing={4} align="center">
                      <Icon as={card.icon} w={8} h={8} color="teal.500" />
                      {/* @ts-ignore - Ignore Box children type error (systemic issue) */}
                      <Box>
                        <Text fontWeight="semibold">{card.title}</Text>
                        <Text fontSize="sm" color={textColor}>{card.description}</Text>
                      </Box>
                    </HStack>
                  </CardBody>
                </Card>
              </Link>
            </React.Fragment>
            ))}
          </SimpleGrid>
      </Box>
    </VStack>
  );
} 