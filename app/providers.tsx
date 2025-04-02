'use client'

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react'
import { theme } from './theme'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme} resetCSS>
        <ColorModeProvider value={theme.config.initialColorMode}>
          {children}
        </ColorModeProvider>
      </ChakraProvider>
    </CacheProvider>
  )
} 