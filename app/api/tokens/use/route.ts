import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import prisma from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: Request) {
  try {
    // Verify authentication
    const token = cookies().get('next-auth.session-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user ID from token
    const decoded = verify(token, JWT_SECRET) as { userId: string }
    
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has enough tokens
    if (user.tokenBalance < 1) {
      return NextResponse.json(
        { error: 'Insufficient tokens' },
        { status: 400 }
      )
    }

    // Update token balance
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        tokenBalance: user.tokenBalance - 1
      }
    })

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'USE',
        amount: 1,
        description: 'Token used for service',
        status: 'COMPLETED'
      }
    })

    return NextResponse.json({
      message: 'Token used successfully',
      tokenBalance: updatedUser.tokenBalance
    })
  } catch (error) {
    console.error('Token use error:', error)
    return NextResponse.json(
      { error: 'Failed to use token' },
      { status: 500 }
    )
  }
} 