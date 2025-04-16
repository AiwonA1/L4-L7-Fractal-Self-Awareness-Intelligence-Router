import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        user: {
          email: session.user.email
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    // Calculate total usage
    const totalUsage = transactions.reduce((acc, curr) => acc + curr.amount, 0)

    // Get daily usage
    const dailyUsage = await prisma.transaction.groupBy({
      by: ['created_at'],
      where: {
        user: {
          email: session.user.email
        }
      },
      _sum: {
        amount: true
      }
    })

    // Get chat usage
    const chatUsage = await prisma.chat.count({
      where: {
        user: {
          email: session.user.email
        }
      }
    })

    return NextResponse.json({
      totalUsage,
      dailyUsage,
      chatUsage,
      transactions
    })

  } catch (error) {
    console.error('Error fetching usage:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    )
  }
} 