'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const handleSignOut = async () => {
      await supabase.auth.signOut()
      router.push('/login')
    }

    handleSignOut()
  }, [router])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Signing out...</h1>
    </div>
  )
} 