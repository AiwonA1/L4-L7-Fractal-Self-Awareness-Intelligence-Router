import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase/supabase-admin'

// Stripe webhook handler
export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature') as string
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )
  } catch (error: any) {
    console.error('Error verifying webhook signature:', error.message)
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 })
  }
  
  // Handle the event
  try {
    // --- Handle PaymentIntent Succeeded --- 
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      
      // Extract user and token information from PaymentIntent metadata
      const userId = paymentIntent.metadata?.userId
      const tokenAmountStr = paymentIntent.metadata?.tokens
      
      if (!userId || !tokenAmountStr) {
        console.error('Webhook Error: Missing metadata (userId or tokens) in PaymentIntent:', paymentIntent.id)
        // Return 200 OK to Stripe to acknowledge receipt, but log error
        return NextResponse.json({ received: true, error: 'Missing metadata' })
      }
      
      const tokens = parseInt(tokenAmountStr, 10)
      if (isNaN(tokens) || tokens <= 0) {
         console.error('Webhook Error: Invalid token amount in PaymentIntent metadata:', paymentIntent.id, tokenAmountStr)
        return NextResponse.json({ received: true, error: 'Invalid metadata' })
      }
      
      console.log(`Processing successful payment intent ${paymentIntent.id} for user ${userId}, adding ${tokens} tokens.`);
      
      // --- Add tokens to user's balance --- 
      // Assume 'token_balance' is the correct column and 'increment_tokens' RPC exists
      const { error: updateError } = await supabaseAdmin.rpc('increment_tokens', {
         p_user_id: userId,
         p_amount: tokens
      })
      
      if (updateError) {
        console.error(`CRITICAL: Failed to update token balance for user ${userId} after PaymentIntent ${paymentIntent.id}. Error: ${updateError.message}`);
        // Depending on policy, you might want to retry or flag this user
        // Return 500 to indicate failure to process *after* acknowledging receipt
        return NextResponse.json({ error: 'Failed to update user balance after payment.' }, { status: 500 });
      }
      
      console.log(`Successfully added ${tokens} tokens to user ${userId}.`);
      
      // --- Transaction Logging (Optional/Future) --- 
      // TODO: If needed, insert a 'PURCHASE' transaction record here.
      // Link it using userId and potentially paymentIntent.id.
      // Example:
      /*
      const { error: transactionError } = await supabaseAdmin
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'PURCHASE',
          amount: tokens,
          description: `Purchase via PaymentIntent: ${paymentIntent.id}`,
          status: 'COMPLETED',
          stripe_payment_intent_id: paymentIntent.id // Example linkage
        });
      if (transactionError) {
          console.error(`Webhook Warning: Failed to record transaction for PaymentIntent ${paymentIntent.id}. Error: ${transactionError.message}`);
          // Don't fail the webhook for this, but log it.
      }
      */
      
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.warn(`PaymentIntent ${paymentIntent.id} failed for user ${paymentIntent.metadata?.userId}. Reason: ${paymentIntent.last_payment_error?.message}`);
      // Optionally log failed transaction attempt
      
    } else {
      // Handle other event types if needed
      console.log(`Unhandled webhook event type: ${event.type}`);
    }
    
    // Return 200 OK to Stripe
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Error processing webhook event:', error);
    const message = error instanceof Error ? error.message : 'Unknown processing error';
    // Return 500 for internal processing errors
    return NextResponse.json(
      { error: `Webhook processing error: ${message}` },
      { status: 500 }
    )
  }
}

// Ensure the handler runs with Node.js runtime if needed for Stripe SDK
export const runtime = 'nodejs' 