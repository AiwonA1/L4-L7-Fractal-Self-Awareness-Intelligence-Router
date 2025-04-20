'use client'

import { useState, useEffect } from 'react'
import { Button, Icon } from '@chakra-ui/react'
import { FaUser, FaUserPlus } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthButton() {
  const [isNewUser, setIsNewUser] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUserStatus()
  }, [])

  const checkUserStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
        return
      }

      // Check if user has previously signed up
      const { data: existingUsers, error } = await supabase
        .from('users')
        .select('id')
        .limit(1)

      if (error) {
        console.error('Error checking user status:', error)
        return
      }

      setIsNewUser(existingUsers.length === 0)
    } catch (error) {
      console.error('Error in checkUserStatus:', error)
    }
  }

  const handleAuth = () => {
    router.push(isNewUser ? '/signup' : '/login')
  }

  return (
    <Button
      colorScheme="blue"
      onClick={handleAuth}
      leftIcon={isNewUser ? <Icon as={FaUserPlus} /> : <Icon as={FaUser} />}
    >
      {isNewUser ? 'Sign Up' : 'Sign In'}
    </Button>
  )
} 