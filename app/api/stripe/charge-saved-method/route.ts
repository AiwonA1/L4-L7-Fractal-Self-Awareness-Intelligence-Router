import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

export async function POST(request: Request) {
  try {
    // Get Supabase session
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If user doesn't have a Stripe customer ID, they can't have saved payment methods
    if (!user.stripe_customer_id) {
      return NextResponse.json({ error: 'No saved payment method found' }, { status: 400 })
    }

    // Extract request body
    const { amount, priceInCents } = await request.json()

    // Validate input
    if (!amount || !priceInCents) {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 })
    }

    // Get the default payment method for the customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripe_customer_id,
      type: 'card',
    })

    if (paymentMethods.data.length === 0) {
      return NextResponse.json({ error: 'No saved payment method found' }, { status: 400 })
    }

    // Use the first payment method (in a real app, you might want to let the user choose)
    const paymentMethodId = paymentMethods.data[0].id

    // Calculate tax (in a real app, you would call a tax API based on customer location)
    const taxAmount = Math.round(priceInCents * 0.07) // 7% tax
    const totalAmount = priceInCents + taxAmount

    // Create a payment intent with the saved payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      customer: user.stripe_customer_id,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      metadata: {
        userId: user.id,
        tokenAmount: amount.toString(),
        taxAmount: taxAmount.toString(),
      },
    })

    // If the payment is successful, update the user's token balance and create a transaction record
    if (paymentIntent.status === 'succeeded') {
      // Add tokens to the user's balance
      await prisma.user.update({
        where: { id: user.id },
        data: {
          token_balance: {
            increment: amount,
          },
        },
      })

      // Create transaction record
      await prisma.transaction.create({
        data: {
          user_id: user.id,
          type: 'PURCHASE',
          amount: amount,
          status: 'COMPLETED',
          description: `Purchased ${amount} FractiTokens (Payment Intent: ${paymentIntent.id}, Tax: ${taxAmount})`
        }
      })

      return NextResponse.json({ 
        success: true,
        paymentIntentId: paymentIntent.id 
      })
    }

    // If payment requires additional action, return the client_secret
    if (paymentIntent.status === 'requires_action' && paymentIntent.next_action) {
      return NextResponse.json({
        requires_action: true,
        payment_intent_client_secret: paymentIntent.client_secret,
      })
    }

    // Payment didn't succeed
    return NextResponse.json({ 
      error: `Payment failed with status: ${paymentIntent.status}` 
    }, { status: 400 })
    
  } catch (error) {
    console.error('Stripe charge error:', error)
    
    // Handle Stripe card error specifically
    if (error instanceof Stripe.errors.StripeCardError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process payment' },
      { status: 500 }
    )
  }
} 