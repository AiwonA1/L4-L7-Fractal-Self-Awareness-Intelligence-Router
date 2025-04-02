import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    console.log('Starting signup process...')
    
    // Parse request body
    let body
    try {
      body = await req.json()
      console.log('Request body:', { ...body, password: '[REDACTED]' })
    } catch (e) {
      console.error('Failed to parse request body:', e)
      return NextResponse.json(
        { message: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { email, password, name } = body

    // Validate input
    if (!email || !password || !name) {
      console.log('Missing required fields:', { email: !!email, password: !!password, name: !!name })
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('Checking for existing user...')
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    }).catch(e => {
      console.error('Database error checking existing user:', e)
      throw new Error('Database error checking existing user')
    })

    if (existingUser) {
      console.log('User already exists:', email)
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      )
    }

    console.log('Hashing password...')
    // Hash password
    const hashedPassword = await hashPassword(password).catch(e => {
      console.error('Failed to hash password:', e)
      throw new Error('Failed to hash password')
    })

    console.log('Creating new user...')
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        tokenBalance: 33, // Initial free tokens
      }
    }).catch(e => {
      console.error('Database error creating user:', e)
      throw new Error('Database error creating user')
    })

    console.log('User created successfully:', { id: user.id, email: user.email })
    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('Signup error:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    })
    
    // Return a more specific error message
    return NextResponse.json(
      { 
        message: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    )
  }
} 