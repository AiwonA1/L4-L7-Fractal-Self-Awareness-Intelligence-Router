'use client'

import { Box } from '@chakra-ui/react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box minH="calc(100vh - 5rem)" py={8}>
      {children}
    </Box>
  )
} 