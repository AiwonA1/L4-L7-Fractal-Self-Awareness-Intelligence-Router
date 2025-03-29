import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Stripe from 'stripe'
import prisma from '@/lib/prisma'

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-08-16',
})

export async function POST(request: Request) {
  try {
    // Get the session to check authentication
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Extract request body
    const { amount, priceInCents, mode } = await request.json()

    // Validate input
    if (!amount || !priceInCents) {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 })
    }

    // For test mode in development
    if (mode === 'test' && process.env.NODE_ENV !== 'production') {
      // In test mode, just return success
      console.log(`[TEST MODE] Creating purchase of ${amount} tokens for $${priceInCents/100}`)
      return NextResponse.json({ 
        success: true, 
        testMode: true,
        amount 
      })
    }

    // Create a checkout session with Stripe
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'FractiTokens',
              description: `${amount} FractiTokens for the FractiVerse Router`,
              images: [process.env.NEXT_PUBLIC_URL + '/images/fracti-logo.png']
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        tokenAmount: amount.toString(),
      },
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?canceled=true`,
    })

    return NextResponse.json({ 
      success: true, 
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    )
  }
} 