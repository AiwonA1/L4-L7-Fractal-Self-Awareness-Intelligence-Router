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
    price: 2000, // $20.00
    priceId: process.env.STRIPE_PRICE_100_TOKENS,
    description: 'Starter Pack - 100 FractiTokens',
  },
  TIER_2: {
    tokens: 500,
    price: 9000, // $90.00
    priceId: process.env.STRIPE_PRICE_500_TOKENS,
    description: 'Power Pack - 500 FractiTokens',
  },
  TIER_3: {
    tokens: 1000,
    price: 16000, // $160.00
    priceId: process.env.STRIPE_PRICE_1000_TOKENS,
    description: 'Pro Pack - 1000 FractiTokens',
  },
} as const;

export type TokenTier = keyof typeof FRACTIVERSE_PRICES;

export const getPriceFromTier = (tier: TokenTier): number => {
  return FRACTIVERSE_PRICES[tier].price;
};

export const getTokensFromTier = (tier: TokenTier): number => {
  return FRACTIVERSE_PRICES[tier].tokens;
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price / 100);
};

export function getPriceIdFromTier(tier: TokenTier): string | undefined {
  return FRACTIVERSE_PRICES[tier].priceId;
} 