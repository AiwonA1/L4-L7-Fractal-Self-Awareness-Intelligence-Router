import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'

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
      }
    })

    return NextResponse.json(chats)
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
        user_id: session.user.id
      }
    })

    return NextResponse.json(chat)
  } catch (error) {
    console.error('Error creating chat:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 