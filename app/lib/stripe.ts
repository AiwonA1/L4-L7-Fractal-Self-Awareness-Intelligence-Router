import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const FRACTIVERSE_PRICES = {
  TIER_1: {
    tokens: 100,
    price: 2000, // in cents
    priceId: process.env.STRIPE_PRICE_100_TOKENS,
  },
  TIER_2: {
    tokens: 500,
    price: 9000, // in cents
    priceId: process.env.STRIPE_PRICE_500_TOKENS,
  },
  TIER_3: {
    tokens: 1000,
    price: 16000, // in cents
    priceId: process.env.STRIPE_PRICE_1000_TOKENS,
  },
} as const;

export type TokenTier = keyof typeof FRACTIVERSE_PRICES;

export function getPriceFromTier(tier: TokenTier): number {
  return FRACTIVERSE_PRICES[tier].price;
}

export function getTokensFromTier(tier: TokenTier): number {
  return FRACTIVERSE_PRICES[tier].tokens;
}

export function getPriceIdFromTier(tier: TokenTier): string | undefined {
  return FRACTIVERSE_PRICES[tier].priceId;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
} 