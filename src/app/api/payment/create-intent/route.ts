import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server';
import { stripe, getPriceFromTier, getTokensFromTier } from '@/lib/stripe';
import { TokenTier } from '@/lib/stripe-client';
import type { Database } from '@/types/supabase';
import { rateLimitCheck } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // 1. Authenticate User
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const userId = session.user.id;

    // --- Rate Limiting (Authenticated User) ---
    const { success: limitReached } = await rateLimitCheck(userId, 'payment');
    if (!limitReached) {
        return NextResponse.json({ error: 'Too many payment requests' }, { status: 429 });
    }
    // --- End Rate Limiting ---

    // 2. Get Tier and Validate implicitly via price lookup
    const { tier } = await request.json() as { tier: TokenTier }; // Keep type assertion
    const amount = getPriceFromTier(tier); // Assumes price in cents
    const tokens = getTokensFromTier(tier);

    // If price or tokens are null, the tier is invalid or misconfigured
    if (amount === null || tokens === null) {
        console.error(`Invalid price/token configuration or invalid tier provided: ${tier}`);
        // Return 400 for bad client input (invalid tier)
        return NextResponse.json({ error: 'Invalid or unsupported tier provided' }, { status: 400 });
    }

    // 3. Get User Data (including Stripe Customer ID)
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('id, email, stripe_customer_id')
      .eq('id', userId)
      .single();

    if (dbError || !userData) {
      console.error(`Failed to fetch user data for ${userId}:`, dbError);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    // 4. Get or Create Stripe Customer
    let customerId = userData.stripe_customer_id;
    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          email: userData.email, // Use email from DB
          metadata: {
            supabaseUserId: userId
          }
        });
        customerId = customer.id;

        // Update user record with Stripe customer ID
        const { error: updateError } = await supabase
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('id', userId);

        if (updateError) {
          // Log error but potentially continue, Stripe customer exists
          console.error(`Failed to update user ${userId} with Stripe customer ID ${customerId}:`, updateError);
        }
      } catch (customerError) {
        console.error(`Failed to create Stripe customer for user ${userId}:`, customerError);
        return NextResponse.json({ error: 'Failed to create payment customer' }, { status: 500 });
      }
    }

    // 5. Create Payment Intent
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount, // Ensure this is in cents
        currency: 'usd',
        customer: customerId,
        // automatic_payment_methods: { enabled: true }, // Consider enabling automatic methods
        metadata: {
          userId: userId,
          tier: tier,
          tokens: tokens.toString()
        }
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (intentError) {
      console.error(`Failed to create PaymentIntent for user ${userId}, customer ${customerId}:`, intentError);
      return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 });
    }

  } catch (error) {
    // General catch block
    console.error('Error creating payment intent:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
} 