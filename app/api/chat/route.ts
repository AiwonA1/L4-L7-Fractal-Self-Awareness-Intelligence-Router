import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  console.log("We Are Here: app/api/chat/route.ts - Handling chat request");
  try {
    const session = await getServerSession()
    console.log('🔑 [API] Session:', session?.user?.email)

    if (!session?.user?.email) {
      console.log('❌ [API] Unauthorized - No session or user email')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, messages } = await req.json()
    console.log('📝 [API] Creating chat:', { title, messageCount: messages.length })

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      console.log('❌ [API] User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const chat = await prisma.chat.create({
      data: {
        title,
        messages,
        userId: user.id,
      },
    })

    console.log('✅ [API] Chat created:', chat.id)
    return NextResponse.json(chat)
  } catch (error) {
    console.error('💥 [API] Error in POST /api/chat:', error)
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  console.log('📥 [API] GET /api/chat')
  try {
    const session = await getServerSession()
    console.log('🔑 [API] Session:', session?.user?.email)

    if (!session?.user?.email) {
      console.log('❌ [API] Unauthorized - No session or user email')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      console.log('❌ [API] User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('🔍 [API] Finding chats for user:', user.id)
    const chats = await prisma.chat.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log('✅ [API] Found chats:', chats.length)
    return NextResponse.json(chats)
  } catch (error) {
    console.error('💥 [API] Error in GET /api/chat:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    )
  }
} 