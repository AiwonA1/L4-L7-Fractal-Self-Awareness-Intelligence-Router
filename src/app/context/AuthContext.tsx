'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import type { User as UserProfile } from '@/lib/types'
import { getUserProfile } from '@/lib/services/user'

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  userProfile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

interface AuthProviderProps {
  children: React.ReactNode;
  initialSession: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children, initialSession }: AuthProviderProps) {
  const [user, setUser] = useState<SupabaseUser | null>(initialSession?.user ?? null)
  const [session, setSession] = useState<Session | null>(initialSession)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(!initialSession)
  const router = useRouter()

  const fetchUserProfile = async (userId: string) => {
    const profile = await getUserProfile(userId)
    setUserProfile(profile)
  }

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)
      try {
        let currentSession = initialSession
        if (!currentSession) {
          const { data } = await supabase.auth.getSession()
          currentSession = data.session
        }

        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
          await fetchUserProfile(currentSession.user.id)

          supabase.realtime.setAuth(currentSession.access_token)

          const path = window.location.pathname
          if (['/login', '/signup', '/signin', '/'].includes(path)) {
            router.replace('/dashboard')
          }
        } else {
          setUser(null)
          setSession(null)
          setUserProfile(null)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setUser(null)
        setSession(null)
        setUserProfile(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)

      setSession(session)
      setUser(session?.user ?? null)

      if (session) {
        supabase.realtime.setAuth(session.access_token)
        await fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
      }

      if (event === 'SIGNED_IN') {
        // Redirect handled by initializeAuth potentially, or add explicit check if needed
        // router.replace('/dashboard')
      } else if (event === 'SIGNED_OUT') {
        router.replace('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.session) {
        supabase.realtime.setAuth(data.session.access_token)
        
        const { data: { session: verifiedSession } } = await supabase.auth.getSession()
        if (!verifiedSession) {
          throw new Error('Session not persisted after sign in')
        }
        
        router.replace('/dashboard')
      }
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const value = {
    user,
    session,
    userProfile,
    signIn,
    signOut,
    isLoading
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
