import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { stripe, getPriceIdFromTier } from '@/app/lib/stripe'
import { FRACTIVERSE_PRICES, TokenTier } from '@/app/lib/stripe-client'
import { supabaseAdmin } from '../../../lib/supabase-admin'

// Validate required environment variables
const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
}

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

export async function POST(request: Request) {
  try {
    // Get the user data from the request
    const body = await request.json()
    const tier = body.tier as TokenTier
    
    if (!tier || !FRACTIVERSE_PRICES[tier]) {
      return NextResponse.json(
        { error: 'Invalid tier selected' },
        { status: 400 }
      )
    }

    // Get auth token from cookies
    const cookieStore = cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user from Supabase auth
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken)

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    // Get user data from users table using admin client
    const { data: userData, error: dbError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, fract_tokens, tokens_used, token_balance')
      .eq('id', user.id)
      .single()

    if (dbError || !userData) {
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    try {
      const priceId = getPriceIdFromTier(tier)
      const tokenAmount = FRACTIVERSE_PRICES[tier].tokens

      // Create Stripe checkout session
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
        metadata: {
          userId: userData.id,
          tokenAmount: tokenAmount.toString(),
          tier: tier
        },
        customer_email: userData.email,
      })

      // Create a pending transaction record using admin client
      const { error: transactionError } = await supabaseAdmin
        .from('transactions')
        .insert({
          user_id: userData.id,
          type: 'PURCHASE',
          amount: tokenAmount,
          description: `Purchase of ${tokenAmount} FractiTokens (${tier})`,
          status: 'PENDING',
          stripe_session_id: checkoutSession.id
        })

      if (transactionError) {
        console.error('Error creating transaction record:', transactionError)
        // Continue with checkout even if transaction record fails
      }

      return NextResponse.json({ url: checkoutSession.url })
    } catch (stripeError) {
      console.error('Stripe error:', stripeError)
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'

export async function GET(request: Request) {
  return POST(request)
} 