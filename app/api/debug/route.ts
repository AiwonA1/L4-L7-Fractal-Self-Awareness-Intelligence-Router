import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { cookies } from 'next/headers'
import { getToken } from 'next-auth/jwt'
import { headers } from 'next/headers'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    // Get cookies from the request
    const cookieStore = cookies()
    const cookieList = cookieStore.getAll()
    const cookieNames = cookieList.map(c => c.name)
    const sessionCookie = cookieStore.get('next-auth.session-token')
    
    // Check if we can connect to the database with a more selective query
    const dbCheck = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        name: true,
        tokenBalance: true,
        createdAt: true
      }
    })
    
    // Get the session with authOptions
    const session = await getServerSession(authOptions)
    
    // Try to decode the JWT token
    let tokenStatus = "Not found"
    try {
      // Create a headers object for token verification
      const headersList = headers()
      const cookie = headersList.get('cookie') || ''
      
      // The request parameter in getToken requires specific properties
      // We'll use a simpler approach by passing just what it needs
      const token = await getToken({ 
        secret: process.env.NEXTAUTH_SECRET,
        raw: true,
        req: { headers: { cookie } } as any
      })
      
      tokenStatus = token ? "Valid token: " + JSON.stringify(token) : "No token found"
    } catch (error) {
      tokenStatus = "Error decoding token: " + (error instanceof Error ? error.message : String(error))
    }
    
    // Check NextAuth configuration
    const authConfig = {
      secret: process.env.NEXTAUTH_SECRET ? "Set" : "Not set",
      url: process.env.NEXTAUTH_URL,
      providers: authOptions.providers.map(p => p.id || 'unknown').join(', '),
      secretLength: process.env.NEXTAUTH_SECRET ? process.env.NEXTAUTH_SECRET.length : 0
    }
    
    return NextResponse.json({
      message: "Auth debug information",
      dbConnection: "Connected successfully",
      dbFirstUser: dbCheck,
      sessionExists: !!session,
      session: session,
      nextAuthConfig: authConfig,
      cookieStatus: {
        cookieNames,
        sessionCookie: sessionCookie ? "Found" : "Not found",
        sessionCookieValue: sessionCookie ? sessionCookie.value.substring(0, 20) + "..." : "N/A"
      },
      tokenStatus,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Debug route error:", error)
    return NextResponse.json({
      message: "Error in debug route",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 