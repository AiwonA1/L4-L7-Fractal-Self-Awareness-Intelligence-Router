import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
})

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: Request) {
  try {
    const token = cookies().get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string }
    const { tier } = await request.json()

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: tier.price * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        userId: decoded.userId,
        tokens: tier.tokens.toString()
      }
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    )
  }
} 