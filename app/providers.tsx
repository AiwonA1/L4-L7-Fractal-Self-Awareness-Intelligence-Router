'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { AuthProvider } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import theme from '@/lib/theme'
import type { Session } from '@supabase/supabase-js'

interface ProvidersProps {
  children: React.ReactNode;
  initialSession: Session | null;
}

export function Providers({ children, initialSession }: ProvidersProps) {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider initialSession={initialSession}>
        <ChatProvider>
          {children}
        </ChatProvider>
      </AuthProvider>
    </ChakraProvider>
  )
} 