'use client'

import { Button } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function SignInButton() {
  const router = useRouter()

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      console.error('Error signing in:', error.message)
    }
  }

  return (
    <Button
      colorScheme="teal"
      onClick={handleSignIn}
    >
      Sign In
    </Button>
  )
} 