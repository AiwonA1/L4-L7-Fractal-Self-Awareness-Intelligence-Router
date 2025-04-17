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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ Error fetching user data:', error)
        return null
      }

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

  useEffect(() => {
    console.log('🔄 Setting up Supabase auth listeners...')
    
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      console.log('🔐 Initial session check:', {
        hasSession: !!session,
        error: error?.message,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        userMetadata: session?.user?.user_metadata,
        accessToken: session?.access_token ? '✓ Present' : '✗ Missing',
        refreshToken: session?.refresh_token ? '✓ Present' : '✗ Missing'
      })

      setSession(session)
      if (session?.user) {
        console.log('👤 Initial user found:', {
          id: session.user.id,
          email: session.user.email,
          metadata: session.user.user_metadata,
          aud: session.user.aud,
          role: session.user.role
        })

        // Fetch user data with retries
        let retries = 3
        let userData = null
        while (retries > 0 && !userData) {
          userData = await fetchUserData(session.user.id)
          if (!userData) {
            console.log(`Retrying user data fetch... (${retries} attempts left)`)
            await new Promise(resolve => setTimeout(resolve, 1000))
            retries--
          }
        }

        if (userData) {
          const mergedUser = { ...session.user, ...userData }
          console.log('🔄 Merged user data:', {
            id: mergedUser.id,
            email: mergedUser.email,
            name: mergedUser.name,
            fract_tokens: mergedUser.fract_tokens,
            tokens_used: mergedUser.tokens_used,
            token_balance: mergedUser.token_balance
          })
          setUser(mergedUser)
        } else {
          console.log('⚠️ No user data found in database, using session user:', session.user)
          setUser(session.user)
        }
      } else {
        console.log('👻 No initial session user found')
        setUser(null)
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        accessToken: session?.access_token ? '✓ Present' : '✗ Missing'
      })

      setSession(session)
      if (session?.user) {
        console.log('👤 Auth state user:', {
          id: session.user.id,
          email: session.user.email,
          metadata: session.user.user_metadata,
          aud: session.user.aud,
          role: session.user.role
        })
        const userData = await fetchUserData(session.user.id)
        if (userData) {
          const mergedUser = { ...session.user, ...userData }
          console.log('🔄 Merged user data after auth change:', {
            id: mergedUser.id,
            email: mergedUser.email,
            name: mergedUser.name,
            fract_tokens: mergedUser.fract_tokens,
            tokens_used: mergedUser.tokens_used,
            token_balance: mergedUser.token_balance
          })
          setUser(mergedUser)
        } else {
          console.log('⚠️ No user data found after auth change, using session user:', session.user)
          setUser(session.user)
        }
        setShowAuthModal(false)
      } else {
        console.log('👻 No session user found after auth change')
        setUser(null)
        if (event === 'SIGNED_OUT') {
          setShowAuthModal(true)
        }
      }
      setIsLoading(false)
    })

    return () => {
      console.log('🧹 Cleaning up auth listeners')
      subscription.unsubscribe()
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
        console.error('❌ Sign in error:', {
          message: error.message,
          status: error.status,
          name: error.name,
          details: error
        })
        throw error
      }

      if (!data.session) {
        throw new Error('No session returned after successful sign in')
      }

      console.log('✅ Sign in successful:', {
        userId: data.user?.id,
        userEmail: data.user?.email,
        sessionExpiry: data.session?.expires_at,
        accessToken: data.session?.access_token ? '✓ Present' : '✗ Missing'
      })

      setSession(data.session)
      
      if (data.user) {
        const userData = await fetchUserData(data.user.id)
        if (userData) {
          const mergedUser = { ...data.user, ...userData }
          console.log('🔄 Merged user data after sign in:', {
            id: mergedUser.id,
            email: mergedUser.email,
            name: mergedUser.name,
            fract_tokens: mergedUser.fract_tokens,
            tokens_used: mergedUser.tokens_used,
            token_balance: mergedUser.token_balance
          })
          setUser(mergedUser)
        } else {
          console.log('⚠️ No user data found after sign in, using auth user:', data.user)
          setUser(data.user)
        }
        setShowAuthModal(false)
      }
    } catch (error) {
      console.error('❌ Error in signIn:', error)
      throw error
    }
  }

  const signOut = async () => {
    console.log('👋 Signing out...')
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setShowAuthModal(true)
    router.push('/')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        signIn,
        signOut,
        isLoading,
        showAuthModal,
        setShowAuthModal,
      }}
    >
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
