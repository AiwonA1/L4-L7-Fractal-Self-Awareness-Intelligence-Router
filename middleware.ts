import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

// Keep track of redirects to prevent loops
const MAX_REDIRECTS = 3
const redirectCount = new Map<string, number>()

export async function middleware(req: NextRequest) {
  // Get or initialize redirect count for this request ID
  const requestId = req.headers.get('x-request-id') || req.url
  const currentCount = redirectCount.get(requestId) || 0

  // Check for redirect loops
  if (currentCount >= MAX_REDIRECTS) {
    console.error('Max redirects reached for:', requestId, 'Path:', req.nextUrl.pathname)
    redirectCount.delete(requestId)
    return NextResponse.next()
  }

  const res = NextResponse.next()
  
  try {
    const supabase = createMiddlewareClient<Database>({ req, res })
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session error:', sessionError)
      return res
    }

    // Define routes
    const publicRoutes = ['/', '/about', '/contact', '/privacy-policy']
    const authRoutes = ['/signin', '/signup', '/login', '/auth']
    const protectedRoutes = ['/dashboard', '/settings', '/profile']

    const currentPath = req.nextUrl.pathname
    const isAuthRoute = authRoutes.includes(currentPath)
    const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route))
    const isPublicRoute = publicRoutes.includes(currentPath)

    console.log('Route check:', {
      path: currentPath,
      isAuthRoute,
      isProtectedRoute,
      isPublicRoute,
      hasSession: !!session,
      redirectCount: currentCount
    })

    let redirectUrl: string | null = null

    // Determine redirect based on session state and current route
    if (session) {
      // Logged in users
      if (isAuthRoute) {
        redirectUrl = '/dashboard'
      }
    } else {
      // Not logged in users
      if (isProtectedRoute) {
        redirectUrl = '/signin'
      }
    }

    // If redirect is needed, increment counter and redirect
    if (redirectUrl) {
      redirectCount.set(requestId, currentCount + 1)
      console.log('Redirecting to:', redirectUrl, 'Count:', currentCount + 1)
      return NextResponse.redirect(new URL(redirectUrl, req.url))
    }

    // No redirect needed, clear counter
    redirectCount.delete(requestId)
    return res

  } catch (error) {
    console.error('Middleware error:', error)
    // On error, clear counter and continue
    redirectCount.delete(requestId)
    return res
  }
}

// Specify which routes should trigger this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api|assets).*)',
  ],
} 