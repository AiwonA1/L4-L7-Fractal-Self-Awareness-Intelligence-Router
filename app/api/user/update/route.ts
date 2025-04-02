import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    console.log('Starting user update process...')
    
    // Get the session with detailed logging
    const session = await getServerSession(authOptions)
    console.log('Session details:', {
      exists: !!session,
      email: session?.user?.email,
      name: session?.user?.name,
      id: session?.user?.id,
      tokenBalance: (session?.user as any)?.tokenBalance
    })
    
    if (!session?.user?.email) {
      console.log('Authentication failed: No session or email')
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify user exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true, tokenBalance: true }
    })

    if (!existingUser) {
      console.log('User not found in database:', session.user.email)
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    console.log('Existing user found:', existingUser)

    const body = await request.json()
    console.log('Request body:', body)
    const { displayName, email } = body

    // Verify email matches session
    if (email && email !== session.user.email) {
      console.log('Email mismatch:', { sessionEmail: session.user.email, requestEmail: email })
      return NextResponse.json(
        { message: 'Email mismatch' },
        { status: 403 }
      )
    }

    // Validate input
    if (!displayName) {
      console.log('Validation failed: Display name is required')
      return NextResponse.json(
        { message: 'Display name is required' },
        { status: 400 }
      )
    }

    console.log('Updating user in database:', {
      email: session.user.email,
      newDisplayName: displayName
    })

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: displayName,
      },
      select: {
        id: true,
        email: true,
        name: true,
        tokenBalance: true
      }
    })

    console.log('Database update successful:', updatedUser)
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      error
    })
    return NextResponse.json(
      { message: 'Failed to update user settings' },
      { status: 500 }
    )
  }
} 