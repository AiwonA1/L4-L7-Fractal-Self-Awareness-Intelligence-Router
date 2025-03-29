import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { TokenTier } from '@/app/lib/stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!webhookSecret) {
      throw new Error('Missing Stripe webhook secret');
    }

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const userId = paymentIntent.metadata.userId;
      const tokens = parseInt(paymentIntent.metadata.tokens);

      // Update user's token balance
      await prisma.user.update({
        where: { id: userId },
        data: {
          tokenBalance: {
            increment: tokens
          }
        }
      });

      // Record the transaction
      await prisma.transaction.create({
        data: {
          userId,
          type: 'PURCHASE',
          amount: paymentIntent.amount,
          status: 'COMPLETED',
          description: `Purchased ${tokens} FractiTokens`,
          metadata: {
            paymentIntentId: paymentIntent.id,
            tokens: tokens
          }
        }
      });
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      const userId = paymentIntent.metadata.userId;
      const tokens = parseInt(paymentIntent.metadata.tokens);

      // Record the failed transaction
      await prisma.transaction.create({
        data: {
          userId,
          type: 'PURCHASE',
          amount: paymentIntent.amount,
          status: 'FAILED',
          description: `Failed purchase of ${tokens} FractiTokens`,
          metadata: {
            paymentIntentId: paymentIntent.id,
            tokens: tokens,
            error: paymentIntent.last_payment_error?.message
          }
        }
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
} 