import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { NextRequest } from 'next/server'

// Helper to get IP address from request headers
export function getIp(req: NextRequest): string | null {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim(); // Get the first IP if multiple
    }
    const realIp = req.headers.get('x-real-ip');
    if (realIp) {
        return realIp.trim();
    }
    // Fallback to connection remoteAddress if available (less reliable behind proxies)
    // Note: req.ip is often undefined in Next.js Edge/Serverless
    // return req.ip ?? null; 
    return null; // Return null if IP cannot be determined reliably
}

// Ensure Upstash environment variables are set in your .env file
const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

let redis: Redis | null = null;
let apiLimiter: Ratelimit | { limit: (id: string) => Promise<{ success: boolean }> };
let authLimiter: Ratelimit | { limit: (id: string) => Promise<{ success: boolean }> };
let paymentLimiter: Ratelimit | { limit: (id: string) => Promise<{ success: boolean }> };

if (redisUrl && redisToken) {
  redis = new Redis({
    url: redisUrl,
    token: redisToken,
  })

  // Production rate limiters
  apiLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '60 s'), // 100 requests per 60 seconds
    prefix: 'ratelimit:api',
  })

  authLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '60 s'), // 5 requests per 60 seconds
    prefix: 'ratelimit:auth',
  })

  paymentLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '60 s'), // 10 requests per 60 seconds
      prefix: 'ratelimit:payment',
  })

} else {
  console.warn('Upstash Redis environment variables not set. Using mock rate limiter.')
  // Mock rate limiter for development or if Redis is not configured
  const mockLimiter = { limit: async (id: string) => ({ success: true }) };
  apiLimiter = mockLimiter;
  authLimiter = mockLimiter;
  paymentLimiter = mockLimiter;
}

export type LimiterType = 'api' | 'auth' | 'payment'

export async function rateLimitCheck(identifier: string, type: LimiterType): Promise<{ success: boolean }> {
  const limiter = {
    'api': apiLimiter,
    'auth': authLimiter,
    'payment': paymentLimiter,
  }[type]

  if (!limiter) {
    console.error(`Invalid rate limiter type: ${type}`);
    return { success: false }; // Or handle as appropriate
  }

  try {
      return await limiter.limit(identifier);
  } catch (error) {
      console.error(`Rate limit check failed for type ${type}:`, error);
      // Fail open or closed depending on security requirements
      // Failing open here for simplicity, but consider failing closed in production.
      return { success: true }; 
  }
} 