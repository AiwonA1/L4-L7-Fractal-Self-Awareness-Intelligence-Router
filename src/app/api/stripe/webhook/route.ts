import { NextResponse } from 'next/server'
import { stripe } from '@/app/lib/stripe'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

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
      
      // Update user's token balance using Supabase
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          fract_tokens: supabaseAdmin.rpc('increment_tokens', { amount: tokens }),
          token_balance: supabaseAdmin.rpc('increment_tokens', { amount: tokens })
        })
        .eq('id', userId)

      if (updateError) {
        throw new Error(`Failed to update user balance: ${updateError.message}`)
      }
      
      // Update transaction status to completed
      const { error: transactionError } = await supabaseAdmin
        .from('transactions')
        .update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString()
        })
        .eq('stripe_session_id', session.id)

      if (transactionError) {
        console.error('Error updating transaction:', transactionError)
        // Continue even if transaction update fails
      }
      
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

export const runtime = 'nodejs' 