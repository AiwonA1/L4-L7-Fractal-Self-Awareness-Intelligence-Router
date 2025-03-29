import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's usage statistics
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        usage: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate total usage
    const totalUsage = user.usage.reduce((acc, curr) => ({
      inputTokens: acc.inputTokens + (curr.inputTokens || 0),
      outputTokens: acc.outputTokens + (curr.outputTokens || 0),
      totalTokens: acc.totalTokens + (curr.totalTokens || 0),
      cost: acc.cost + (curr.cost || 0),
      fractiTokensUsed: acc.fractiTokensUsed + (curr.fractiTokensUsed || 0)
    }), {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      cost: 0,
      fractiTokensUsed: 0
    })

    // Get usage by day for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyUsage = await prisma.usage.groupBy({
      by: ['createdAt'],
      where: {
        userId: user.id,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _sum: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        cost: true,
        fractiTokensUsed: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get usage by chat
    const chatUsage = await prisma.chat.findMany({
      where: {
        userId: user.id
      },
      include: {
        usage: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    // Format the response
    const formattedResponse = {
      totalUsage,
      dailyUsage: dailyUsage.map(day => ({
        timestamp: day.createdAt,
        _sum: {
          inputTokens: day._sum.inputTokens || 0,
          outputTokens: day._sum.outputTokens || 0,
          totalTokens: day._sum.totalTokens || 0,
          cost: day._sum.cost || 0,
          fractiTokensUsed: day._sum.fractiTokensUsed || 0
        }
      })),
      chatUsage: chatUsage.map(chat => ({
        id: chat.id,
        title: chat.title,
        usage: chat.usage.map(usage => ({
          inputTokens: usage.inputTokens || 0,
          outputTokens: usage.outputTokens || 0,
          totalTokens: usage.totalTokens || 0,
          cost: usage.cost || 0,
          fractiTokensUsed: usage.fractiTokensUsed || 0,
          timestamp: usage.createdAt
        }))
      })),
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(formattedResponse)
  } catch (error) {
    console.error('Error fetching usage statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics. Please try again.' },
      { status: 500 }
    )
  }
} 