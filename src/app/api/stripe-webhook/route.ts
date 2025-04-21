import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Error verifying webhook signature:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      const userId = session.metadata?.userId
      const tokenAmount = parseInt(session.metadata?.tokens || '0')

      if (!userId || !tokenAmount) {
        throw new Error('Missing user ID or token amount in session metadata')
      }

      const supabase = createServerSupabaseClient()

      // Get current user data
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('fract_tokens')
        .eq('id', userId)
        .single()

      if (fetchError) {
        throw new Error(`Error fetching user data: ${fetchError.message}`)
      }

      // Update token balance
      const currentTokens = userData?.fract_tokens || 0
      const newTokenBalance = currentTokens + tokenAmount

      const { error: updateError } = await supabase
        .from('users')
        .update({ fract_tokens: newTokenBalance })
        .eq('id', userId)

      if (updateError) {
        throw new Error(`Error updating token balance: ${updateError.message}`)
      }

      console.log(`Successfully updated token balance for user ${userId}. New balance: ${newTokenBalance}`)
    } catch (error) {
      console.error('Error processing successful payment:', error)
      return NextResponse.json(
        { error: 'Error processing payment' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}

export const runtime = 'nodejs' 