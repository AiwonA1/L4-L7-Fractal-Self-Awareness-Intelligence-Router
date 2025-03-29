import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate a reset token
    const resetToken = Math.random().toString(36).slice(-8)
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Store the reset token in the database
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expires: resetTokenExpiry,
      },
    })

    // In a real application, you would send an email here
    // For development, we'll just return the token
    return NextResponse.json({
      message: 'Password reset token generated',
      token: resetToken, // Only for development
      expiresAt: resetTokenExpiry,
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
} 