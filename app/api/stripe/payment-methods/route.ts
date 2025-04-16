import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

export const dynamic = 'force-dynamic'

export async function GET() {
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

    // If user doesn't have a Stripe customer ID, they don't have any payment methods
    if (!user.stripe_customer_id) {
      return NextResponse.json({ paymentMethods: [] })
    }

    // Retrieve the customer's payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripe_customer_id,
      type: 'card',
    })

    return NextResponse.json({
      paymentMethods: paymentMethods.data.map(method => ({
        id: method.id,
        type: method.type,
        card: method.type === 'card' ? {
          brand: method.card?.brand,
          last4: method.card?.last4,
          expMonth: method.card?.exp_month,
          expYear: method.card?.exp_year,
        } : null,
        isDefault: method.metadata?.default === 'true'
      }))
    })
  } catch (error) {
    console.error('Error retrieving payment methods:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve payment methods' },
      { status: 500 }
    )
  }
} 