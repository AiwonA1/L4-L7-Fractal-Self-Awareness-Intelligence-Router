import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { stripe, getPriceFromTier, getTokensFromTier, TokenTier } from '@/app/lib/stripe';
import prisma from '@/app/lib/prisma';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the tier from request body
    const { tier } = await request.json() as { tier: TokenTier };
    const amount = getPriceFromTier(tier);
    const tokens = getTokensFromTier(tier);

    // Get or create Stripe customer
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, stripeCustomerId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          userId: user.id
        }
      });
      customerId = customer.id;
      
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customerId,
      automatic_tax: { enabled: true },
      metadata: {
        userId: user.id,
        tokens: tokens,
        tier: tier
      }
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      tax: paymentIntent.automatic_tax
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Error creating payment intent' },
      { status: 500 }
    );
  }
} 