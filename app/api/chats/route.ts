import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import prisma from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const decoded = verify(token, JWT_SECRET) as { userId: string }
      
      const chats = await prisma.chat.findMany({
        where: {
          user_id: decoded.userId
        },
        orderBy: {
          updated_at: 'desc'
        },
        include: {
          messages: {
            orderBy: {
              created_at: 'desc'
            }
          }
        }
      })

      return NextResponse.json({
        chats: chats.map(chat => ({
          ...chat,
          messages: chat.messages,
          updated_at: chat.updated_at
        }))
      })
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 })
  }
} 