import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ user: null })
    }

    try {
      const decoded = verify(token, JWT_SECRET) as { userId: string }
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          token_balance: true,
          image: true,
        },
      })

      if (!user) {
        return NextResponse.json({ user: null })
      }

      return NextResponse.json({ user })
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError)
      // Clear the invalid token
      const response = NextResponse.json({ user: null })
      response.cookies.delete('auth-token')
      return response
    }
  } catch (error) {
    console.error('Session check failed:', error)
    return NextResponse.json({ user: null })
  }
} 