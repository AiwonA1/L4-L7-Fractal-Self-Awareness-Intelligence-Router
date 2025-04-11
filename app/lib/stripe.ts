import Stripe from 'stripe';
import { FRACTIVERSE_PRICES, TokenTier } from './stripe-client';

// This file should only be imported on the server side
if (typeof window !== 'undefined') {
  throw new Error('This file should only be imported on the server side');
}

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Maps tier to Stripe price ID from environment variables
export const getPriceIdFromTier = (tier: TokenTier): string => {
  const priceId = {
    TIER_1: process.env.STRIPE_PRICE_100_TOKENS,
    TIER_2: process.env.STRIPE_PRICE_500_TOKENS,
    TIER_3: process.env.STRIPE_PRICE_1000_TOKENS,
  }[tier];

  if (!priceId) {
    throw new Error(`No Stripe price ID configured for tier ${tier}`);
  }

  return priceId;
};

// Get price amount in cents for a tier
export const getPriceFromTier = (tier: TokenTier): number => {
  return FRACTIVERSE_PRICES[tier].price;
};

// Get token amount for a tier
export const getTokensFromTier = (tier: TokenTier): number => {
  return FRACTIVERSE_PRICES[tier].tokens;
}; 