import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = cookies()
  
  // Get all cookies
  const allCookies = cookieStore.getAll()
  
  // NextAuth cookie names to specifically target
  const nextAuthCookies = [
    'next-auth.session-token',
    'next-auth.callback-url',
    'next-auth.csrf-token',
    '__Secure-next-auth.callback-url',
    '__Secure-next-auth.session-token',
    '__Secure-next-auth.csrf-token',
    '__Host-next-auth.csrf-token',
    'auth-token'
  ]
  
  // Delete all cookies
  for (const cookie of allCookies) {
    try {
      cookieStore.delete(cookie.name)
    } catch (e) {
      console.error(`Error deleting cookie ${cookie.name}:`, e)
    }
  }
  
  // Also specifically try to delete NextAuth cookies using different paths
  for (const cookieName of nextAuthCookies) {
    try {
      cookieStore.delete(cookieName)
      cookieStore.delete({
        name: cookieName,
        path: '/',
      })
      cookieStore.delete({
        name: cookieName,
        path: '/api',
      })
      cookieStore.delete({
        name: cookieName,
        path: '/dashboard',
      })
    } catch (e) {
      console.error(`Error deleting NextAuth cookie ${cookieName}:`, e)
    }
  }
  
  const response = NextResponse.json(
    { success: true, message: 'Cookies cleared server-side' },
    { status: 200 }
  )
  
  // Also try to delete cookies via response
  for (const cookieName of nextAuthCookies) {
    response.cookies.delete(cookieName)
    response.cookies.set(cookieName, '', { 
      maxAge: 0,
      path: '/',
    })
  }
  
  return response
}

export const dynamic = 'force-dynamic' // Always run on the server 