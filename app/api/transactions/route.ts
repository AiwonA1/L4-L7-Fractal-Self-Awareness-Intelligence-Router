import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET() {
  try {
    // Get token from cookies
    const token = cookies().get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token
    const decoded = verify(token, JWT_SECRET) as { userId: string }

    // Get user's transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      take: 10, // Limit to last 10 transactions
      select: {
        id: true,
        type: true,
        amount: true,
        status: true,
        description: true,
        createdAt: true
      }
    })

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
} 