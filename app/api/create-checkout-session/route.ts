import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Price IDs for different token amounts
const PRICE_IDS = {
  '100': 'price_1R7hB106fMp9kRFhhED5QboC',
  '500': 'price_1R7hBl06fMp9kRFhVy0KP3VU',
  '1000': 'price_1R7hCS06fMp9kRFh2U4auJCY'
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: Request) {
  try {
    const { data: { session } } = await supabaseAdmin.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const priceId = PRICE_IDS[body.amount as keyof typeof PRICE_IDS] || PRICE_IDS['500'] // Default to 500 tokens

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
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      metadata: {
        userId: session.user.id,
        tokenAmount: body.amount || '500'
      },
      customer_email: session.user.email,
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

export async function GET(request: Request) {
  return POST(request)
} 