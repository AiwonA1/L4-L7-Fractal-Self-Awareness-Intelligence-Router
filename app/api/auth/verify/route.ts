import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sign } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Verify the token
    const decoded = sign.verify(token, JWT_SECRET) as { email: string }

    // Update user's email verification status
    await prisma.user.update({
      where: { email: decoded.email },
      data: { emailVerified: new Date() }
    })

    return NextResponse.json({ message: 'Email verified successfully' })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Invalid or expired verification token' },
      { status: 400 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Verify the token
    const decoded = sign.verify(token, JWT_SECRET) as { email: string }

    // Update user's email verification status
    await prisma.user.update({
      where: { email: decoded.email },
      data: { emailVerified: new Date() }
    })

    // Redirect to success page
    return NextResponse.redirect(new URL('/verify-success', request.url))
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.redirect(new URL('/verify-error', request.url))
  }
} 