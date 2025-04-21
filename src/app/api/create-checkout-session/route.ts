import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { stripe, getPriceIdFromTier } from '@/app/lib/stripe'
import { FRACTIVERSE_PRICES, TokenTier } from '@/app/lib/stripe-client'

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
    const supabase = createServerSupabaseClient()
    
    // Get the user data from the request
    const body = await request.json()
    const tier = body.tier as TokenTier
    
    if (!tier || !FRACTIVERSE_PRICES[tier]) {
      return NextResponse.json(
        { error: 'Invalid tier selected' },
        { status: 400 }
      )
    }

    // Get session from Supabase auth
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user data from users table
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('id, email, name, fract_tokens, tokens_used, token_balance')
      .eq('id', session.user.id)
      .single()

    if (dbError || !userData) {
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: userData.email,
      mode: 'payment',
      line_items: [
        {
          price: getPriceIdFromTier(tier),
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/payment/cancel`,
      metadata: {
        userId: userData.id,
        tier,
        tokens: FRACTIVERSE_PRICES[tier].tokens.toString()
      }
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'

export async function GET(request: Request) {
  return POST(request)
} 