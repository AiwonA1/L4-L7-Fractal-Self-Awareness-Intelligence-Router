'use client'

import { Box, Container, Heading, Text, VStack, List, ListItem, ListIcon } from '@chakra-ui/react'
import { CheckCircleIcon } from '@chakra-ui/icons'

export default function PrivacyPolicy() {
  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Privacy Policy
        </Heading>

        <Box>
          <Heading as="h2" size="lg" mb={4}>
            Cookie Usage
          </Heading>
          <Text mb={4}>
            We use cookies to enhance your experience on our platform. These cookies help us:
          </Text>
          <List spacing={3}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="teal.500" />
              Maintain your session and authentication state
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="teal.500" />
              Remember your preferences and settings
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="teal.500" />
              Improve our website's performance and security
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="teal.500" />
              Provide a better user experience
            </ListItem>
          </List>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb={4}>
            Types of Cookies We Use
          </Heading>
          <Text mb={4}>
            Our website uses the following types of cookies:
          </Text>
          <List spacing={3}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="teal.500" />
              <strong>Essential Cookies:</strong> Required for basic site functionality and security
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="teal.500" />
              <strong>Authentication Cookies:</strong> Used to maintain your logged-in state
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="teal.500" />
              <strong>Preference Cookies:</strong> Remember your settings and preferences
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="teal.500" />
              <strong>Analytics Cookies:</strong> Help us understand how visitors use our site
            </ListItem>
          </List>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb={4}>
            Managing Cookies
          </Heading>
          <Text mb={4}>
            You can control and manage cookies in various ways:
          </Text>
          <List spacing={3}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="teal.500" />
              Browser settings: You can configure your browser to block or delete cookies
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="teal.500" />
              Our consent banner: You can accept or decline non-essential cookies
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="teal.500" />
              Third-party tools: You can use browser extensions to manage cookies
            </ListItem>
          </List>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb={4}>
            Contact Us
          </Heading>
          <Text>
            If you have any questions about our cookie usage or privacy policy, please contact us at{' '}
            <Text as="span" color="teal.500">
              privacy@fractiverse.com
            </Text>
          </Text>
        </Box>
      </VStack>
    </Container>
  )
} 