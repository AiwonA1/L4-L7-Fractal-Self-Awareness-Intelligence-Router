import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { TokenTier } from '@/app/lib/stripe';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export const dynamic = 'force-dynamic'

async function addTokensToUser(userId: string, tokenAmount: number) {
  return prisma.$transaction(async (tx) => {
    // Update user's token balance
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        tokenBalance: {
          increment: tokenAmount
        }
      }
    });

    // Create transaction record
    await tx.transaction.create({
      data: {
        userId,
        type: 'PURCHASE',
        amount: tokenAmount,
        description: `Purchased ${tokenAmount} tokens`,
        status: 'COMPLETED'
      }
    });

    return user;
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  try {
    const event = stripeInstance.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, tokenAmount } = session.metadata!;

      await addTokensToUser(userId, parseInt(tokenAmount));
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      const userId = paymentIntent.metadata.userId;
      const tokens = parseInt(paymentIntent.metadata.tokens);

      // Record the failed transaction
      await prisma.transaction.create({
        data: {
          userId,
          type: 'PURCHASE',
          amount: tokens,
          status: 'FAILED',
          description: `Failed purchase of ${tokens} FractiTokens - ${paymentIntent.last_payment_error?.message || 'Unknown error'}`
        }
      });
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