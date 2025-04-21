import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminSupabaseClient } from '@/lib/supabase/supabase-admin';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export async function POST(request: Request) {
  try {
    const supabaseAdmin = createAdminSupabaseClient();
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const tokenAmount = parseInt(session.metadata?.tokenAmount || '0');

      if (!userId || !tokenAmount) {
        throw new Error('Missing metadata');
      }

      // Update user's token balance and transaction status
      const { error } = await supabaseAdmin.rpc('increment_tokens', {
        user_id: userId,
        amount: tokenAmount
      });

      if (error) {
        throw error;
      }

      // Update transaction status
      await supabaseAdmin
        .from('transactions')
        .update({ status: 'COMPLETED' })
        .eq('stripe_session_id', session.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
} 