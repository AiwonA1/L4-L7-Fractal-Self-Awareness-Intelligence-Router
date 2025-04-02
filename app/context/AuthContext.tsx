'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@chakra-ui/react'
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'

interface User {
  id?: string
  email?: string
  name?: string
  image?: string
  tokens?: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  updateUser: (data: Partial<User>) => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { data: session, status } = useSession()
  const router = useRouter()
  const toast = useToast()

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
      return
    }

    if (status === 'authenticated' && session?.user) {
      setUser({
        id: session.user.id as string,
        email: session.user.email || undefined,
        name: session.user.name || undefined,
        image: session.user.image || undefined,
        tokens: (session.user as any).tokens || 0
      })
    } else {
      setUser(null)
    }
    
    setLoading(false)
  }, [session, status])

  const signIn = async (email: string, password: string) => {
    try {
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await nextAuthSignOut({ redirect: false })
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Sign up failed')
      }

      await signIn(email, password)
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, signUp, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 