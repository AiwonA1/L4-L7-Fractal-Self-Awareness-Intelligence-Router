import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);
  
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const amount = session.amount_total || 0;

        // Get user by Stripe customer ID
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id, token_balance')
          .eq('stripe_customer_id', customerId)
          .single();

        if (userError) {
          throw userError;
        }

        if (!user) {
          throw new Error('User not found');
        }

        // Calculate tokens (1 token = $0.01)
        const tokens = Math.floor(amount / 1);

        // Update user's token balance
        const { error: updateError } = await supabase
          .from('users')
          .update({
            token_balance: (user.token_balance || 0) + tokens,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          throw updateError;
        }

        // Create transaction record
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'PURCHASE',
            amount: tokens,
            description: `Purchased ${tokens} tokens`,
            status: 'COMPLETED',
            stripe_session_id: session.id
          });

        if (transactionError) {
          throw transactionError;
        }

        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const customerId = paymentIntent.customer as string;
        const amount = paymentIntent.amount;

        // Get user by Stripe customer ID
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id, token_balance')
          .eq('stripe_customer_id', customerId)
          .single();

        if (userError) {
          throw userError;
        }

        if (!user) {
          throw new Error('User not found');
        }

        // Calculate tokens (1 token = $0.01)
        const tokens = Math.floor(amount / 1);

        // Update user's token balance
        const { error: updateError } = await supabase
          .from('users')
          .update({
            token_balance: (user.token_balance || 0) + tokens,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          throw updateError;
        }

        // Create transaction record
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'PURCHASE',
            amount: tokens,
            description: `Purchased ${tokens} tokens`,
            status: 'COMPLETED',
            stripe_payment_intent_id: paymentIntent.id
          });

        if (transactionError) {
          throw transactionError;
        }

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook handler failed' },
      { status: 400 }
    );
  }
} 