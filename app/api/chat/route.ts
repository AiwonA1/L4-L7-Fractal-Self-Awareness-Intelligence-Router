import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import type { Chat } from '@prisma/client'

export async function GET() {
  const session = await getServerSession()
  
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const chats = await prisma.chat.findMany({
      where: {
        user_id: session.user.id
      },
      orderBy: {
        created_at: 'desc'
      },
      include: {
        messages: {
          orderBy: {
            created_at: 'desc'
          },
          take: 1
        }
      }
    })

    // Format the response to include last_message
    const formattedChats = chats.map((chat: Chat & { messages: { content: string }[] }) => ({
      ...chat,
      last_message: chat.messages[0]?.content || null,
      messages: undefined // Remove messages from response
    }))

    return NextResponse.json(formattedChats)
  } catch (error) {
    console.error('Error fetching chats:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession()
  
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const body = await request.json()
    const { title } = body

    const chat = await prisma.chat.create({
      data: {
        title,
        user_id: session.user.id,
        last_message: null,
        updated_at: new Date()
      }
    })

    return NextResponse.json(chat)
  } catch (error) {
    console.error('Error creating chat:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 