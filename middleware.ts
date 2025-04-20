import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  try {
    const supabase = createMiddlewareClient<Database>({ req, res })

    // Refresh session if expired
    const { data: { session } } = await supabase.auth.getSession()

    // Handle authentication for protected routes
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                      req.nextUrl.pathname.startsWith('/signup') ||
                      req.nextUrl.pathname.startsWith('/auth')
    
    const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') || 
                            req.nextUrl.pathname.startsWith('/settings') ||
                            req.nextUrl.pathname.startsWith('/profile')

    const isRootPath = req.nextUrl.pathname === '/'

    // If user is logged in and on root path, redirect to dashboard
    if (isRootPath && session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // If user is logged in and trying to access auth pages, redirect to dashboard
    if (isAuthPage && session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // If user is not logged in and trying to access protected routes, redirect to login
    if (isProtectedRoute && !session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
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
     * - api routes that don't require auth
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/public/).*)',
  ],
} 