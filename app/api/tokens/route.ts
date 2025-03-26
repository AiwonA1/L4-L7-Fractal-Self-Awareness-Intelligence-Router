import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tokenBalance: true }
    })

    if (!user) {
      // Create user if they don't exist
      const newUser = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.name || '',
          password: '', // This will be updated on first login
          tokenBalance: 33 // Give new users 33 free tokens
        },
        select: { tokenBalance: true }
      })
      return NextResponse.json({ balance: newUser.tokenBalance })
    }

    return NextResponse.json({ balance: user.tokenBalance })
  } catch (error) {
    console.error('Error fetching token balance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, amount } = await request.json()

    // Ensure user exists
    let user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      // Create user if they don't exist
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.name || '',
          password: '', // This will be updated on first login
          tokenBalance: 33 // Give new users 33 free tokens
        }
      })
    }

    if (action === 'purchase') {
      // In a real implementation, this would handle payment processing
      // For now, we'll just simulate a successful purchase
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: { tokenBalance: { increment: amount } },
        select: { tokenBalance: true }
      })

      return NextResponse.json({ 
        success: true, 
        balance: updatedUser.tokenBalance,
        message: `Successfully purchased ${amount} tokens!`
      })
    }

    if (action === 'deduct') {
      if (user.tokenBalance < 1) {
        return NextResponse.json({ 
          error: 'Insufficient tokens',
          balance: user.tokenBalance
        }, { status: 400 })
      }

      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: { tokenBalance: { decrement: 1 } },
        select: { tokenBalance: true }
      })

      return NextResponse.json({ 
        success: true, 
        balance: updatedUser.tokenBalance
      })
    }

    if (action === 'add') {
      const updatedUser = await prisma.user.update({
        where: { email: 'espressolico@gmail.com' },
        data: { tokenBalance: { increment: amount } },
        select: { tokenBalance: true }
      })

      return NextResponse.json({ 
        success: true, 
        balance: updatedUser.tokenBalance,
        message: `Successfully added ${amount} tokens!`
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing token operation:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 