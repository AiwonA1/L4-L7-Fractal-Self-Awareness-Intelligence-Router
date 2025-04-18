import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import type { Database } from '@/types/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: Request) {
  const supabase = createClient<Database>(supabaseUrl, supabaseKey)
  
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('sb-access-token')?.value
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionCookie)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user details from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { amount, payment_method_id } = body

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      customer: userData.stripe_customer_id,
      payment_method: payment_method_id,
      off_session: true,
      confirm: true,
    })

    if (paymentIntent.status === 'succeeded') {
      // Calculate token amount (1 token per dollar)
      const tokenAmount = amount

      // Update user's token balance
      const { error: updateError } = await supabase
        .from('users')
        .update({
          token_balance: (userData.token_balance || 0) + tokenAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'PURCHASE',
          amount: tokenAmount,
          description: `Purchased ${tokenAmount} FractiTokens`,
          status: 'COMPLETED'
        })

      if (transactionError) throw transactionError

      return NextResponse.json({
        success: true,
        message: 'Payment successful',
        token_balance: (userData.token_balance || 0) + tokenAmount
      })
    } else {
      throw new Error('Payment failed')
    }
  } catch (error: any) {
    console.error('Error processing payment:', error)
    return NextResponse.json({
      error: error.message || 'Payment processing failed'
    }, { status: 500 })
  }
} 