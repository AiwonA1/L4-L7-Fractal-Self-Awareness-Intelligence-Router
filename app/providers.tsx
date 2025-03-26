'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { AuthProvider } from './context/AuthContext'
import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ChakraProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ChakraProvider>
    </SessionProvider>
  )
} 