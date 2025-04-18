'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

interface User extends SupabaseUser {
  name?: string;
  fract_tokens?: number;
  tokens_used?: number;
  token_balance?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const router = useRouter()

  const fetchUserData = async (userId: string) => {
    console.log('🔍 Fetching user data for ID:', userId)
    try {
      const response = await fetch('/api/user/data')
      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }
      const data = await response.json()
      
      console.log('✅ Successfully fetched user data:', {
        id: data?.id,
        email: data?.email,
        name: data?.name,
        fract_tokens: data?.fract_tokens,
        tokens_used: data?.tokens_used,
        token_balance: data?.token_balance,
        created_at: data?.created_at
      })

      return data
    } catch (error) {
      console.error('❌ Exception in fetchUserData:', error)
      return null
    }
  }

  const updateUserState = async (session: Session | null) => {
    setSession(session)
    
    if (session?.user) {
      console.log('👤 Updating user state for:', session.user.email)
      const userData = await fetchUserData(session.user.id)
      if (userData) {
        const mergedUser = { ...session.user, ...userData }
        setUser(mergedUser)
      } else {
        setUser(session.user)
      }
      setShowAuthModal(false)
    } else {
      setUser(null)
      // Only show auth modal if we're not loading and there's no session
      if (!isLoading) {
        setShowAuthModal(true)
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    console.log('🔄 Setting up Supabase auth listeners...')
    
    // Configure Supabase to persist session
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', { event, hasSession: !!session })
      
      if (event === 'SIGNED_IN') {
        updateUserState(session)
      } else if (event === 'SIGNED_OUT') {
        updateUserState(null)
      } else if (event === 'TOKEN_REFRESHED') {
        // Just update the session but keep the user state
        setSession(session)
      }
    })

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        updateUserState(session)
      } else {
        setIsLoading(false)
        setShowAuthModal(true)
      }
    })

    return () => {
      // Cleanup will be handled by Supabase client
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Attempting sign in with email:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Sign in error:', error.message)
        throw error
      }

      if (!data.session) {
        throw new Error('No session returned after successful sign in')
      }

      console.log('✅ Sign in successful')
      await updateUserState(data.session)
      
    } catch (error) {
      console.error('❌ Sign in failed:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setSession(null)
      setShowAuthModal(true)
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const value = {
    user,
    session,
    signIn,
    signOut,
    isLoading,
    showAuthModal,
    setShowAuthModal,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
