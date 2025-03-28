import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import prisma from '@/lib/prisma'

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
})

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature') as string

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    
    // Get the userId and tokenAmount from the metadata
    const userId = session.metadata?.userId
    const tokenAmount = session.metadata?.tokenAmount

    if (!userId || !tokenAmount) {
      console.error('Missing metadata in webhook event')
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    try {
      // Update user's token balance
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        console.error('User not found:', userId)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Add tokens to the user's balance
      await prisma.user.update({
        where: { id: userId },
        data: {
          tokenBalance: {
            increment: parseInt(tokenAmount),
          },
        },
      })

      // Create transaction record
      await prisma.transaction.create({
        data: {
          userId: userId,
          type: 'PURCHASE',
          amount: parseInt(tokenAmount),
          status: 'COMPLETED',
          description: `Purchased ${tokenAmount} FractiTokens`,
          metadata: { 
            sessionId: session.id,
            paymentMethod: session.payment_method_types?.[0] || 'card'
          },
        },
      })

      console.log(`Successfully processed payment for ${tokenAmount} tokens for user ${userId}`)
      return NextResponse.json({ received: true })
    } catch (error) {
      console.error('Error processing webhook:', error)
      return NextResponse.json(
        { error: 'Error processing webhook' },
        { status: 500 }
      )
    }
  }

  // Handle other event types as needed
  return NextResponse.json({ received: true })
} 