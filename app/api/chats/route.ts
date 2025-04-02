import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import prisma from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'

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
          userId: decoded.userId
        },
        orderBy: {
          updatedAt: 'desc'
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        }
      })

      const formattedChats = chats.map(chat => ({
        id: chat.id,
        title: chat.title,
        lastMessage: chat.messages[0]?.content || '',
        updatedAt: chat.updatedAt
      }))

      return NextResponse.json(formattedChats)
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 