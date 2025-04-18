'use client'

import { Button } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export default function SignInButton() {
  const router = useRouter()

  return (
    <Button
      colorScheme="teal"
      onClick={() => router.push('/login')}
    >
      Sign In
    </Button>
  )
} 