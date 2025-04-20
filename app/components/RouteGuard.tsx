'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'

interface RouteGuardProps {
  children: React.ReactNode
}

const publicRoutes = ['/about', '/contact', '/privacy-policy']
const authRoutes = ['/login', '/signup', '/forgot-password']

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    const isAuthRoute = authRoutes.includes(pathname)
    const isPublicRoute = publicRoutes.includes(pathname)
    const isRootPath = pathname === '/'

    if (user) {
      // Logged in users shouldn't access auth routes
      if (isAuthRoute || isRootPath) {
        router.replace('/dashboard')
        return
      }
    } else {
      // Non-logged in users can only access public and auth routes
      if (!isPublicRoute && !isAuthRoute) {
        router.replace('/login')
        return
      }
    }
  }, [user, isLoading, pathname, router])

  // Show nothing while loading
  if (isLoading) {
    return null
  }

  return <>{children}</>
} 