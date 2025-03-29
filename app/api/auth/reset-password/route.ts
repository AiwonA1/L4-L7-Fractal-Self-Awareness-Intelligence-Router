import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    // Check if token exists and is not expired
    const resetToken = await prisma.passwordReset.findFirst({
      where: {
        token,
        expires: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    })

    if (!resetToken || !resetToken.user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hash(password, 12)

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword }
    })

    // Delete used reset token
    await prisma.passwordReset.delete({
      where: { id: resetToken.id }
    })

    return NextResponse.json({
      message: 'Password reset successfully'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
} 