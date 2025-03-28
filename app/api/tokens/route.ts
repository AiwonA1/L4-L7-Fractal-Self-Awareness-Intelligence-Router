import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

export async function GET() {
  console.log('📥 [API] GET /api/tokens')
  try {
    const session = await getServerSession()
    console.log('🔑 [API] Session:', session?.user?.id || session?.user?.email)

    if (!session?.user?.email) {
      console.log('❌ [API] Unauthorized - No session or user email')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 [API] Finding user by email:', session.user.email)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      console.log('❌ [API] User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('✅ [API] Returning token balance:', user.tokenBalance)
    return NextResponse.json({ balance: user.tokenBalance })
  } catch (error) {
    console.error('💥 [API] Error in GET /api/tokens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch token balance' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  console.log('📥 [API] POST /api/tokens')
  try {
    const session = await getServerSession()
    console.log('🔑 [API] Session:', session?.user?.email)

    if (!session?.user?.email) {
      console.log('❌ [API] Unauthorized - No session or user email')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, amount } = await request.json()

    if (action !== 'purchase' || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid purchase request' },
        { status: 400 }
      )
    }

    console.log('🔍 [API] Finding user by email:', session.user.email)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      console.log('❌ [API] User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('💰 [API] Updating token balance')
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        tokenBalance: {
          increment: amount
        }
      }
    })

    console.log('📝 [API] Creating transaction record')
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'PURCHASE',
        amount: amount,
        status: 'COMPLETED',
        description: `Purchased ${amount} FractiTokens`
      }
    })

    console.log('✅ [API] Token purchase successful')
    return NextResponse.json({
      success: true,
      balance: updatedUser.tokenBalance
    })
  } catch (error) {
    console.error('💥 [API] Error processing token purchase:', error)
    return NextResponse.json(
      { error: 'Failed to process token purchase' },
      { status: 500 }
    )
  }
} 