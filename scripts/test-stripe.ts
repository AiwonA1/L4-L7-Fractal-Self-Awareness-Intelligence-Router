const { stripe } = require('../app/lib/stripe');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testStripeIntegration() {
  console.log('🧪 Running Stripe Integration Tests...\n');

  try {
    // Test 1: Verify API Key and Connection
    console.log('Test 1: Verifying Stripe API Connection');
    const account = await stripe.accounts.retrieve();
    console.log('✓ Successfully connected to Stripe');
    console.log('✓ Account:', account.id);
    console.log('✓ Account type:', account.type);
    console.log('✓ Account country:', account.country);
    console.log();

    // Test 2: Verify Price IDs
    console.log('Test 2: Verifying Price IDs');
    const priceIds = [
      process.env.STRIPE_PRICE_ID_TIER_1,
      process.env.STRIPE_PRICE_ID_TIER_2,
      process.env.STRIPE_PRICE_ID_TIER_3,
    ];

    await Promise.all(priceIds.map(async (priceId, index) => {
      if (!priceId) {
        throw new Error(`Missing STRIPE_PRICE_ID_TIER_${index + 1} in environment variables`);
      }

      const price = await stripe.prices.retrieve(priceId);
      console.log(`✓ Tier ${index + 1} Price:`, {
        id: price.id,
        active: price.active,
        currency: price.currency,
        unit_amount: price.unit_amount,
        nickname: price.nickname,
      });
    }));
    console.log();

    // Test 3: Test Customer Operations
    console.log('Test 3: Testing Customer Operations');
    const customer = await stripe.customers.create({
      email: 'test@example.com',
      metadata: { test: 'true' },
    });
    console.log('✓ Created test customer:', customer.id);

    const updatedCustomer = await stripe.customers.update(customer.id, {
      metadata: { test: 'true', updated: 'true' },
    });
    console.log('✓ Updated test customer:', updatedCustomer.id);

    await stripe.customers.del(customer.id);
    console.log('✓ Deleted test customer');
    console.log();

    // Test 4: Test Checkout Session Creation
    console.log('Test 4: Testing Checkout Session Creation');
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRICE_ID_TIER_1,
        quantity: 1,
      }],
      success_url: 'http://localhost:3000/dashboard?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/dashboard',
      metadata: { test: 'true' },
    });
    console.log('✓ Created test checkout session:', session.id);
    console.log('✓ Session URL:', session.url);
    console.log();

    // Test 5: Verify Webhook Endpoint
    console.log('Test 5: Verifying Webhook Endpoint');
    const webhooks = await stripe.webhookEndpoints.list({ limit: 5 });
    console.log('✓ Found', webhooks.data.length, 'webhook endpoints');
    for (const webhook of webhooks.data) {
      console.log('  Webhook:', {
        id: webhook.id,
        url: webhook.url,
        status: webhook.status,
        events: webhook.enabled_events,
      });
    }
    console.log();

    console.log('✅ All Stripe integration tests passed!\n');

  } catch (error) {
    console.error('\n❌ Stripe test failed:', error);
    process.exit(1);
  }
}

// Run the tests
testStripeIntegration().catch(console.error); 