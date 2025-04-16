import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

    // Sign up user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    })

    if (authError) {
      console.error('Supabase Auth error:', authError)
      return NextResponse.json(
        { message: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      console.error('No user data returned from Supabase')
      return NextResponse.json(
        { message: 'Failed to create user' },
        { status: 500 }
      )
    }

    console.log('Creating user in database...')
    // Create user in our database
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        name,
        token_balance: 33, // Initial free tokens
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
    
    return NextResponse.json(
      { 
        message: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    )
  }
} 