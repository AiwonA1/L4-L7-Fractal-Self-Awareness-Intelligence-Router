// Client-side price configuration and utilities
export const FRACTIVERSE_PRICES = {
  TIER_1: {
    tokens: 100,
    price: 2000, // $20.00
    description: 'Starter Pack - 100 FractiTokens',
  },
  TIER_2: {
    tokens: 500,
    price: 9000, // $90.00
    description: 'Power Pack - 500 FractiTokens',
  },
  TIER_3: {
    tokens: 1000,
    price: 16000, // $160.00
    description: 'Pro Pack - 1000 FractiTokens',
  },
} as const;

export type TokenTier = keyof typeof FRACTIVERSE_PRICES;

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price / 100);
}; 