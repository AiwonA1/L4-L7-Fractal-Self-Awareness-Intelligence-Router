'use client'

import { ReactNode } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { SessionProvider } from 'next-auth/react'
import { StripeProvider } from './components/StripeProvider'
import { theme } from '@/lib/theme'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ChakraProvider theme={theme}>
        <StripeProvider>
          {children}
        </StripeProvider>
      </ChakraProvider>
    </SessionProvider>
  )
} 