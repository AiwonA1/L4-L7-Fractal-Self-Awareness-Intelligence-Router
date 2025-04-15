'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function QuickLoginPage() {
  const router = useRouter()

  useEffect(() => {
    const handleSignIn = async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('Error signing in:', error)
        router.push('/login')
      }
    }

    handleSignIn()
  }, [router])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Redirecting to login...</h1>
    </div>
  )
} 