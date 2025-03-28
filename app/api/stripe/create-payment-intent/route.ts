import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Stripe from 'stripe'
import prisma from '@/lib/prisma'

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
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
    const { amount, currency, metadata } = await request.json()

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Store customer ID or create a new one if it doesn't exist
    let customerId = user.stripeCustomerId
    
    if (!customerId) {
      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: user.email as string,
        name: user.name || undefined,
        metadata: {
          userId: user.id
        }
      })
      
      customerId = customer.id
      
      // Save the customer ID to the user profile
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      })
    }

    // Calculate tax (if the application allows for it)
    let taxAmount = 0
    if (metadata?.taxAmount) {
      taxAmount = parseInt(metadata.taxAmount)
    }

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency || 'usd',
      customer: customerId,
      metadata: {
        userId: user.id,
        tokenAmount: metadata?.tokenAmount || '0',
        taxAmount: taxAmount.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('Stripe payment intent error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payment intent' },
      { status: 500 }
    )
  }
} 