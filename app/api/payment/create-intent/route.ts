import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { stripe, getPriceFromTier, getTokensFromTier } from '@/app/lib/stripe';
import { TokenTier } from '@/app/lib/stripe-client';

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the authenticated user from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user data from users table
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('id, email, stripe_customer_id')
      .eq('id', session.user.id)
      .single();

    if (dbError || !userData) {
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    // Get the tier from request body
    const { tier } = await request.json() as { tier: TokenTier };
    const amount = getPriceFromTier(tier);
    const tokens = getTokensFromTier(tier);

    // Get or create Stripe customer
    let customerId = userData.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          supabaseUserId: userData.id
        }
      });

      customerId = customer.id;

      // Update user with Stripe customer ID
      const { error: updateError } = await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userData.id);

      if (updateError) {
        console.error('Error updating user with Stripe customer ID:', updateError);
        return NextResponse.json(
          { error: 'Failed to update user data' },
          { status: 500 }
        );
      }
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customerId,
      metadata: {
        userId: userData.id,
        tier,
        tokens: tokens.toString()
      }
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 