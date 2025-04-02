import { NextResponse } from 'next/server'
import { stripe } from '@/app/lib/stripe'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import Stripe from 'stripe'

// Stripe webhook handler
export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature') as string
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }
  
  // Handle the event
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      
      // Extract user and token information from metadata
      const userId = session.metadata?.userId
      const tokenAmount = session.metadata?.tokenAmount
      
      if (!userId || !tokenAmount) {
        throw new Error('Missing metadata in Stripe session')
      }
      
      // Add tokens to user's balance
      const tokens = parseInt(tokenAmount, 10)
      
      // Update user's token balance
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          tokenBalance: {
            increment: tokens
          }
        }
      })
      
      // Create a transaction record
      await prisma.transaction.create({
        data: {
          userId: userId,
          type: 'PURCHASE',
          amount: tokens,
          description: `Purchased ${tokens} FractiTokens`,
          status: 'COMPLETED',
        }
      })
      
      console.log(`Added ${tokens} tokens to user ${userId}`)
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    )
  }
} 