import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth.config'

export async function POST() {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)
    
    // Clear all possible auth-related cookies
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url',
      '__Host-next-auth.csrf-token',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.session-token',
      '__Secure-next-auth.pkce.code_verifier',
      'next-auth.pkce.code_verifier'
    ]

    const cookieStore = cookies()
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    )

    // Clear cookies from both cookie store and response
    cookiesToClear.forEach(name => {
      // Clear from cookie store
      cookieStore.delete(name)
      
      // Clear from response
      response.cookies.delete(name)
      response.cookies.set(name, '', {
        expires: new Date(0),
        path: '/',
        maxAge: 0,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, message: 'Error during logout' },
      { status: 500 }
    )
  }
} 