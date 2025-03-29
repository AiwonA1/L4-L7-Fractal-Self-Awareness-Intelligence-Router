import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/emailService'

export async function POST(request: Request) {
  try {
    console.log('Starting user registration process...')
    
    const session = await getServerSession(authOptions)
    
    // If user is already logged in, return error
    if (session) {
      console.log('User already logged in, returning error')
      return NextResponse.json(
        { message: 'You are already logged in' },
        { status: 400 }
      )
    }

    const { email, password, name } = await request.json()
    console.log('Received registration request for:', email)

    // Validate input
    if (!email || !password) {
      console.log('Missing required fields:', { email: !!email, password: !!password })
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    console.log('Checking if user already exists...')
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('User already exists:', email)
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    console.log('Hashing password...')
    const hashedPassword = await hash(password, 12)

    // Create user with unverified email
    console.log('Creating new user...')
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerified: new Date() // Auto-verify in development
      }
    })
    console.log('User created successfully:', user.id)

    // In development, skip email verification
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Skipping email verification')
      return NextResponse.json({
        message: 'Registration successful. Email verification skipped in development mode.'
      })
    }

    // Send verification email
    console.log('Sending verification email...')
    const emailSent = await sendVerificationEmail(email)

    if (!emailSent) {
      console.log('Failed to send verification email, but keeping user...')
      // In production, we'll keep the user even if email fails
      return NextResponse.json({
        message: 'Registration successful, but email verification failed. Please contact support.'
      })
    }
    console.log('Verification email sent successfully')

    return NextResponse.json({
      message: 'Registration successful. Please check your email to verify your account.'
    })
  } catch (error) {
    console.error('Registration error:', error)
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    return NextResponse.json(
      { error: 'Failed to register user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 