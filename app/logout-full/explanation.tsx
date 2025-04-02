'use client';

import { Box, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Text, Code, Heading } from '@chakra-ui/react';

export default function LogoutExplanation() {
  return (
    <Box mt={6}>
      <Heading size="md" mb={4}>How The Nuclear Logout Works</Heading>
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex='1' textAlign='left'>
                Multiple Approach Strategy
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Text>
              This logout method uses multiple approaches simultaneously to ensure complete logout:
            </Text>
            <Box ml={4} mt={2}>
              <Text>1. <strong>Server-side cookie clearing</strong> via dedicated API endpoints</Text>
              <Text>2. <strong>Client-side storage clearing</strong> (localStorage, sessionStorage, cookies)</Text>
              <Text>3. <strong>Hidden iframe approach</strong> to trigger NextAuth's signout flow</Text>
              <Text>4. <strong>Cookie purging</strong> with multiple paths and domains</Text>
            </Box>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex='1' textAlign='left'>
                Technical Implementation
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Text mb={2}>The implementation uses multiple techniques:</Text>
            <Code p={2} fontSize="xs" display="block" whiteSpace="pre" mb={3}>
{`// Server API calls
await fetch('/api/auth/signout')
await fetch('/api/auth/force-logout')

// Direct localStorage/sessionStorage clearing
localStorage.clear()
sessionStorage.clear()

// Cookie clearing with multiple paths
document.cookie = \`\${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/\`;
document.cookie = \`\${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/dashboard\`;

// Hidden iframe approach
const iframe = document.createElement('iframe');
iframe.src = '/api/auth/signout?callbackUrl=/logout-callback';
document.body.appendChild(iframe);`}
            </Code>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex='1' textAlign='left'>
                Why This Works Better
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Text>
              Standard logout methods often only clear one type of storage or make a single API call. 
              The nuclear approach:
            </Text>
            <Box ml={4} mt={2}>
              <Text>• Operates both client-side and server-side simultaneously</Text>
              <Text>• Takes a scorched earth approach to cookie clearing</Text>
              <Text>• Clears cookies with multiple paths to handle path-specific cookies</Text>
              <Text>• Uses both programmatic and iframe-based authentication flows</Text>
              <Text>• Provides multiple navigation options after logout</Text>
            </Box>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
} 