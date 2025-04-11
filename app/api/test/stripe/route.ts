import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/app/lib/stripe';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  console.log('🧪 Testing Stripe integration...');

  try {
    // 1. Verify Stripe configuration
    console.log('1️⃣ Verifying Stripe configuration...');
    const config = {
      apiVersion: '2023-10-16', // Latest stable version
      host: process.env.STRIPE_API_HOST || 'api.stripe.com',
    };
    console.log('✓ Stripe config:', config);

    // 2. List configured prices
    console.log('2️⃣ Fetching configured prices...');
    const prices = await stripe.prices.list({
      limit: 5,
      active: true,
    });
    console.log('✓ Available prices:', prices.data.map(p => ({
      id: p.id,
      amount: p.unit_amount,
      currency: p.currency,
    })));

    // 3. Create a test customer
    console.log('3️⃣ Creating test customer...');
    const customer = await stripe.customers.create({
      email: 'test@example.com',
      metadata: {
        test: 'true',
      },
    });
    console.log('✓ Test customer created:', customer.id);

    // 4. Create a test checkout session
    console.log('4️⃣ Creating test checkout session...');
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRICE_ID_TIER_1,
        quantity: 1,
      }],
      success_url: `${request.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/dashboard`,
      metadata: {
        test: 'true',
      },
    });
    console.log('✓ Test session created:', session.id);

    // 5. Clean up test data
    console.log('5️⃣ Cleaning up test customer...');
    await stripe.customers.del(customer.id);
    console.log('✓ Test customer deleted');

    return NextResponse.json({
      success: true,
      details: {
        config,
        prices: prices.data.map(p => ({
          id: p.id,
          amount: p.unit_amount,
          currency: p.currency,
        })),
        testSession: {
          id: session.id,
          url: session.url,
        },
      },
    });

  } catch (error) {
    console.error('❌ Stripe test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 