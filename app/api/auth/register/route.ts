import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../[...nextauth]/route'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/emailService'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // If user is already logged in, return error
    if (session) {
      return NextResponse.json(
        { message: 'You are already logged in' },
        { status: 400 }
      )
    }

    const { email, password, name } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user with unverified email
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerified: null
      }
    })

    // Send verification email
    const emailSent = await sendVerificationEmail(email)

    if (!emailSent) {
      // If email fails, delete the user
      await prisma.user.delete({
        where: { id: user.id }
      })
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Registration successful. Please check your email to verify your account.'
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
} 