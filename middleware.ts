import { createServerClient, type CookieOptions } from '@supabase/ssr'
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

  let response = NextResponse.next()

  try {
    // Create Supabase client using ssr
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.delete({
              name,
              ...options,
            })
          },
        },
      }
    )

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session error:', sessionError)
      return response
    }

    // Define routes
    const publicRoutes = ['/', '/about', '/contact', '/privacy-policy']
    const authRoutes = ['/signin', '/signup', '/login', '/auth']
    const protectedRoutes = ['/dashboard', '/settings', '/profile']

    const currentPath = req.nextUrl.pathname
    const isAuthRoute = authRoutes.includes(currentPath)
    const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route))
    const isPublicRoute = publicRoutes.includes(currentPath) || currentPath.startsWith('/layer')

    console.log('Route check:', {
      path: currentPath,
      isAuthRoute,
      isProtectedRoute,
      isPublicRoute,
      hasSession: !!session,
      redirectCount: currentCount
    })

    let redirectUrl: string | null = null

    // Handle redirects based on auth state
    if (session) {
      // Signed in
      if (isAuthRoute) {
        // Redirect from auth routes to dashboard
        redirectUrl = '/dashboard'
      } else if (currentPath === '/') {
        // Already logged in, redirect from home page to dashboard
        redirectUrl = '/dashboard'
      }
    } else {
      // Not signed in
      if (isProtectedRoute) {
        // Redirect to login with return URL
        redirectUrl = '/login'
        redirectUrl += '?' + new URLSearchParams({ returnUrl: currentPath })
      }
    }

    // If redirect is needed, increment counter and redirect
    if (redirectUrl) {
      redirectCount.set(requestId, currentCount + 1)
      console.log('Redirecting to:', redirectUrl, 'Count:', currentCount + 1)
      return NextResponse.redirect(new URL(redirectUrl, req.url))
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return response
  } finally {
    // Clean up redirect count after processing
    if (currentCount > 0) {
      redirectCount.delete(requestId)
    }
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