import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ balance: user.tokenBalance })
  } catch (error) {
    console.error('Error fetching token balance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch token balance' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, amount } = await request.json()

    if (action !== 'purchase' || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid purchase request' },
        { status: 400 }
      )
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user's token balance
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        tokenBalance: {
          increment: amount
        }
      }
    })

    // Create a transaction record
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'PURCHASE',
        amount: amount,
        status: 'COMPLETED',
        description: `Purchased ${amount} FractiTokens`
      }
    })

    return NextResponse.json({
      success: true,
      balance: updatedUser.tokenBalance
    })
  } catch (error) {
    console.error('Error processing token purchase:', error)
    return NextResponse.json(
      { error: 'Failed to process token purchase' },
      { status: 500 }
    )
  }
} 