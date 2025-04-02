import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(req: Request) {
  try {
    console.log('Starting checkout process...')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log('Authentication failed: No session or email')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('User authenticated:', session.user.email)

    // Verify user exists and has token balance
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, tokenBalance: true }
    })

    if (!user) {
      console.log('User not found in database:', session.user.email)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('User found:', { id: user.id, tokenBalance: user.tokenBalance })

    const body = await req.json()
    const { package: tokenPackage } = body

    console.log('Requested package:', tokenPackage)

    // Define package prices
    const PACKAGE_PRICES = {
      100: 20.00,
      500: 90.00,
      1000: 160.00
    }

    // Validate package
    if (!PACKAGE_PRICES[tokenPackage as keyof typeof PACKAGE_PRICES]) {
      console.log('Invalid package selected:', tokenPackage)
      return NextResponse.json(
        { error: 'Invalid package selected' },
        { status: 400 }
      )
    }

    const price = PACKAGE_PRICES[tokenPackage as keyof typeof PACKAGE_PRICES]
    console.log('Package price:', price)

    // Create Stripe checkout session
    console.log('Creating Stripe checkout session...')
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tokenPackage} FractiTokens`,
              description: `Purchase ${tokenPackage} FractiTokens for the L4-L7 Fractal Router`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard`,
      metadata: {
        userId: user.id,
        tokenAmount: tokenPackage,
        userEmail: session.user.email
      },
      customer_email: session.user.email,
    })

    console.log('Stripe session created:', { sessionId: stripeSession.id })
    return NextResponse.json({ url: stripeSession.url })
  } catch (error) {
    console.error('Stripe checkout error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      error
    })
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    )
  }
} 