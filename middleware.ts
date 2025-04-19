import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    // Protected routes - add your protected paths here
    const protectedPaths = ['/dashboard', '/settings', '/billing']
    const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))
    
    if (isProtectedPath && !session) {
      // Redirect to login if accessing protected route without session
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    if (session && request.nextUrl.pathname === '/') {
      // Redirect to dashboard if logged in and accessing home
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    return NextResponse.next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
} 